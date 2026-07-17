// jornada.validation.js
import Joi from 'joi';

// limite maximo de 1000 para envases
const envasesSchema = Joi.object({
  vasos: Joi.number().integer().min(0).max(1000).required().messages({
    'number.max': 'La cantidad de vasos no puede superar las 1000 unidades.',
    'number.base': 'Los vasos deben ser un número.',
    'any.required': 'La cantidad de vasos es requerida.'
  }),
  tapas: Joi.number().integer().min(0).max(1000).required().messages({
    'number.max': 'La cantidad de tapas no puede superar las 1000 unidades.',
    'number.base': 'Las tapas deben ser un número.',
    'any.required': 'La cantidad de tapas es requerida.'
  }),
  bombillas: Joi.number().integer().min(0).max(1000).required().messages({
    'number.max': 'La cantidad de bombillas no puede superar las 1000 unidades.',
    'number.base': 'Las bombillas deben ser un número.',
    'any.required': 'La cantidad de bombillas es requerida.'
  })
});

const grupoToggleSchema = Joi.object().pattern(Joi.string(), Joi.boolean());

const insumosDisponiblesSchema = Joi.object({
  envases: envasesSchema.required(),
  leches: grupoToggleSchema.optional(),
  frutas: grupoToggleSchema.optional(),
  endulzantes: grupoToggleSchema.optional(),
  crema: grupoToggleSchema.optional(),
  extras: grupoToggleSchema.optional(),
  agotados: Joi.array().items(Joi.string()).optional(),
  customLabels: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

export const iniciarJornadaSchema = Joi.object({
  fecha: Joi.date().iso().required().messages({
    'date.base': 'La fecha de jornada no es válida.',
    'any.required': 'La fecha de la jornada es obligatoria.'
  }),
  montoInicial: Joi.number().min(0).required().messages({
    'number.min': 'El monto inicial no puede ser negativo.',
    'any.required': 'El monto inicial en caja es requerido.'
  }),
  insumosDisponibles: insumosDisponiblesSchema.required()
});

export const actualizarInsumosSchema = Joi.object({
  insumosDisponibles: insumosDisponiblesSchema.required()
});

export const cerrarJornadaSchema = Joi.object({
  montoFinalCaja: Joi.number().min(0).required().messages({
    'number.min': 'El monto final no puede ser negativo.',
    'any.required': 'El monto final de caja es requerido para el cierre.'
  }),
  observaciones: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Las observaciones no pueden superar los 500 caracteres.'
  })
});
