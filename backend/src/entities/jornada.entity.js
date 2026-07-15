// jornada.entity.js
import { EntitySchema } from 'typeorm';

export const JornadaEntity = new EntitySchema({
    name: 'Jornada',
    tableName: 'jornadas',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        fechaInicio: {
            name: 'fecha_inicio',
            type: 'timestamp with time zone', 
            nullable: false,
        },
        fechaFin: {
            name: 'fecha_fin',
            type: 'timestamp with time zone',
            nullable: true,
        },
        activa: {
            type: 'boolean',
            default: true,
        },
        insumosDisponibles: {
            name: 'insumos_disponibles',
            type: 'jsonb',
            nullable: false,
        }
    }
});