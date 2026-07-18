import { EntitySchema } from 'typeorm';

export const GastoEntity = new EntitySchema({
  name: 'Gasto',
  tableName: 'gastos',
  columns: {
    id: { 
        primary: true, 
        type: 'int', 
        generated: true 
    },
    nombreOperacion: { 
        name: 'nombre_operacion', 
        type: 'varchar', 
        length: 150, 
        nullable: false 
    },
    categoria: { 
        type: 'varchar', 
        length: 30, 
        nullable: false 
    },
    metodoPago: { 
        name: 'metodo_pago', 
        type: 'varchar', 
        length: 20, 
        nullable: false 
    },
    monto: { 
        type: 'int', 
        nullable: false 
    },
    comprobanteUrl: { 
        name: 'comprobante_url', 
        type: 'varchar', 
        length: 255, 
        nullable: true 
    },
    fechaRegistro: { 
        name: 'fecha_registro', 
        type: 'timestamp with time zone', 
        nullable: false 
    },
    estadoReembolso: { 
        name: 'estado_reembolso', 
        type: 'varchar', 
        length: 20, 
        nullable: true 
    },
    fechaReembolso: { 
        name: 'fecha_reembolso', 
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
    usuario: {
      target: 'Usuario',
      type: 'many-to-one',
      joinColumn: { name: 'usuario_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});