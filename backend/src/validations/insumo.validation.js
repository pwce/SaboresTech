// insumo.validation.js
import Joi from 'joi';

const insumoSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
        'string.min': 'El nombre del insumo debe tener al menos 3 caracteres',
        'any.required': 'El nombre del insumo es obligatorio'
    }),
    cantidadActual: Joi.number().min(0).optional().default(0),
    unidadMedida: Joi.string().max(20).required().messages({
        'any.required': 'La unidad de medida es obligatoria (gr, ml, unid, kg)'
    }),
    disponible: Joi.boolean().optional().default(true)
});

export default insumoSchema;