import { EntitySchema } from 'typeorm';

export const DetallePedidoEntity = new EntitySchema({
    name: 'DetallePedido',
    tableName: 'detalles_pedido',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        cantidad: {
            type: 'int',
            nullable: false,
        },
        precioUnitario: {
            name: 'precio_unitario',
            type: 'int',
            nullable: false,
        },
        personalizaciones: {
            type: 'varchar',
            length: 255,
            nullable: true,
            default: '',
        }
    },
    relations: {
        pedido: {
            target: 'Pedido',
            type: 'many-to-one',
            joinColumn: { name: 'pedido_id' },
            onDelete: 'CASCADE',
        },
        producto: {
            target: 'Producto',
            type: 'many-to-one',
            joinColumn: { name: 'producto_id' },
            onDelete: 'RESTRICT',
        }
    }
});