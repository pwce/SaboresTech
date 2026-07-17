// productos.controller.js 
import { AppDataSource } from '../config/configDb.js';
import { ProductoEntity } from '../entities/producto.entity.js';

const productoRepository = AppDataSource.getRepository(ProductoEntity);

export async function obtenerProductos(req, res) {
    try {
        const productos = await productoRepository.find({ order: { id: "ASC" } });
        const productosFormateados = productos.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            categoria: p.categoria,
            disponible: p.disponible,
            controlaStock: p.controlaStock,
            stock: p.stock,
            enJornada: p.enJornada ?? false,
            tipo: determinarTipoProducto(p.nombre),
            imagen: p.imagenUrl || 'https://via.placeholder.com/60'
        }));
        return res.status(200).json({
            success: true,
            data: productosFormateados});
    } catch (error) {
        console.error("Error en obtenerProductos:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al obtener los productos"
        });
    }
}    

export async function obtenerProductosJornada(req, res) {
    try {
        const productosDeHoy = await productoRepository.find({
            where: { 
                enJornada: true,
                disponible: true 
            }
        });

        const productosFormateados = productosDeHoy.map(p => ({
            id: `p-${p.id}`, 
            nombre: p.nombre,
            precio: p.precio,
            categoria: p.categoria, 
            tipo: determinarTipoProducto(p.nombre), 
            imagen: p.imagenUrl || null
        }));

        return res.status(200).json({
            success: true,
            data: productosFormateados
        });
    } catch (error) {
        console.error("Error al obtener productos de la jornada:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al cargar el menú del día"
        });
    }
}

export async function cambiarEstadoJornada(req, res) {
    try {
        const { id } = req.params;
        const { enJornada } = req.body; 

        const producto = await productoRepository.findOneBy({ id: Number(id) });
        if (!producto) {
            return res.status(404).json({
                success: false,
                mensaje: "El producto no existe"
            });
        }

        producto.enJornada = enJornada;
        await productoRepository.save(producto);

        return res.status(200).json({ 
            success: true,
            mensaje: "Disponibilidad diaria cambiada con éxito",
            data: producto 
        });
    } catch (error) {
        console.error("Error en cambiarEstadoJornada:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al cambiar el estado de la jornada"
        });
    }
}

function determinarTipoProducto(nombre) {
    const n = nombre.toLowerCase();
    if (n.includes("sandwich") || n.includes("sándwich")) return "sandwich";
    if (n.includes("jugo")) return "jugo";
    if (n.includes("milkshake")) return "milkshake";
    if (n.includes("frap")) return "frappe";
    return "simple"; 
}

// crear un nuevo producto
export async function crearProducto(req, res) {
    try {
        const { nombre, precio, categoria, controlaStock } = req.body;

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
            categoria: categoria || 'salado',
            controlaStock: controlaStock === 'true' || controlaStock === true,
            disponible: true,
            stock: 0,
            imagenUrl: urlFinal,
            enJornada: false
        });

        await productoRepository.save(nuevoProducto);

        return res.status(201).json({
            success: true,
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
        const { nombre, precio, categoria, controlaStock, disponible, imagenUrl, enJornada } = req.body; 

        const producto = await productoRepository.findOneBy({ id: Number(id) });
        if (!producto) {
            return res.status(404).json({
                success: false,
                mensaje: "El producto que intentas actualizar no existe"
            });
        }

        if (nombre !== undefined) producto.nombre = nombre;
        if (precio !== undefined) producto.precio = Number(precio);
        if (categoria !== undefined) producto.categoria = categoria;
        if (controlaStock !== undefined) producto.controlaStock = controlaStock === 'true' || controlaStock === true;
        if (disponible !== undefined) producto.disponible = disponible;
        if (enJornada !== undefined) producto.enJornada = enJornada;

        if (req.file) {
            producto.imagenUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        } else if (imagenUrl !== undefined) {
            producto.imagenUrl = imagenUrl;
        }

        await productoRepository.save(producto);

        return res.status(200).json({
            success: true,
            mensaje: "Producto actualizado con éxito",
            data: {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                categoria: producto.categoria,
                disponible: producto.disponible,
                controlaStock: producto.controlaStock,
                stock: producto.stock,
                enJornada: producto.enJornada ?? false,
                imagen: producto.imagenUrl || 'https://via.placeholder.com/60'
            }
        });
    } catch (error) {
        console.error("Error en actualizarProducto:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al actualizar el producto"
        });
    }
}

// actualizar solo el stock de un producto (usado desde el módulo de Jornada)
export async function actualizarStockProducto(req, res) {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || Number(stock) < 0 || Number(stock) > 150) {
            return res.status(400).json({
                success: false,
                mensaje: "El stock debe ser un número entre 0 y 150 unidades"
            });
        }

        const producto = await productoRepository.findOneBy({ id: Number(id) });
        if (!producto) {
            return res.status(404).json({
                success: false,
                mensaje: "El producto no existe"
            });
        }

        producto.stock = Number(stock);
        if (Number(stock) > 0) {
            producto.disponible = true;
        }
        await productoRepository.save(producto);

        return res.status(200).json({
            success: true,
            mensaje: "Stock actualizado con éxito",
            data: producto
        });
    } catch (error) {
        console.error("Error en actualizarStockProducto:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al actualizar el stock"
        });
    }
}

// eliminar producto de forma física
export async function eliminarProducto(req, res) {
    try {
        const { id } = req.params;
    
        const producto = await productoRepository.findOneBy({ id: Number(id) });
        if (!producto) {
            return res.status(404).json({
                success: false,
                mensaje: "El producto que intentas eliminar no existe"
            });
        }

        try {
            await productoRepository.remove(producto);
            return res.status(200).json({
                success: true,
                mensaje: `El producto '${producto.nombre}' fue eliminado exitosamente`
            });
        } catch (errorEliminar) {
            if (errorEliminar.code === '23503') {
                producto.disponible = false;
                producto.enJornada = false;
                await productoRepository.save(producto);
                return res.status(200).json({
                    success: true,
                    softDelete: true,
                    mensaje: `'${producto.nombre}' ya tiene pedidos registrados, así que no se puede borrar del todo sin perder ese historial. Se desactivó del catálogo y de la jornada de hoy.`
                });
            }
            throw errorEliminar;
        }
    } catch (error) {
        console.error("Error en eliminarProducto:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al intentar eliminar el producto"
        });
    }
}

