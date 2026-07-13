import { EntitySchema } from 'typeorm';

export const InsumoEntity = new EntitySchema({
    name: 'Insumo',
    tableName: 'insumos',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        nombre: {
            type: 'varchar',
            length: 100,
            unique: true, 
            nullable: false,
        },
        cantidadActual: {
            type: 'float', 
            nullable: false,
            default: 0,
        },
        unidadMedida: {
            type: 'varchar',
            length: 20,
            nullable: false,
        },
        disponible: {
            type: 'boolean',
            nullable: false,
            default: true,
        }
    }
});