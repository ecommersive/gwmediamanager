import React, {useEffect} from 'react'
const FormAllDataBody = ({ catData, currentData, handleSelectedCategoryChange, fileName, handleFileNameChange }) => {
    const shouldRenderCategory = catData === 'ExtendExpiry' || catData === 'DeleteData' || catData === 'deleteScheduleData';
  
    useEffect(() => {
      handleSelectedCategoryChange({target: {value: currentData}})
    }, [])
    
    return (
      <>
        {shouldRenderCategory && (
          <>
            <label>
              Category: {currentData === 'Playlist' ? 'Content' : currentData === 'Ads' ? 'Ads' : currentData === 'Playlist Schedule' ? 'Playlist Schedule' : currentData === 'Ads Schedule' ? 'Ads Schedule' :''}
            </label>
            <br />

            
            <label>
              {currentData === 'Playlist' || currentData === 'Ads' ? 'File Name: ' : currentData === 'Playlist Schedule' || currentData === 'Ads Schedule' ? 'Folder: ' : ''}
              <input
              type={currentData === 'Playlist Schedule' || currentData === 'Ads Schedule' ? 'number' : 'text'}
              name="fileName"
              value={fileName}
              onChange={handleFileNameChange}
              required
            />
            </label>
            <br />
           
          </>
        )}
      </>
    );
  };

export default FormAllDataBody;