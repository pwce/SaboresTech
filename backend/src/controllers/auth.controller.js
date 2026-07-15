// auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/configDb.js';
import { UsuarioEntity } from '../entities/usuario.entity.js'; 

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

export const loginPorPin = async (req, res) => {
  const { pin } = req.body; 
  console.log("=== NUEVO INTENTO DE LOGIN ===");
  console.log("1. PIN recibido desde el Frontend:", pin, "TIPO DE DATO:", typeof pin);

  if (!pin) {
    return res.status(400).json({ success: false, mensaje: 'El PIN es obligatorio.' });
  }

  try {
    
    const usuarios = await usuarioRepository.find({select: ["id", "nombre", "rut", "password", "rol"]});
    console.log("2. Cantidad de usuarios encontrados en la BD:", usuarios.length);

    let usuarioAutenticado = null;

    
    for (const usuario of usuarios) {
      
      console.log(`-> Analizando usuario: ${usuario.nombre}`);
      console.log(`   - Hash guardado en BD: ${usuario.password}`);
      const pinValido = await bcrypt.compare(String(pin), usuario.password);
      console.log(`   - ¿Bcrypt dice que coincide?: ${pinValido}`);
      if (pinValido) {
        usuarioAutenticado = usuario;
        break;
      }
    }

    if (!usuarioAutenticado) {
      console.log("LOGIN FALLIDO: Ningún PIN coincidió.");
      return res.status(401).json({ 
        success: false, 
        mensaje: 'PIN de seguridad incorrecto.' 
      });
    }

    console.log(`LOGIN EXITOSO para: ${usuarioAutenticado.nombre}`);

    const secret = process.env.JWT_SECRET || 'SaboresDeCarolinaSecret2026';
    const token = jwt.sign(
      { id: usuarioAutenticado.id, rol: usuarioAutenticado.rol, nombre: usuarioAutenticado.nombre },
      secret,
      { expiresIn: '12h' } 
    );

    return res.status(200).json({
      success: true,
      mensaje: 'Autenticación exitosa.',
      nombre: usuarioAutenticado.nombre, 
      rol: usuarioAutenticado.rol,
      token: token
    });

  } catch (error) {
    console.error("Error en loginPorPin:", error);
    return res.status(500).json({ 
      success: false, 
      mensaje: 'Error interno del servidor al procesar el login.' 
    });
  }
};