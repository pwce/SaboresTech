import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurar que la carpeta de subidas exista
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Reemplaza espacios y agrega un timestamp único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filtro para validar que solo suban imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: El archivo debe ser una imagen válida (jpeg, jpg, png, webp)'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
  fileFilter
});