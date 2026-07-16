// index.routes.js
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productosRouter from "./productos.routes.js";
import usuariosRouter from "./usuarios.routes.js";
import pedidosRouter from "./pedidos.routes.js";
import insumosRouter from "./insumos.routes.js";
import jornadaRouter from "./jornada.routes.js";
import gastosRouter from "./gastos.routes.js";
import cajaRouter from "./caja.routes.js";


export function routerApi(app) {
    const router = Router();

    app.use('/api/v1', router);
    
    router.use('/auth', authRoutes);
    router.use('/productos', productosRouter);
    router.use('/usuarios', usuariosRouter);
    router.use('/pedidos', pedidosRouter);
    router.use('/insumos', insumosRouter );
    router.use('/jornada', jornadaRouter );
    router.use('/gastos', gastosRouter);
    router.use('/caja', cajaRouter);
}