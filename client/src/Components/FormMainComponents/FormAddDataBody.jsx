import React from 'react';

const FormAddDataBody = ({ catData, currentData, tag, handleTagChange, content, handleContentChange, expiry, handleExpiryChange, fileName, photoUrl, type, runTime, handleDrop, handleDragOver, file, result }) => {

  const renderInfo = (info) => {
    return Object.entries(info).map(([key, value]) => {
      if (typeof value === 'object') {
        return (
          <div key={key}>
            <strong>{key}:</strong>
            <div style={{ marginLeft: '20px' }}>
              {renderInfo(value)}
            </div>
          </div>
        );
      }
      return (
        <div key={key}>
          <strong>{key}:</strong> {value.toString()}
        </div>
      );
    });
  };

  const renderResult = (data) => {
    if (!data) return null;

    const generalInfo = data.media.track.find(track => track['@type'] === 'General');
    const videoInfo = data.media.track.find(track => track['@type'] === 'Video');

    let fileType;
    if (videoInfo) {
      fileType = videoInfo['@type'];
    } else {
      fileType = generalInfo.Format;
    }

    return (
      <div>
        <p>File Type: {fileType}</p>
        {videoInfo && <p>Duration: {formatDuration(videoInfo.Duration)}</p>}
      </div>
    );
  };

  const formatDuration = (duration) => {
    const seconds = Math.floor(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    catData === 'addData' && (
      <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: '1px solid black', padding: '20px', width: '300px' }}
      >
        {file ? (
          <div>
            {result && (
              <>
                <div>
                  <p>Category: {currentData === 'Playlist' ? 'Content' : currentData === 'Ads' ? 'Ads' :''}</p>
                  <p>File name: {file.name}</p>
                  {renderResult(result)}
                  <label>
                    Tag:
                    <input name="tag" value={tag} onChange={handleTagChange} />
                  </label>
                  <br />
                  <p>Photo URL: {file.name}</p>
                  <label>
                    Type:
                    <input type="text" name="content" value={content} onChange={handleContentChange} required />
                  </label>
                  <br />
                  <label>
                    Expiry Date:
                    <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
                  </label>
                </div>
              </>
            )}
          </div>
        ) : (
          <p>Drag and drop a file here</p>
        )}
      </div>
      <br />
      </>
    )
  );
};

export default FormAddDataBody;
