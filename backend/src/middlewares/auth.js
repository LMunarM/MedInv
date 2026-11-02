import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Proteger rutas (requiere token válido)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adjuntar el usuario autenticado a la request (excluyendo password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.activo) {
        return res.status(401).json({ message: 'Usuario no autorizado o inactivo' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token no válido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token de autorización' });
  }
};

// Restringir acceso por roles específicos
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: `El rol '${req.user.rol}' no tiene permisos para realizar esta acción`,
      });
    }
    next();
  };
};