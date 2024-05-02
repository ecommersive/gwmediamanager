// DataForm.js
import React from 'react';

const DataForm = ({ formData, handleInputChange, handleSubmit, formType, errorMessage }) => {
  return (
    <form onSubmit={handleSubmit}>
      <h2>{formType}</h2>
      {/* Dynamically generate form fields based on formType */}
      <label>
        File Name:
        <input type="text" name="fileName" value={formData.fileName} onChange={e => handleInputChange('fileName', e.target.value)} />
        {errorMessage.FileName && <div style={{ color: 'red' }}>{errorMessage.FileName}</div>}
      </label>
      {/* Other fields */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default DataForm;
