import { AppDataSource } from '../config/configDb.js';
import { ProductoEntity } from '../entities/producto.entity.js';


const productoRepository = AppDataSource.getRepository(ProductoEntity);

// obtener todos los productos para la tablet del cliente
export async function obtenerProductos(req, res) {
    try {
        const productos = await productoRepository.find();
        
        const productosFormateados = productos.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            categoria: p.categoria,
            controlaStock: p.controlaStock ?? true,
            imagen: p.imagenUrl || 'https://via.placeholder.com/60'
        }));

        return res.status(200).json(productosFormateados); // Retornamos directo el arreglo para el .map() de React
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
        const { nombre, precio, categoria, controlaStock } = req.body;

        // validar que vengan los datos obligatorios
        if (!nombre || !precio || !categoria) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan campos obligatorios (nombre, precio o categoria)"
            });
        }

        let urlFinal = 'https://via.placeholder.com/60';
        if (req.file) {
            urlFinal = `http://localhost:3000/uploads/${req.file.filename}`;
        }

        const nuevoProducto = productoRepository.create({
            nombre,
            precio: Number(precio),
            categoria: categoria || 'empanadas',
            controlaStock: controlaStock === 'true' || controlaStock === true,
            disponible: true,
            stock: 0,
            imagenUrl: urlFinal
        });

        await productoRepository.save(nuevoProducto);

        return res.status(201).json({
            id: nuevoProducto.id,
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            categoria: nuevoProducto.categoria,
            controlaStock: nuevoProducto.controlaStock,
            imagen: nuevoProducto.imagenUrl
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