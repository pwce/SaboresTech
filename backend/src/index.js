import express from 'express';
import morgan from 'morgan';
import cors from 'cors'; 
import path from "path";
import { routerApi } from './routes/index.routes.js';
import { connectDB } from './config/configDb.js';

async function setupServer(){
    const app = express();
    app.use(
        cors({
            credentials: true,
            origin:true,
        })
    );
    //avisa para que use JSON
    app.use(express.json());
    //morgan para la respuestas de las peticiones HTTP
    app.use(morgan('dev'));
    //para cargar archivos
    app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
    //cargar las rutas de la app
    routerApi(app);
    //enciende el servidor 
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
        await setupServer();
    }catch(error){
        console.error('Error en la conexión con la base de datos: ',error);
        process.exit(1);
    }
}
setupApi()
    .then(() => console.log("=> API Iniciada exitosamente"))
    .catch((error) => console.log("Error en index.js -> setupApi(): ", error));