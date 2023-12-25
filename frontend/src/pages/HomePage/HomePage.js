import React from 'react';
import ImageUploadForm from '../../components/ImageUploadForm/ImageUploadForm';
import './HomePage.css';

function HomePage() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: 0, color: '#333', paddingTop: '10px' }}>Thai ID Card OCR</h1>
      <ImageUploadForm />
    </div>
  );
}

export default HomePage;
