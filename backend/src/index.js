// index.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors'; 
import path from "path";
import bcrypt from 'bcrypt';
import { routerApi } from './routes/index.routes.js';
import { connectDB, AppDataSource } from './config/configDb.js';
import { UsuarioEntity } from './entities/usuario.entity.js';

async function setupServer(){
    const app = express();
    app.use(
        cors({
            credentials: true,
            origin:true,
        })
    );
    app.use(express.json());
    app.use(morgan('dev'));
    app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
    routerApi(app);
    app.get('/', (req,res)=>{
        res.send('Servidor encendido');
    });

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || "http://localhost";
    app.listen(PORT,()=>{
        console.log(`Servidor corriendo en ${HOST}:${PORT}`);
    });
}
async function setupApi(){
    try {
        await connectDB();
        
        try {
            const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);
            const cantidadUsuarios = await usuarioRepository.count();

            if (cantidadUsuarios === 0) {
                console.log("Base de datos vacía. Creando usuarios iniciales por defecto...");
                
                const saltRounds = 10;
                
                const pinCarolinaEncriptado = await bcrypt.hash("5233", saltRounds);
                const pinAtendedorEncriptado = await bcrypt.hash("1111", saltRounds);

                const duena = usuarioRepository.create({
                    nombre: "Carolina",
                    rut: "13.603.755-2",
                    password: pinCarolinaEncriptado,
                    rol: "dueña"
                });

                const atendedor = usuarioRepository.create({
                    nombre: "Paz",
                    rut: "21.725.801-4",
                    password: pinAtendedorEncriptado, 
                    rol: "atendedor"
                });

                await usuarioRepository.save([duena, atendedor]);
                console.log("Usuarios iniciales creados y encriptados con éxito.");
            }
        } catch (seedError) {
            console.error("Advertencia en el proceso de Seed (Usuarios):", seedError.message);
        }

        await setupServer();
    } catch(error){
        console.error('Error en la conexión con la base de datos: ',error);
        process.exit(1);
    }
}

setupApi()
    .then(() => console.log("=> API Iniciada exitosamente"))
    .catch((error) => console.log("Error en index.js -> setupApi(): ", error));