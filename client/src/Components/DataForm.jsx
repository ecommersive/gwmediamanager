// DataFormModal.js
import React from 'react';
import SearchInput from './SearchInput'; // Assuming you have this component

const DataFormModal = ({
  catData, handleInputChange, handleSubmit, handleSubmitSetModal, handleAddNoteSubmit,
  handleAddToSet, itemExists, modalFilteredData, modalSearchTerm, setModalSearchTerm,
  fileName, startDate, endDate, startTime, fileData, errorMessage, setShowModal,
  notes, newNote, editingNoteId, editingNoteText, handleEditNote, handleDoneEditNote, handleDeleteNote
}) => {
  return (
    <>
      <form onSubmit={catData.includes('Note') ? (e) => handleAddNoteSubmit(e, fileName) : handleSubmit}>
        <h2>{`${catData.replace(/([A-Z])/g, ' $1').trim()}`}</h2>
        {(catData === 'addData' || catData === 'ExtendExpiry' || catData === 'DeleteData') && (
          <>
            <label>
              Category:
              <select value={fileData.selectedCategory} onChange={e => handleInputChange('selectedCategory', e.target.value)}>
                <option value="Playlist">Playlist</option>
                <option value="Ads">Ads</option>
                {catData !== 'addData' && <option value="Archived">Archived</option>}
              </select>
            </label>
            <br />
            <label>
              File Name:
              <input type="text" name="fileName" value={fileData.fileName} onChange={e => handleInputChange('fileName', e.target.value)} />
              {errorMessage.FileName && <div style={{ color: 'red' }}>{errorMessage.FileName}</div>}
            </label>
            <br />
          </>
        )}
        {catData === 'addData' && (
          <>
            <label>File Type:<select name="type" value={fileData.type} onChange={e => handleInputChange('type', e.target.value)}>
              <option value="Video">Video</option>
              <option value="PNG">PNG</option>
              <option value="JPG">JPG</option>
            </select></label>
            <br />
            <label>Tag:<input name="tag" value={fileData.tag} onChange={e => handleInputChange('tag', e.target.value)} /></label>
            <br />
            <label>Photo URL:<input type="text" name="photoUrl" value={fileData.photoUrl} onChange={e => handleInputChange('photoUrl', e.target.value)} /></label>
            <br />
            <label>Run Time:<input type="text" name="runTime" value={fileData.runTime} onChange={e => handleInputChange('runTime', e.target.value)} /></label>
            <br />
            <label>Type:<input type="text" name="content" value={fileData.content} onChange={e => handleInputChange('content', e.target.value)} /></label>
            <br />
            <label>Video URL:<input type="text" name="videoUrl" value={fileData.videoUrl} onChange={e => handleInputChange('videoUrl', e.target.value)} /></label>
            <br />
          </>
        )}
        {(catData === 'addData' || catData === 'ExtendExpiry') && (
          <>
            <label>
              {catData === 'addData' ? 'Expiry Date:' : 'New Expiry Date:'}
              <input type="date" name="expiryDate" value={fileData.expiry} onChange={e => handleInputChange('expiry', e.target.value)} />
            </label>
            <br />
            <br />
          </>
        )}
        <button type="submit">Submit</button>
      </form>
      {(catData.includes('Schedule')) && (
        <>
          <SearchInput searchTerm={modalSearchTerm} setSearchTerm={setModalSearchTerm} />
          {modalFilteredData.map((modalItem, index) => (
            <div key={index}>
              <span>{modalItem.FileName}</span>
              {!itemExists(modalItem.FileName) && (
                <button onClick={(event) => handleAddToSet(event, modalItem.FileName)}>Add</button>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default DataFormModal;
