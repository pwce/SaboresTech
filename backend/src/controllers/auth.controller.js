import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/configDb.js';
import { UsuarioEntity } from '../entities/usuario.entity.js'; 

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

export const loginPorPin = async (req, res) => {
  const { pin } = req.body; // El frontend solo necesita enviar el PIN ingresado en el PinPad

  console.log("=== NUEVO INTENTO DE LOGIN ===");
  console.log("1. PIN recibido desde el Frontend:", pin, "TIPO DE DATO:", typeof pin);

  if (!pin) {
    return res.status(400).json({ success: false, mensaje: 'El PIN es obligatorio.' });
  }

  try {
    // 1. Buscar a todos los usuarios para verificar su PIN
    const usuarios = await usuarioRepository.find({select: ["id", "nombre", "rut", "password", "rol"]});
    console.log("2. Cantidad de usuarios encontrados en la BD:", usuarios.length);

    let usuarioAutenticado = null;

    // 2. Recorrer los usuarios buscando cuál coincide con el PIN ingresado
    for (const usuario of usuarios) {
      // Comparar el PIN plano con el hash guardado en la columna 'password' 
      console.log(`-> Analizando usuario: ${usuario.nombre}`);
      console.log(`   - Hash guardado en BD: ${usuario.password}`);
      const pinValido = await bcrypt.compare(pin, usuario.password); 
      console.log(`   - ¿Bcrypt dice que coincide?: ${pinValido}`);
      if (pinValido) {
        usuarioAutenticado = usuario;
        break;
      }
    }

    // Si nadie coincidió con ese PIN
    if (!usuarioAutenticado) {
      console.log("❌ LOGIN FALLIDO: Ningún PIN coincidió.");
      return res.status(401).json({ 
        success: false, 
        mensaje: 'PIN de seguridad incorrecto.' 
      });
    }

    console.log(`✅ LOGIN EXITOSO para: ${usuarioAutenticado.nombre}`);

    // 3. Generar el JWT firmado usando los datos del usuario encontrado
    const secret = process.env.JWT_SECRET || 'SaboresDeCarolinaSecret2026';
    const token = jwt.sign(
      { id: usuarioAutenticado.id, rol: usuarioAutenticado.rol, nombre: usuarioAutenticado.nombre },
      secret,
      { expiresIn: '12h' } // Expira al terminar la jornada laboral del Foodtruck
    );

    // 4. Responder con la estructura exacta que calza con tu Frontend
    return res.status(200).json({
      success: true,
      mensaje: 'Autenticación exitosa.',
      nombre: usuarioAutenticado.nombre, // Pasamos los campos directo como los mapea auth.service.js
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