import { AppDataSource } from '../config/configDb.js';
import { PedidoEntity } from '../entities/pedido.entity.js';
import { DetallePedidoEntity } from '../entities/detallePedido.entity.js';
import { ProductoEntity } from '../entities/producto.entity.js';
import { MoreThanOrEqual } from 'typeorm';

const pedidoRepository = AppDataSource.getRepository(PedidoEntity);
const detalleRepository = AppDataSource.getRepository(DetallePedidoEntity);
const productoRepository = AppDataSource.getRepository(ProductoEntity);


export async function crearPedido(req, res) {
    try {
        
        const { usuario_id, metodoPago, productos, montoRecibido } = req.body; 
        
        if (!metodoPago || !productos || productos.length === 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan datos obligatorios o el carrito está vacío"
            });
        }

        let totalPedido = 0;
        const listaDetallesA_Guardar = [];

        // validar cada producto enviado y calcular los costos reales
        for (const item of productos) {
            const prodReal = await productoRepository.findOneBy({ id: Number(item.producto_id) });
            
            if (!prodReal) {
                return res.status(404).json({
                    success: false,
                    mensaje: `El producto con ID ${item.producto_id} no existe en el catálogo.`
                });
            }

            if (!prodReal.disponible) {
                return res.status(400).json({
                    success: false,
                    mensaje: `Lo sentimos, el producto '${prodReal.nombre}' ya no se encuentra disponible.`
                });
            }

            const categoriasConStockFijo = ['Pizzas', 'Sándwiches', 'Empanadas', 'Donas'];
            if (categoriasConStockFijo.includes(prodReal.categoria)) {
                if (prodReal.stock < item.cantidad) {
                    return res.status(400).json({
                        success: false,
                        mensaje: `Lo sentimos, solo quedan ${prodReal.stock} unidades de '${prodReal.nombre}'.`
                    });
                }
                

                prodReal.stock -= item.cantidad;

                if (prodReal.stock === 0) {
                    prodReal.disponible = false;
                }

                await productoRepository.save(prodReal);
            }

            const subtotal = prodReal.precio * item.cantidad;
            totalPedido += subtotal;


            listaDetallesA_Guardar.push({
                cantidad: item.cantidad,
                precioUnitario: prodReal.precio,
                producto: prodReal,
                personalizaciones: item.personalizaciones || '' 
            });
        }
        
        const inicioHoy = new Date();
        inicioHoy.setHours(0, 0, 0, 0); 

        const pedidosHoy = await pedidoRepository.count({
            where: {
                fecha: MoreThanOrEqual(inicioHoy)
            }
        });
        const nuevoNumeroJornada = pedidosHoy + 1;

        let vueltoCalculado = 0;
        let estadoPagoInicial = 'pendiente';
        let estadoCocinaInicial = 'en_espera';
        
        if (metodoPago === 'tarjeta') {
            estadoPagoInicial = 'validado';
            estadoCocinaInicial = 'en_preparacion';
        }

        const nuevoPedido = pedidoRepository.create({
            numeroJornada: nuevoNumeroJornada, 
            fecha: new Date(),                 
            total: totalPedido,
            metodoPago,
            estadoPago: estadoPagoInicial,
            estadoCocina: estadoCocinaInicial,
            montoRecibido: 0, 
            vuelto: 0,
            usuario: usuario_id ? { id: Number(usuario_id) } : null
        });
        await pedidoRepository.save(nuevoPedido);


        for (const detalle of listaDetallesA_Guardar) {
            const filaDetalle = detalleRepository.create({
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precioUnitario,
                producto: detalle.producto,
                personalizaciones: detalle.personalizaciones,
                pedido: nuevoPedido 
            });
            await detalleRepository.save(filaDetalle);
        }

        return res.status(201).json({
            success: true,
            mensaje: "¡Pedido enviado con éxito!",
            pedido_id: nuevoPedido.id,
            numeroJornada: nuevoNumeroJornada,
            total: totalPedido,
            vuelto: vueltoCalculado
        });

    } catch (error) {
        console.error("Error en crearPedido:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Hubo un error de servidor al procesar tu pedido"
        });
    }
}


export async function obtenerPedidos(req, res) {
    try {
        const { estadoCocina, estadoPago } = req.query;

        const whereFilters = {};
        if (estadoCocina) whereFilters.estadoCocina = estadoCocina;
        if (estadoPago) whereFilters.estadoPago = estadoPago;

        const pedidos = await pedidoRepository.find({
            where: whereFilters,
            relations: ['usuario'],
            order: { fecha: 'ASC' } 
        });
        
        const pedidosConDetalles = await Promise.all(pedidos.map(async (pedido) => {
            const detalles = await detalleRepository.find({
                where: { pedido: { id: pedido.id } },
                relations: ['producto']
            });
            return {
                ...pedido,
                productos: detalles
            };
        }));

        return res.status(200).json({
            success: true,
            data: pedidosConDetalles
        });
    } catch (error) {
        console.error("Error en obtenerPedidos:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error al cargar la lista de pedidos"
        });
    }
}


export async function cambiarEstadoPedido(req, res) {
    try {
        const { id } = req.params;
        const { nuevoEstado, nuevoEstadoPago, montoRecibido, metodoPago } = req.body;

        const pedido = await pedidoRepository.findOneBy({ id: Number(id) });
        if (!pedido) {
            return res.status(404).json({
                success: false,
                mensaje: "El pedido especificado no existe"
            });
        }

        // manejo del estado de cocina 
        if (nuevoEstado) {
            const estadosCocinaValidos = ['en_espera', 'en_preparacion', 'listo', 'entregado'];
            if (!estadosCocinaValidos.includes(nuevoEstado)) {
                return res.status(400).json({
                    success: false,
                    mensaje: "Estado de cocina no válido. Use: 'en_espera', 'en_preparacion', 'listo' o 'entregado'"
                });
            }
            pedido.estadoCocina = nuevoEstado;
        }

        // manejo del estado de pago
        if (nuevoEstadoPago) {
            if (!['pendiente', 'validado'].includes(nuevoEstadoPago)) {
                return res.status(400).json({ success: false, mensaje: "Estado de pago no válido." });
            }

            if (nuevoEstadoPago === 'validado') {
                const metodo = metodoPago || pedido.metodoPago;
                if (metodo === 'efectivo') {
                    const efectivo = montoRecibido !== undefined ? montoRecibido : pedido.montoRecibido;
                    if (efectivo < pedido.total) {
                        return res.status(400).json({
                            success: false,
                            mensaje: `Efectivo insuficiente. Total del pedido es $${pedido.total}`
                        });
                    }
                    pedido.montoRecibido = efectivo;
                    pedido.vuelto = efectivo - pedido.total;
                }
                pedido.estadoPago = 'validado';
                pedido.estadoCocina = 'en_preparacion';
            }
        }

        await pedidoRepository.save(pedido);

        return res.status(200).json({
            success: true,
            mensaje: `El pedido #${pedido.numeroJornada} fue actualizado con éxito`,
            data: pedido
        });
    } catch (error) {
        console.error("Error en cambiarEstadoPedido:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el estado del pedido"
        });
    }
}