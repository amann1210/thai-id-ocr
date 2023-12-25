// models/ocrModel.js
import mongoose from 'mongoose';

const ocrDataSchema = new mongoose.Schema({
  filename: String,
  imageData: Buffer,
  ocrText: String,
  identificationNumber: String,
  Name: String,
  lastName: String,
  dateOfBirth: String,
  dateOfExpiry: String,
  dateOfIssue: String,
  timestamp: { type: Date, default: Date.now },
  status: String,
});

const OCRData = mongoose.model('OCRData', ocrDataSchema);

export default OCRData;
