import React, { useState } from 'react';

const EditForm = ({ ocrData, onUpdate, onCancel }) => {
  const [editedData, setEditedData] = useState(ocrData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editedData._id) {
       
        onUpdate(editedData);
      } else {
        console.error('Error updating entry: No ID provided.');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  return (
    <div className="edit-form-container">
    <form className="edit-form" onSubmit={handleSubmit}>
        <h2>Edit OCR Data</h2>
      <p>
        Make changes to the OCR data below. Note that these changes will be updated in the database.
      </p>
      <label>
        Name:
        <input type="text" name="Name" value={editedData.Name} onChange={handleChange} />
      </label>
      <br />
      <label>
        Last Name:
        <input type="text" name="lastName" value={editedData.lastName} onChange={handleChange} />
      </label>
      <br />
      <label>
        Date of Birth:
        <input type="text" name="dateOfBirth" value={editedData.dateOfBirth} onChange={handleChange} />
      </label>
      <br />
      <label>
        Date of Issue:
        <input type="text" name="dateOfIssue" value={editedData.dateOfIssue} onChange={handleChange} />
      </label>
      <br />
      <label>
        Date of Expiry:
        <input type="text" name="dateOfExpiry" value={editedData.dateOfExpiry} onChange={handleChange} />
      </label>
      <br />
      <input type="hidden" name="_id" value={editedData._id} />
      <br />
      <button type="submit">Update</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
    </div>
  );
};

export default EditForm;
