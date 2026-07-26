import Joi from 'joi';

const detalleInternoSchema = Joi.object({
    producto_id: Joi.number().integer().required().messages({
        'any.required': 'El ID del producto es obligatorio en el detalle'
    }),
    cantidad: Joi.number().integer().min(1).required().messages({
        'number.min': 'La cantidad mínima de un producto debe ser 1'
    }),
   
    personalizaciones: Joi.string().max(255).optional().allow('').messages({
        'string.max': 'Las personalizaciones no pueden exceder los 255 caracteres'
    })
});

const pedidoSchema = Joi.object({
    usuario_id: Joi.number().integer().optional().allow(null),
    metodoPago: Joi.string().valid('efectivo', 'transferencia', 'tarjeta').required().messages({
        'any.only': 'Método de pago inválido (efectivo, transferencia, tarjeta)'
    }),
    tipoServicio: Joi.string().valid('aqui', 'llevar').optional().allow(null, '').messages({
        'any.only': "El tipo de servicio debe ser 'aqui' o 'llevar'"
    }),
    montoRecibido: Joi.number().integer().min(0).optional().messages({
        'number.min': 'El monto recibido no puede ser negativo'
    }),
    productos: Joi.array().items(detalleInternoSchema).min(1).required().messages({
        'array.min': 'El pedido debe contener al menos un producto en el carrito'
    })
});

export default pedidoSchema;
