import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import ocrRoutes from '../backend/routes/ocrRoutes.js';

const app = express();
const port = 5000;

app.use(express.json());  
app.use(cors());

// MongoDB connection details
const mongoUrl =
  'mongodb+srv://agrawalaman1210:m2xQ5bn76bv5Q8vE@cluster0.ffhlkrh.mongodb.net/OCR?retryWrites=true&w=majority';

// Create a Mongoose connection
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Handle MongoDB connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/', ocrRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
