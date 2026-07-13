import { EntitySchema } from 'typeorm';
import bcrypt from 'bcrypt';

export const UsuarioEntity = new EntitySchema({
    name: 'Usuario',
    tableName: 'usuarios',
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
        rut: {
            type: 'varchar',
            length: 12,
            unique: true,
            nullable: true,
        },
        password: {
            type: 'varchar', 
            nullable: true,
            select: true,
        },
        rol: {
            type: 'varchar',
            length: 20,
            nullable: false,
            default: 'cliente',
        }
    },
    listeners: {
        beforeInsert(event) {
            
            const usuario = event.entity;
            if (usuario && usuario.password) {
                const saltRounds = 10;
                
                usuario.password = bcrypt.hashSync(String(usuario.password), saltRounds);
            }
        },
        beforeUpdate(event) {
            const usuario = event.entity;
            if (usuario && usuario.password && String(usuario.password).length <= 4) {
                const saltRounds = 10;
                usuario.password = bcrypt.hashSync(String(usuario.password), saltRounds);
            }
        }
    }
});
