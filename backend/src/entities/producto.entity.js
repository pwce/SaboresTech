// producto.entity.js
import { EntitySchema } from 'typeorm';

export const ProductoEntity = new EntitySchema({
    name: 'Producto', 
    tableName: 'productos', 
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true, 
        },
        nombre: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        precio: {
            type: 'int',
            nullable: false,
        },
        categoria: {
            type: 'varchar',
            length: 50,
            nullable: false,
        },
        disponible: {
            type: 'boolean',
            default: true,
        },
        controlaStock: {
            name: 'controla_stock',
            type: 'boolean',
            default: true,
        },
        stock: {
            type: 'int',
            default: 0, 
        },
        imagenUrl: {
            name: 'imagen_url',
            type: 'varchar',
            length: 255,
            nullable: true,
        },
        enJornada: {
            name: 'en_jornada',
            type: 'boolean',
            default: false,
        }
    },
});