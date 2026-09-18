import multer from "multer";

const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Fichier trop volumineux' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Trop de fichiers' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Champ de fichier inattendu' });
        }
    }

    if (error.message === 'Type de fichier non autorisé !') {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};

export default handleMulterError;
