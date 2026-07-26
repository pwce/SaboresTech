import Joi from 'joi';

const productoSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
        'string.min': 'El nombre del producto debe tener al menos 3 caracteres',
        'any.required': 'El nombre del producto es obligatorio'
    }),
    precio: Joi.number().integer().min(1).required().messages({
        'number.min': 'El precio debe ser un número positivo mayor a 0',
        'any.required': 'El precio es obligatorio'
    }),
    categoria: Joi.string().required().messages({
        'any.required': 'La categoría es obligatoria'
    }),
    disponible: Joi.boolean().default(true),
    controlaStock: Joi.any().optional(),
    stock: Joi.number().integer().min(0).max(150).optional().messages({
        'number.min': 'El stock no puede ser un número negativo',
        'number.max': 'El stock de productos fijos no puede superar las 150 unidades',
        'number.base': 'El stock debe ser un número válido'
    }),
    imagen: Joi.any().optional() 
});

export const stockProductoSchema = Joi.object({
    stock: Joi.number().integer().min(0).max(150).required().messages({
        'number.min': 'El stock no puede ser un número negativo',
        'number.max': 'El stock de un producto no puede superar las 150 unidades',
        'number.base': 'El stock debe ser un número válido',
        'any.required': 'Debes indicar la cantidad de stock'
    })
});

export default productoSchema;
