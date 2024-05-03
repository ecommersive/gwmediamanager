import React from 'react';

const DataForm = ({
  catData,
  handleSubmit,
  selectedCategory,
  handleSelectedCategoryChange,
  fileName,
  handleFileNameChange,
  errorMessage,
  type,
  handleTypeChange,
  tag,
  handleTagChange,
  photoUrl,
  handlePhotoUrlChange,
  runTime,
  handleRunTimeChange,
  content,
  handleContentChange,
  videoUrl,
  handleVideoUrlChange,
  expiry,
  handleExpiryChange
}) => (
  <form onSubmit={handleSubmit}>
    <h2>
      {
        catData === 'addData' ?
          'Add New Data' :
          catData === 'ExtendExpiry' ?
            'Extend Expiry Date' :
            catData === 'DeleteData' ?
              'Delete Data' :
              catData === 'viewNotes' ?
                'View Notes' :
                catData === 'AddNote' ?
                  'Add Note' :
                  catData === 'UpdateNote' ?
                    'Update Note' :
                    catData === 'DeleteNote' ?
                      'Delete Note' :
                      catData === 'playlistSchedule' ?
                        'Create Playlist Set' :
                        catData === 'adsSchedule' ?
                          'Create Ads Set' :
                          ''
      }
    </h2>
    {
      (catData === 'addData' || catData === 'ExtendExpiry' || catData === 'DeleteData') && (
        <>
          <label>
            Category:
            <select value={selectedCategory} onChange={(event)=>handleSelectedCategoryChange(event.target.value)}>
              <option value="Playlist">Playlist</option>
              <option value="Ads">Ads</option>
              {(catData === 'ExtendExpiry' || catData === 'DeleteData') && <option value="Archived">Archived</option>}
            </select>
          </label>
          <br />
        </>
      )}
    {
      (catData === 'addData' || catData === 'ExtendExpiry' || catData === 'DeleteData') && (
        <>
          <label>
            File Name:
            <input type="text" name="fileName" value={fileName} onChange={(event)=>handleFileNameChange(event.target.value)} />
            {
              catData === 'addData' ?
                (errorMessage?.FileName && <div style={{ color: 'red' }}>{errorMessage.FileName}</div>)
                : catData === 'ExtendExpiry' ?
                  (errorMessage?.Expiry && <div style={{ color: 'red' }}>{errorMessage.Expiry}</div>)
                  : catData === 'DeleteData' ?
                    (errorMessage?.Delete && <div style={{ color: 'red' }}>{errorMessage.Delete}</div>)
                    :
                    null
            }
          </label>
          <br />
        </>
      )
    }
    {
      catData === 'addData' && (
        <>
          <label>
            File Type:
            <select name="type" value={type} onChange={(event)=>handleTypeChange(event.target.value)}>
              <option value="Video">Video</option>
              <option value="PNG">PNG</option>
              <option value="JPG">JPG</option>
            </select>
          </label>
          <br />
          <label>
            Tag:
            <input name="tag" value={tag} onChange={(event)=>handleTagChange(event.target.value)} />
          </label>
          <br />
          <label>
            Photo URL:
            <input type="text" name="photoUrl" value={photoUrl} onChange={(event)=>handlePhotoUrlChange(event.target.value)} />
            {errorMessage?.PhotoUrl && <div style={{ color: 'red' }}>{errorMessage.PhotoUrl}</div>}
          </label>
          <br />
          <label>
            Run Time:
            <input type="text" name="runTime" value={runTime} onChange={(event)=>handleRunTimeChange(event.target.value)} />
            {errorMessage?.Run_Time && <div style={{ color: 'red' }}>{errorMessage.Run_Time}</div>}
          </label>
          <br />
          <label>
            Type:
            <input type="text" name="content" value={content} onChange={(event)=>handleContentChange(event.target.value)} />
            {errorMessage?.Content && <div style={{ color: 'red' }}>{errorMessage.Content}</div>}
          </label>
          <br />
          <label>
            Video URL:
            <input type="text" name="videoUrl" value={videoUrl} onChange={(event)=>handleVideoUrlChange(event.target.value)} />
            {errorMessage?.videoUrl && <div style={{ color: 'red' }}>{errorMessage.videoUrl}</div>}
          </label>
          <br />
        </>
      )}
    {
      (catData === 'addData' || catData === 'ExtendExpiry') && (
        <>
          <label>
            {catData === 'addData' ? 'Expiry Date:' : catData === 'ExtendExpiry' ? 'New Expiry Date:' : ''}
            <input type="date" name="expiryDate" value={expiry} onChange={(event)=>handleExpiryChange(event.target.value)} />
          </label>
          <br />
          <br />
        </>
      )
    }

    <button type="submit">{catData === 'addData' ? 'Add Data' : catData === 'ExtendExpiry' ? 'Extend Expiry Date' : catData === 'DeleteData' ? 'Delete Data' : ''}</button>
  </form>
);

export default DataForm;