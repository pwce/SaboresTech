import Joi from 'joi';

const detallePedidoSchema = Joi.object({
    pedido_id: Joi.number().integer().required(),
    producto_id: Joi.number().integer().required(),
    cantidad: Joi.number().integer().min(1).required(),
    precioUnitario: Joi.number().integer().min(0).required()
});

export default detallePedidoSchema;