const FormAllDataBody = ({ catData, selectedCategory, handleSelectedCategoryChange, fileName, handleFileNameChange }) => {
    const shouldRenderCategory = catData === 'addData' || catData === 'ExtendExpiry' || catData === 'DeleteData';
  
    return (
      <>
        {shouldRenderCategory && (
          <>
            <label>
              Category:
              <select value={selectedCategory} onChange={handleSelectedCategoryChange}>
                <option value="Playlist">Playlist</option>
                <option value="Ads">Ads</option>
              </select>
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