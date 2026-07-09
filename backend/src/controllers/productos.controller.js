import { AppDataSource } from '../config/configDb.js';
import { ProductoEntity } from '../entities/producto.entity.js';


const productoRepository = AppDataSource.getRepository(ProductoEntity);

// obtener todos los productos para la tablet del cliente
export async function obtenerProductos(req, res) {
    try {
        const productos = await productoRepository.find();
        
        return res.status(200).json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error("Error en obtenerProductos:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al obtener los productos de la base de datos"
        });
    }
}

// crear un nuevo producto
export async function crearProducto(req, res) {
    try {
        const { nombre, precio, category, disponible, imagenUrl } = req.body;

        // validar que vengan los datos obligatorios
        if (!nombre || !precio || !category) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan campos obligatorios (nombre, precio o categoria)"
            });
        }

        const nuevoProducto = productoRepository.create({
            nombre,
            precio,
            categoria: category, // Mapea 'category' del body a 'categoria' de tu entidad
            disponible,
            imagenUrl: imagenUrl || null // Agregamos la URL opcional
        });

        // guardar en la base de datos
        await productoRepository.save(nuevoProducto);

        return res.status(201).json({
            success: true,
            mensaje: "Producto creado exitosamente",
            data: nuevoProducto
        });
    } catch (error) {
        console.error("Error en crearProducto:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error al guardar el producto"
        });
    }
}

// actualizar producto existente
export async function actualizarProducto(req, res) {
    try {
        const { id } = req.params; 
        const { nombre, precio, category, disponible, imagenUrl } = req.body; 

        // buscar si el producto realmente existe
        const producto = await productoRepository.findOneBy({ id: Number(id) });
        if (!producto) {
            return res.status(404).json({
                success: false,
                mensaje: "El producto que intentas actualizar no existe"
            });
        }

        // aplicar los cambios de forma inteligente (si vienen en la peticion)
        if (nombre !== undefined) producto.nombre = nombre;
        if (precio !== undefined) producto.precio = precio;
        if (category !== undefined) producto.categoria = category;
        if (disponible !== undefined) producto.disponible = disponible;
        if (imagenUrl !== undefined) producto.imagenUrl = imagenUrl; // Soporte de actualización de imagen

        // se guardan los cambios
        await productoRepository.save(producto);

        return res.status(200).json({
            success: true,
            mensaje: "Producto actualizado con éxito",
            data: producto
        });
    } catch (error) {
        console.error("Error en actualizarProducto:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al actualizar el producto"
        });
    }
}

// eliminar producto de forma física
export async function eliminarProducto(req, res) {
    try {
        const { id } = req.params;

        // buscar si existe antes de borrar
        const producto = await productoRepository.findOneBy({ id: Number(id) });
        if (!producto) {
            return res.status(404).json({
                success: false,
                mensaje: "El producto que intentas eliminar no existe"
            });
        }

        await productoRepository.remove(producto);

        return res.status(200).json({
            success: true,
            mensaje: `El producto '${producto.nombre}' fue eliminado exitosamente`
        });
    } catch (error) {
        console.error("Error en eliminarProducto:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al intentar eliminar el producto"
        });
    }
}