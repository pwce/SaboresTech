// verificarToken.middleware.js
import jwt from 'jsonwebtoken';

export const verificarToken = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        mensaje: 'Acceso denegado. No se proporcionó un token válido.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
    
      const secret = process.env.JWT_SECRET || 'SaboresDeCarolinaSecretKey2026';
      const verificado = jwt.verify(token, secret);
      
      req.usuario = verificado; 

    
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(verificado.rol)) {
        return res.status(403).json({
          success: false,
          mensaje: 'No tienes los permisos necesarios para acceder a este módulo.'
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        mensaje: 'Token inválido o expirado.'
      });
    }
  };
};