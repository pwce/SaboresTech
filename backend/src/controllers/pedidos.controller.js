// pedidos.controller.js
import { AppDataSource } from '../config/configDb.js';
import { PedidoEntity } from '../entities/pedido.entity.js';
import { DetallePedidoEntity } from '../entities/detallePedido.entity.js';
import { ProductoEntity } from '../entities/producto.entity.js';
import { JornadaEntity } from '../entities/jornada.entity.js';

const pedidoRepository = AppDataSource.getRepository(PedidoEntity);
const detalleRepository = AppDataSource.getRepository(DetallePedidoEntity);
const productoRepository = AppDataSource.getRepository(ProductoEntity);
const jornadaRepository = AppDataSource.getRepository(JornadaEntity);


export async function crearPedido(req, res) {
    try {

        const { usuario_id, metodoPago, tipoServicio, productos } = req.body;

        if (!metodoPago || !productos || productos.length === 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan datos obligatorios o el carrito está vacío"
            });
        }

        const jornadaActiva = await jornadaRepository.findOne({
            where: { activa: true },
            order: { id: 'DESC' }
        });
        if (!jornadaActiva) {
            return res.status(400).json({
                success: false,
                mensaje: "No hay ninguna jornada activa en este momento. No es posible generar pedidos."
            });
        }

        const insumos = jornadaActiva.insumosDisponibles || {};
        insumos.envases = insumos.envases || { vasos: 0, tapas: 0, bombillas: 0 };

        let totalPedido = 0;
        let envasesNecesarios = 0; 
        const listaDetallesA_Guardar = [];

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

            if (prodReal.controlaStock) {
                // producto con stock fijo (pizzas, empanadas, bebidas en lata, etc.)
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
            } else if (prodReal.categoria === 'Bebestibles') {
                envasesNecesarios += item.cantidad;
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

        // descontar envases si el pedido incluye bebestibles sin stock fijo
        if (envasesNecesarios > 0) {
            const { vasos, tapas, bombillas } = insumos.envases;
            if (Number(vasos) < envasesNecesarios || Number(tapas) < envasesNecesarios || Number(bombillas) < envasesNecesarios) {
                return res.status(400).json({
                    success: false,
                    mensaje: "No quedan suficientes vasos, tapas y/o bombillas para preparar este pedido."
                });
            }
            insumos.envases.vasos = Number(vasos) - envasesNecesarios;
            insumos.envases.tapas = Number(tapas) - envasesNecesarios;
            insumos.envases.bombillas = Number(bombillas) - envasesNecesarios;

            jornadaActiva.insumosDisponibles = insumos;
            await jornadaRepository.save(jornadaActiva);
        }

        const pedidosDeLaJornada = await pedidoRepository.count({
            where: { jornada: { id: jornadaActiva.id } }
        });
        const nuevoNumeroJornada = pedidosDeLaJornada + 1;

        // el pedido nace pendiente de pago; el atendedor lo valida desde el modulo de Pagos, excepto tarjeta que la propia POS confirma al momento
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
            tipoServicio: tipoServicio || null,
            estadoPago: estadoPagoInicial,
            estadoCocina: estadoCocinaInicial,
            montoRecibido: 0,
            vuelto: 0,
            jornada: { id: jornadaActiva.id },
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
            vuelto: 0
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

export async function obtenerPedidoPorId(req, res) {
    try {
        const { id } = req.params;
        const pedido = await pedidoRepository.findOneBy({ id: Number(id) });

        if (!pedido) {
            return res.status(404).json({ success: false, mensaje: "El pedido no existe" });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: pedido.id,
                numeroJornada: pedido.numeroJornada,
                estadoPago: pedido.estadoPago,
                estadoCocina: pedido.estadoCocina,
                vuelto: pedido.vuelto,
                total: pedido.total,
            }
        });
    } catch (error) {
        console.error("Error en obtenerPedidoPorId:", error);
        return res.status(500).json({ success: false, mensaje: "Error al consultar el pedido" });
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
            if (!['pendiente', 'validado', 'rechazado'].includes(nuevoEstadoPago)) {
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
 
            if (nuevoEstadoPago === 'rechazado') {
                pedido.estadoPago = 'rechazado';
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
