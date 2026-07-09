import { AppDataSource } from '../config/configDb.js';
import { UsuarioEntity } from '../entities/usuario.entity.js';
import bcrypt from 'bcrypt';

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

export async function obtenerUsuarios(req, res) {
    try {
        
        const usuarios = await usuarioRepository.find({
            select: ['id', 'nombre', 'rut', 'rol']
        });
        
        return res.status(200).json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        console.error("Error en obtenerUsuarios:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error al obtener la lista de usuarios"
        });
    }
}

export async function crearUsuario(req, res) {
    try {
        const { nombre, rut, password, rol } = req.body;

        if (!nombre || !rol) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre y el rol son campos obligatorios"
            });
        }

        const rolLower = rol.toLowerCase();

        // si es atendedor o dueña, exigir el rut y contraseña obligatoriamente
        if (rolLower === 'dueña' || rolLower === 'atendedor') {
            if (!rut || !password) {
                return res.status(400).json({
                    success: false,
                    mensaje: `Para el rol de ${rolLower} es obligatorio ingresar RUT y contraseña/PIN`
                });
            }

            // comprobar si el rut ya esta ocupado
            const usuarioExiste = await usuarioRepository.findOneBy({ rut });
            if (usuarioExiste) {
                return res.status(400).json({
                    success: false,
                    mensaje: "El RUT ingresado ya está registrado"
                });
            }
        }

        let passwordFinal = null;
        if (rolLower !== 'cliente' && password) {
            const saltRounds = 10;
            passwordFinal = await bcrypt.hash(String(password), saltRounds);
        }

        // se crea y guarda el usuario
        const nuevoUsuario = usuarioRepository.create({
            nombre,
            rut: (rolLower === 'cliente') ? null : rut, // si es cliente se guarda vacio
            password: passwordFinal,
            rol: rolLower
        });

        await usuarioRepository.save(nuevoUsuario);

        return res.status(201).json({
            success: true,
            mensaje: "Usuario registrado con éxito",
            data: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                rut: nuevoUsuario.rut,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        console.error("Error en crearUsuario:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno al registrar el usuario"
        });
    }
}