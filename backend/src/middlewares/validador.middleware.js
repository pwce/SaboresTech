// validador.middleware.js
export function validarSchema(schema) {
    return (req, res, next) => {
        
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
        
            const listaErrores = error.details.map(err => err.message);
            return res.status(400).json({
                success: false,
                mensaje: "Error de validación en los datos enviados",
                errores: listaErrores
            });
        }
        
        next(); 
    };
}