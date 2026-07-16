import Joi from 'joi';

const CATEGORIAS_VALIDAS = ['compra_insumos', 'bencina', 'permiso_municipal', 'impuestos', 'sueldos', 'otros'];
const METODOS_VALIDOS = ['efectivo', 'transferencia', 'tarjeta', 'terceros'];

const gastoSchema = Joi.object({
    nombreOperacion: Joi.string().min(3).max(150).required().messages({
      'string.min': 'El nombre de la operación debe tener al menos 3 caracteres',
      'any.required': 'El nombre de la operación es obligatorio',
    }),
    categoria: Joi.string().valid(...CATEGORIAS_VALIDAS).required().messages({
      'any.only': 'Categoría inválida',
    }),
    metodoPago: Joi.string().valid(...METODOS_VALIDOS).required().messages({
      'any.only': 'Método de pago inválido (efectivo, transferencia, tarjeta, terceros)',
    }),
    monto: Joi.number().integer().min(1).required().messages({
       'number.min': 'El monto debe ser mayor a 0',
    }),
    jornada_id: Joi.number().integer().required().messages({
       'any.required': 'Debes indicar a qué jornada pertenece este gasto',
    }),
});

export default gastoSchema;