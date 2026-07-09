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
            type: 'float', // por si quedan 1.5 litros de leche
            nullable: false,
            default: 0,
        },
        unidadMedida: {
            type: 'varchar',
            length: 20,
            nullable: false, // gr, ml, unid, kg
        },
        disponible: {
            type: 'boolean',
            nullable: false,
            default: true, // por defecto todo insumo nuevo se asume disponible
        }
    }
});