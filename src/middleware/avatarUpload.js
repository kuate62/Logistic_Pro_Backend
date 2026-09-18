import multer from "multer";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads/avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const avatarStorage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Seules les images sont autorisées'));
        cb(null, true);
    }
});

export const uploadAvatarImage = (req, res, next) => {
    avatarUpload.single('avatar')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || "Erreur lors de l'upload" });
        next();
    });
};

export default uploadAvatarImage;
