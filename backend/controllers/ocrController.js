import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import OCRData from '../model/ocrDataModel.js';
const visionClient = new ImageAnnotatorClient({
  keyFilename: 'ocr-assingment-16c843a4efea.json',
});

const ocrController = {
  getAllOCRData: async (req, res) => {
    try {
      let query = {}; // Default query

      if (req.query.date) {
        const formattedDate = new Date(req.query.date);
        query = { timestamp: { $gte: formattedDate, $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000) } };
      }

      const allOCRData = await OCRData.find(query, { imageData: 0 });

      res.json({ success: true, allOCRData });
    } catch (error) {
      console.error('Error fetching all OCR data:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  getOCRDataById: async (req, res) => {
    try {
      const { fileId } = req.params;
      const ocrData = await OCRData.findById(fileId);

      if (!ocrData) {
        return res.status(404).json({ success: false, message: 'Image not found.' });
      }

      res.json({
        success: true,
        message: 'OCR data retrieved successfully.',
        ocrData: {
          _id: ocrData._id,
          identificationNumber: ocrData.identificationNumber,
          Name: ocrData.Name,
          lastName: ocrData.lastName,
          dateOfBirth: ocrData.dateOfBirth,
          dateOfExpiry: ocrData.dateOfExpiry,
          dateOfIssue: ocrData.dateOfIssue,
        },
      });
    } catch (error) {
      console.error('Error fetching OCR data:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  updateOCRData: async (req, res) => {
    try {
      const id = req.params.fileId;
      const ocrData = await OCRData.findById(id);

      if (!ocrData) {
        return res.status(404).json({ success: false, message: 'Image not found.' });
      }

      console.log('Request Body:', req.body);
      ocrData.Name = req.body.Name ? req.body.Name : ocrData.Name;
      ocrData.lastName = req.body.lastName || ocrData.lastName;
      ocrData.dateOfBirth = req.body.dateOfBirth || ocrData.dateOfBirth;
      ocrData.dateOfIssue = req.body.dateOfIssue || ocrData.dateOfIssue;
      ocrData.dateOfExpiry = req.body.dateOfExpiry || ocrData.dateOfExpiry;

      await ocrData.save();

      res.json({ success: true, message: 'OCR entry updated successfully.' });
    } catch (error) {
      console.error('Error updating OCR entry:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  deleteOCRData: async (req, res) => {
    try {
      const { fileId } = req.params;
      await OCRData.findByIdAndDelete(fileId);

      res.json({ success: true, message: 'OCR entry deleted successfully.' });
    } catch (error) {
      console.error('Error deleting OCR entry:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  uploadImage: async (req, res) => {
    try {
      console.log(req.file);
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided.' });
      }

      const [result] = await visionClient.textDetection({
        image: { content: req.file.buffer },
        imageContext: {
          languageHints: ['en', 'num'],
        },
      });

      const textAnnotations = result.textAnnotations || [];
      const detectedText = textAnnotations.map((annotation) => annotation.description).join('\n');

      const ocrData = new OCRData({
        filename: uuidv4(),
        imageData: req.file.buffer,
        ocrText: detectedText,
        status: 'success',
      });

      const identificationNumberRegex = /\d{1,2} \d{4} \d{5} \d{2} \d{1}/;
      const NameRegex = /Name\s*(?:(?:Miss|Mr)\s+)?([^\s]+)\s*Last name/;
      const lastNameRegex = /Last name\s*([^\n]+)/;
      const dateRegex = /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?,?\s+\d{4}\b/g;

      const match = identificationNumberRegex.exec(detectedText);
      const matchName = NameRegex.exec(detectedText);
      const lastNameMatch = lastNameRegex.exec(detectedText);
      const dateMatches = getMatches(dateRegex, detectedText);

      ocrData.identificationNumber = match ? match[0] : null;
      ocrData.Name = matchName ? matchName[1].trim() : null;
      ocrData.lastName = lastNameMatch ? lastNameMatch[1].trim() : null;

      const allDates = dateMatches.map(match => match[0]);
      console.log("All Dates:", allDates);

      // Sort the dates in ascending order
      allDates.sort((a, b) => new Date(a) - new Date(b));

      // Assign dates to ocrData
      ocrData.dateOfBirth = allDates[0] || null;
      ocrData.dateOfIssue = allDates[1] || null;
      ocrData.dateOfExpiry = allDates[2] || null;

      await ocrData.save();
      res.json({ success: true, message: 'Image uploaded and OCR data saved successfully.', fileId: ocrData._id });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', status: 'failure' });
    }
  },
};

export default ocrController;

function getMatches(regex, text) {
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
}
