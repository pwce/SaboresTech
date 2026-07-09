import { AppDataSource } from '../config/configDb.js';
import { PedidoEntity } from '../entities/pedido.entity.js';
import { DetallePedidoEntity } from '../entities/detallePedido.entity.js';
import { ProductoEntity } from '../entities/producto.entity.js';

const pedidoRepository = AppDataSource.getRepository(PedidoEntity);
const detalleRepository = AppDataSource.getRepository(DetallePedidoEntity);
const productoRepository = AppDataSource.getRepository(ProductoEntity);

// CREAR UN NUEVO PEDIDO DESDE LA TABLET DE AUTOSERVICIO
export async function crearPedido(req, res) {
    try {
        // se añadió 'montoRecibido' por si paga en efectivo de inmediato
        const { usuario_id, metodoPago, productos, montoRecibido } = req.body; 
        
        if (!metodoPago || !productos || productos.length === 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan datos obligatorios o el carrito está vacío"
            });
        }

        let totalPedido = 0;
        const listaDetallesA_Guardar = [];

        // validar cada producto enviado y calcular los costos reales desde la base de datos
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

            // CONTROL DE STOCK DIARIO (Pizzas, Sándwiches, Empanadas)
            const categoriasConStockFijo = ['Pizzas', 'Sándwiches', 'Empanadas', 'Donas'];
            if (categoriasConStockFijo.includes(prodReal.categoria)) {
                if (prodReal.stock < item.cantidad) {
                    return res.status(400).json({
                        success: false,
                        mensaje: `Lo sentimos, solo quedan ${prodReal.stock} unidades de '${prodReal.nombre}'.`
                    });
                }
                
                // se descuentan las unidades del stock del producto
                prodReal.stock -= item.cantidad;

                // Si se agota por completo, lo apagamos automáticamente para el autoservicio
                if (prodReal.stock === 0) {
                    prodReal.disponible = false;
                }

                await productoRepository.save(prodReal);
            }

            const subtotal = prodReal.precio * item.cantidad;
            totalPedido += subtotal;

            // preparar el registro del detalle incluyendo las personalizaciones enviadas
            listaDetallesA_Guardar.push({
                cantidad: item.cantidad,
                precioUnitario: prodReal.precio,
                producto: prodReal,
                personalizaciones: item.personalizaciones || '' 
            });
        }

        // lógica inteligente de vuelto y estados financieros iniciales
        let vueltoCalculado = 0;
        let estadoPagoInicial = 'pendiente';
        let estadoCocinaInicial = 'en_espera';

        if (metodoPago === 'efectivo' && montoRecibido !== undefined) {
            if (montoRecibido < totalPedido) {
                return res.status(400).json({
                    success: false,
                    mensaje: `El monto recibido ($${montoRecibido}) es menor al total de $${totalPedido}`
                });
            }
            vueltoCalculado = montoRecibido - totalPedido;
            estadoPagoInicial = 'validado'; // Si pagó completo en efectivo, queda validado
            estadoCocinaInicial = 'en_preparacion'; // Pasa directo a cocinarse
        } else if (metodoPago === 'tarjeta' || metodoPago === 'transferencia') {
            // Tarjeta y transferencia asumen validación inmediata si pasan por pasarela/confirmación
            estadoPagoInicial = 'validado';
            estadoCocinaInicial = 'en_preparacion';
        }

        // guardar la cabecera del pedido general con los nuevos campos
        const nuevoPedido = pedidoRepository.create({
            total: totalPedido,
            metodoPago,
            estadoPago: estadoPagoInicial,
            estadoCocina: estadoCocinaInicial,
            montoRecibido: montoRecibido || 0,
            vuelto: vueltoCalculado,
            usuario: usuario_id ? { id: Number(usuario_id) } : null
        });
        await pedidoRepository.save(nuevoPedido);

        // guardar cada uno de los detalles enlazándolos al pedido recién creado
        for (const detalle of listaDetallesA_Guardar) {
            const filaDetalle = detalleRepository.create({
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precioUnitario,
                producto: detalle.producto,
                personalizaciones: detalle.personalizaciones, // Guardado en BD
                pedido: nuevoPedido 
            });
            await detalleRepository.save(filaDetalle);
        }

        return res.status(201).json({
            success: true,
            mensaje: "¡Pedido enviado con éxito!",
            pedido_id: nuevoPedido.id,
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

// OBTENER PEDIDOS (para la pantalla de la cocina o reportes)
export async function obtenerPedidos(req, res) {
    try {
        const pedidos = await pedidoRepository.find({
            relations: ['usuario'],
            order: { fecha: 'DESC' } 
        });

        // buscamos dinámicamente los detalles correspondientes a cada pedido para la visualización completa
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

// CAMBIAR ESTADO (para que el atendedor mueva el pedido en cocina o valide pagos pendientes)
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

        // 1. Manejo del estado de Cocina (Reemplaza los antiguos estados por los coherentes de negocio)
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

        // 2. Manejo del estado de Pago (Por si el pedido entra como 'pendiente' y el atendedor lo valida en caja)
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
            mensaje: `El pedido #${id} fue actualizado con éxito`,
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