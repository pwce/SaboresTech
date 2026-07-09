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
    category: Joi.string().valid('Frappés', 'Jugos naturales', 'Milkshakes', 'Pizzas', 'Sándwiches', 'Empanadas').required().messages({
        'any.only': 'La categoría debe ser una de las permitidas (Frappés, Jugos naturales, Milkshakes, Pizzas, Sándwiches, Empanadas)',
        'any.required': 'La categoría es obligatoria'
    }),
    disponible: Joi.boolean().default(true)
});

export default productoSchema;