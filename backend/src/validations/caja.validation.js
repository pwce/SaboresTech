import Joi from 'joi';

export const abrirCajaSchema = Joi.object({
  jornada_id: Joi.number().integer().required().messages({
    'any.required': 'Debes indicar a qué jornada pertenece esta caja',
  }),
  saldoInicial: Joi.number().integer().min(0).required().messages({
    'number.min': 'El saldo inicial no puede ser negativo',
    'any.required': 'Debes indicar el efectivo con el que abres la caja',
  }),
});

export const cerrarCajaSchema = Joi.object({
  saldoFinalContado: Joi.number().integer().min(0).required().messages({
    'number.min': 'El efectivo contado no puede ser negativo',
    'any.required': 'Debes contar e ingresar el efectivo real en caja',
  }),
});