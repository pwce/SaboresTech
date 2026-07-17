// pedido.entity.js
import { EntitySchema } from 'typeorm';

export const PedidoEntity = new EntitySchema({
    name: 'Pedido',
    tableName: 'pedidos',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        numeroJornada: {
            type: "int",
            nullable: false,
        },
        fecha: {
            name: 'fecha_pedido',
            type: 'timestamp with time zone', 
            nullable: false,
        },
        total: {
            type: 'int',
            nullable: false,
            default: 0,
        },
        estadoPago: {
            name: 'estado_pago', 
            type: 'varchar', 
            length: 20,
            default: 'pendiente',
        },
        estadoCocina: {
            name: 'estado_cocina',
            type: 'varchar',
            length: 20,
            default: 'en_espera',
        },
        metodoPago: {
            name: 'metodo_pago',
            type: 'varchar',
            length: 30,
            nullable: false, 
        },
        tipoServicio: {
            name: 'tipo_servicio',
            type: 'varchar',
            length: 20,
            nullable: true,
        },
        montoRecibido: {
            name: 'monto_recibido',
            type: 'int',
            nullable: true,
        },
        vuelto: {
            type: 'int',
            default: 0,
        }
    },
    relations: {
        usuario: {
            target: 'Usuario',
            type: 'many-to-one',
            joinColumn: { name: 'usuario_id' },
            nullable: true, 
            onDelete: 'SET NULL',
        },
        jornada: {
            target: 'Jornada',
            type: 'many-to-one',
            joinColumn: { name: 'jornada_id' },
            nullable: true,
            onDelete: 'SET NULL',
        },
        detalles: {
            target: 'DetallePedido',
            type: 'one-to-many',
            mappedBy: 'pedido',
            cascade: true, 
        },
    },    
});
