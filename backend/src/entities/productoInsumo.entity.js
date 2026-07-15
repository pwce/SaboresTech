// productoInsumo.entity.js
import { EntitySchema } from 'typeorm';

export const ProductoInsumoEntity = new EntitySchema({
    name: 'ProductoInsumo',
    tableName: 'productos_insumos',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        cantidadUsada: {
            name: 'cantidad_usada',
            type: 'int',
            default: 1, 
        }
    },
    relations: {
        producto: {
            target: 'Producto',
            type: 'many-to-one',
            joinColumn: { name: 'producto_id' },
            onDelete: 'CASCADE',
        },
        insumo: {
            target: 'Insumo',
            type: 'many-to-one',
            joinColumn: { name: 'insumo_id' },
            onDelete: 'CASCADE',
        }
    }
});