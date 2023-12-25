import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EditForm from './EditForm.js';
import './ImageUploadForm.css';

function ImageUploadForm() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [allOCRData, setAllOCRData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [identificationNumberFilter, setIdentificationNumberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const fetchAllOCRData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/all-ocr-data');
        setAllOCRData(response.data.allOCRData);
      } catch (error) {
        console.error('Error fetching all OCR data:', error);
      }
    };

    fetchAllOCRData();
  }, []);

  const handleFileChange = (e) => {
    const selectedImage = e.target.files[0];
    setFile(selectedImage);
    const url = URL.createObjectURL(selectedImage);
    setImageUrl(url);
  };

  const handleImageUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(URL.createObjectURL(file));
      const ocrResponse = await axios.get(`http://localhost:5000/ocr-data/${response.data.fileId}`);
      setOcrData(ocrResponse.data.ocrData);
      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteEntry = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/delete-entry/${fileId}`);
      const response = await axios.get('http://localhost:5000/all-ocr-data');
      setAllOCRData(response.data.allOCRData);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditEntry = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:5000/ocr-data/${fileId}`);
      setOcrData(response.data.ocrData);
      setIsEditing(true);
    } catch (error) {
      console.error('Error fetching OCR data for editing:', error);
    }
  };

  const handleUpdateEntry = async (updatedData) => {
    try {
      if (!updatedData._id) {
        console.error('Error updating entry: No ID provided.');
        return;
      }
      await axios.put(`http://localhost:5000/update-entry/${updatedData._id}`, updatedData);
      const response = await axios.get('http://localhost:5000/all-ocr-data');
      setAllOCRData(response.data.allOCRData);
      setIsEditing(false);
      setOcrData(null);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setOcrData(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleIdentificationNumberChange = (e) => {
    setIdentificationNumberFilter(e.target.value);
  };

  const handleStatusFilterChange = (selectedStatus) => {
    setStatusFilter(selectedStatus);
  };

  const filterByDateAndIdentificationNumberAndStatus = (data) => {
    const isMatchingStatus = !statusFilter || data.status === statusFilter;

    if (!selectedDate && !identificationNumberFilter && isMatchingStatus) {
      return true; // No filters applied, show all data
    }

    const isMatchingDate =
      !selectedDate || new Date(data.timestamp).setHours(0, 0, 0, 0) === selectedDate.setHours(0, 0, 0, 0);

    const isMatchingIdentificationNumber =
      !identificationNumberFilter || data.identificationNumber.includes(identificationNumberFilter);

    return isMatchingDate && isMatchingIdentificationNumber && isMatchingStatus;
  };

  return (
    <div className="container">
      {/* Upload Section */}
      <div className="upload-section">
        <input type="file" accept=".jpg, .jpeg, .png, image/jpeg, .jpg_large, image/png" onChange={handleFileChange} />  
        {imageUrl && <img src={imageUrl} alt="Uploaded" className="uploaded-image" />}
        <button
          onClick={handleImageUpload}
          disabled={!file}
          className="tooltip" // Add tooltip class
          title={file ? "Upload Image" : "Please select an image"}
        >
          Upload Image
        </button>
      </div>
  
      {/* OCR Section */}
      <div className="ocr-section">
        {/* Display message based on image upload status in OCR section */}
        {!ocrData && !isEditing && (
          <div className="centered-container">
            <h2>OCR Data</h2>
            {imageUrl ? (
              <p>Upload the image to see OCR data here.</p>
            ) : (
              <p>You will see OCR data here once you upload the image.</p>
            )}
          </div>
        )}
  
        {/* Check if ocrData is available and not in editing mode */}
        {ocrData && !isEditing && (
          <div className="centered-container">
            <h2>OCR Data</h2>
            <p>Identification Number: {ocrData.identificationNumber}</p>
            <p>Name: {ocrData.Name}</p>
            <p>Last Name: {ocrData.lastName}</p>
            <p>Date of Birth: {ocrData.dateOfBirth}</p>
            <p>Date of Expiry: {ocrData.dateOfExpiry}</p>
            <p>Date of Issue: {ocrData.dateOfIssue}</p>
          </div>
        )}
  
        {/* Check if in editing mode */}
        {isEditing && (
          <EditForm ocrData={ocrData} onUpdate={handleUpdateEntry} onCancel={handleCancelEdit} />
        )}
      </div>
  
  

      {/* Filter Section */}
      <div className="filter-section">
        <h2>All OCR Data</h2>
        <div className="filter-options">
          <label>Date Filter: </label>
          <DatePicker selected={selectedDate} onChange={handleDateChange} />
          <label>Identification Number Filter: </label>
          <input
            type="text"
            value={identificationNumberFilter}
            onChange={handleIdentificationNumberChange}
          />
          <label>Status Filter:</label>
          <select onChange={(e) => handleStatusFilterChange(e.target.value)}>
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>

        {/* Display Table */}
        <table border="1">
          <thead>
            <tr>
              <th>Identification Number</th>
              <th>Name</th>
              <th>Last Name</th>
              <th>Date of Birth</th>
              <th>Date of Issue</th>
              <th>Date of Expiry</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allOCRData
              .filter(filterByDateAndIdentificationNumberAndStatus)
              .map((data) => (
                <tr key={data._id}>
                  <td>{data.identificationNumber}</td>
                  <td>{data.Name}</td>
                  <td>{data.lastName}</td>
                  <td>{data.dateOfBirth}</td>
                  <td>{data.dateOfIssue}</td>
                  <td>{data.dateOfExpiry}</td>
                  <td>{data.timestamp}</td>
                  <td>{data.status}</td>
                  <td>
                    <button onClick={() => handleDeleteEntry(data._id)}>Delete</button>
                    <button onClick={() => handleEditEntry(data._id)}>Edit</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImageUploadForm;

