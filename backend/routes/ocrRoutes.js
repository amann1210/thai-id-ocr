// routes/ocrRoutes.js
import express from 'express';
import ocrController from '../controllers/ocrController.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() }); 
const router = express.Router();
router.post('/upload', upload.single('image'), ocrController.uploadImage);
router.get('/all-ocr-data', ocrController.getAllOCRData);
router.get('/ocr-data/:fileId', ocrController.getOCRDataById);
router.put('/update-entry/:fileId', ocrController.updateOCRData);
router.delete('/delete-entry/:fileId', ocrController.deleteOCRData);


export default router;
