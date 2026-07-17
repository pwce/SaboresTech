// caja.entity.js
import { EntitySchema } from 'typeorm';

export const CajaEntity = new EntitySchema({
  name: 'Caja',
  tableName: 'cajas',
  columns: {
    id: { 
        primary: true, 
        type: 'int', 
        
        generated: true 
    },
    saldoInicial: { 
        name: 'saldo_inicial', 
        type: 'int', 
        nullable: false 
    },
    saldoFinalTeorico: { 
        name: 'saldo_final_teorico', 
        type: 'int', 
        nullable: true 
    },
    saldoFinalContado: { 
        name: 'saldo_final_contado', 
        type: 'int', 
        nullable: true 
    },
    diferencia: { 
        type: 'int', 
        nullable: true 
    },
    estado: { 
        type: 'varchar', 
        length: 20, 
        nullable: false, 
        default: 'abierta' 
    },
    fechaApertura: { 
        name: 'fecha_apertura', 
        type: 'timestamp with time zone', 
        nullable: false 
    },
    fechaCierre: { 
        name: 'fecha_cierre', 
        type: 'timestamp with time zone', 
        nullable: true 
    },
  },
  relations: {
    jornada: {
      target: 'Jornada',
      type: 'many-to-one',
      joinColumn: { name: 'jornada_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
  },
});