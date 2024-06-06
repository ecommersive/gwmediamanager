import React, {useEffect} from 'react'
const FormAllDataBody = ({ catData, currentData, handleSelectedCategoryChange, fileName, handleFileNameChange }) => {
    const shouldRenderCategory = catData === 'ExtendExpiry' || catData === 'DeleteData';
  
    useEffect(() => {
      handleSelectedCategoryChange({target: {value: currentData}})
    }, [])
    
    return (
      <>
        {shouldRenderCategory && (
          <>
            <label>
              Category: {currentData}
            </label>
            <br />

            
            <label>
              File Name:
              <input type="text" name="fileName" value={fileName} onChange={handleFileNameChange} required/>
            </label>
            <br />
           
          </>
        )}
      </>
    );
  };

export default FormAllDataBody;