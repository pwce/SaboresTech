// usuario.validation.js
import Joi from 'joi';

const usuarioSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
        'any.required': 'El nombre de usuario es obligatorio'
    }),
    rol: Joi.string().valid('cliente', 'atendedor', 'dueña').required().messages({
        'any.only': 'El rol debe ser: cliente, atendedor o dueña'
    }),
    rut: Joi.string().min(10).max(12).when('rol', {
        is: Joi.string().valid('dueña', 'atendedor'),
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, '')
    }).messages({
        'any.required': 'El RUT es obligatorio para administradores y personal'
    }),
    password: Joi.string().min(4).max(20).when('rol', {
        is: Joi.string().valid('dueña', 'atendedor'),
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, '')
    }).messages({
        'any.required': 'La contraseña/PIN es obligatoria para administradores y personal'
    })
});

export default usuarioSchema;