// jornada.controller.js
import { AppDataSource } from '../config/configDb.js';
import { JornadaEntity } from '../entities/jornada.entity.js';
import { ProductoEntity } from '../entities/producto.entity.js';


const jornadaRepository = AppDataSource.getRepository(JornadaEntity);

function obtenerFechaHoraChile() {
    const ahora = new Date();
    const opciones = { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formateador = new Intl.DateTimeFormat('es-CL', opciones);
    const [{ value: dia }, , { value: mes }, , { value: anio }, , { value: hora }, , { value: minuto }, , { value: segundo }] = formateador.formatToParts(ahora);
    
    return new Date(`${anio}-${mes}-${dia}T${hora}:${minuto}:${segundo}`);
}

// para los jugos y milkshakes
export async function obtenerJornadaActiva(req, res) {
    try {
        const jornada = await jornadaRepository.findOne({
            where: { activa: true },
            order: { id: 'DESC' }
        });

        if (!jornada) {
            return res.status(200).json({
                success: true,
                mensaje: "No hay una jornada activa actualmente.",
                data: null
            });
        }

        return res.status(200).json({
            success: true,

            data: {
                id: jornada.id,
                fechaInicio: jornada.fechaInicio,
                fechaFin: jornada.fechaFin,
                activa: jornada.activa,
                insumos: jornada.insumosDisponibles
            }
        });
    } catch (error) {
        console.error("Error al obtener la jornada activa:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al obtener la jornada activa"
        });
    }
}

export async function guardarJornada(req, res) {
    try {
        const { insumosDisponibles, productosSeleccionados } = req.body; 

        if (!insumosDisponibles) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan los datos de insumos para abrir la jornada."
            });
        }

        const fechaFinChile = obtenerFechaHoraChile();
        await jornadaRepository.update({ activa: true }, { activa: false, fechaFin: fechaFinChile });

        const productoRepository = AppDataSource.getRepository(ProductoEntity);
        
        await productoRepository
            .createQueryBuilder()
            .update(ProductoEntity)
            .set({ enJornada: false, stock: 0 })
            .execute();

        if (productosSeleccionados && Array.isArray(productosSeleccionados)) {
            for (const p of productosSeleccionados) {
                await productoRepository.update(
                    { id: Number(p.id) },
                    { enJornada: true, stock: p.stock != null ? Number(p.stock) : 0 }
              );
            }
        }

        const nuevaJornada = jornadaRepository.create({
            activa: true,
            fechaInicio: obtenerFechaHoraChile(),
            fechaFin: null,
            insumosDisponibles
        });

        await jornadaRepository.save(nuevaJornada);

        return res.status(201).json({
            success: true,
            mensaje: "¡Jornada de Sabores de Carolina iniciada con éxito y productos sincronizados!",
            data: nuevaJornada
        });
    } catch (error) {
        console.error("Error al iniciar la jornada:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al iniciar la jornada"
        });
    }
}


export async function finalizarJornada(req, res) {
    try {

        const jornadaActiva = await jornadaRepository.findOne({
            where: { activa: true },
            order: { id: 'DESC' }
        });

        if (!jornadaActiva) {
            return res.status(400).json({
                success: false,
                mensaje: "No hay ninguna jornada abierta en este momento que se pueda cerrar."
            });
        }

        jornadaActiva.activa = false;
        jornadaActiva.fechaFin = obtenerFechaHoraChile();

        await jornadaRepository.save(jornadaActiva);

        return res.status(200).json({
            success: true,
            mensaje: "¡Jornada finalizada y cerrada con éxito!",
            data: {
                id: jornadaActiva.id,
                fechaInicio: jornadaActiva.fechaInicio,
                fechaFin: jornadaActiva.fechaFin,
                activa: jornadaActiva.activa
            }
        });
    } catch (error) {
        console.error("Error al finalizar la jornada:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al finalizar la jornada"
        });
    }
}

export async function actualizarInsumosJornada(req, res) {
    try {
        const { insumosDisponibles } = req.body;

        const jornadaActiva = await jornadaRepository.findOne({
            where: { activa: true },
            order: { id: 'DESC' }
        });

        if (!jornadaActiva) {
            return res.status(404).json({
                success: false,
                mensaje: "No hay una jornada activa que se pueda actualizar."
            });
        }

        jornadaActiva.insumosDisponibles = insumosDisponibles;
        await jornadaRepository.save(jornadaActiva);

        return res.status(200).json({
            success: true,
            mensaje: "¡Insumos de la jornada actualizados con éxito!",
            data: jornadaActiva
        });
    } catch (error) {
        console.error("Error al actualizar insumos de la jornada:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al actualizar los insumos de la jornada"
        });
    }
}