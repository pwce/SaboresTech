// insumos.controller.js
import { AppDataSource } from '../config/configDb.js';
import { InsumoEntity } from '../entities/insumo.entity.js';

const insumoRepository = AppDataSource.getRepository(InsumoEntity);

export async function obtenerInsumos(req, res) {
    try {
        const insumos = await insumoRepository.find({
            order: { nombre: 'ASC' } // para ordenar alfabeticamente
        });
        return res.status(200).json({
            success: true,
            data: insumos
        });
    } catch (error) {
        console.error("Error en obtenerInsumos:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error al obtener el inventario de insumos"
        });
    }
}


export async function crearInsumo(req, res) {
    try {
        const { nombre, cantidadActual, unidadMedida, disponible } = req.body;

        if (!nombre || unidadMedida === undefined) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre y la unidad de medida son obligatorios"
            });
        }

        // validar si ya existe el insumo para no duplicarlo
        const insumoExiste = await insumoRepository.findOneBy({ nombre });
        if (insumoExiste) {
            return res.status(400).json({
                success: false,
                mensaje: `El insumo '${nombre}' ya está registrado. Si compraste más, usa la opción de modificar.`
            });
        }

        const nuevoInsumo = insumoRepository.create({
            nombre,
            cantidadActual: cantidadActual || 0,
            unidadMedida: unidadMedida.toLowerCase(),
            disponible: disponible !== undefined ? disponible : true
        });

        await insumoRepository.save(nuevoInsumo);

        return res.status(201).json({
            success: true,
            mensaje: "Insumo registrado exitosamente en la bodega",
            data: nuevoInsumo
        });
    } catch (error) {
        console.error("Error en crearInsumo:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al registrar el insumo"
        });
    }
}


export async function actualizarInsumo(req, res) {
    try {
        const { id } = req.params;
        const { nombre, cantidadActual, unidadMedida, disponible } = req.body;

        const insumo = await insumoRepository.findOneBy({ id: Number(id) });
        if (!insumo) {
            return res.status(404).json({
                success: false,
                mensaje: "El insumo especificado no existe"
            });
        }

        if (nombre !== undefined) insumo.nombre = nombre;
        if (cantidadActual !== undefined) insumo.cantidadActual = cantidadActual;
        if (unidadMedida !== undefined) insumo.unidadMedida = unidadMedida.toLowerCase();
        if (disponible !== undefined) insumo.disponible = disponible;
        
        await insumoRepository.save(insumo);

        return res.status(200).json({
            success: true,
            mensaje: "Insumo actualizado con éxito",
            data: insumo
        });
    } catch (error) {
        console.error("Error en actualizarInsumo:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al modificar el insumo"
        });
    }
}


export async function eliminarInsumo(req, res) {
    try {
        const { id } = req.params;

        const insumo = await insumoRepository.findOneBy({ id: Number(id) });
        if (!insumo) {
            return res.status(404).json({
                success: false,
                mensaje: "El insumo que intentas eliminar no existe"
            });
        }

        await insumoRepository.remove(insumo);

        return res.status(200).json({
            success: true,
            mensaje: `El insumo '${insumo.nombre}' fue removido de la bodega`
        });
    } catch (error) {
        console.error("Error en eliminarInsumo:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al intentar eliminar el insumo"
        });
    }
}