import React from 'react';

const FormAddDataBody = ({ catData, currentData, tag, handleTagChange, content, handleContentChange, expiry, handleExpiryChange, handleDrop, handleDragOver, file, result, isAdmin }) => {
  
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

  const extractAndRenderData = (data) => {
    if (!data) return null;

    const generalInfo = data.media.track.find(track => track['@type'] === 'General');
    const videoInfo = data.media.track.find(track => track['@type'] === 'Video');
    const audioInfo = data.media.track.find(track => track['@type'] === 'Audio');

    const generalData = {
      'Overall BitRate': generalInfo?.OverallBitRate || 'N/A',
    };

    const videoData = {
      'ColorSpace': videoInfo?.ColorSpace || 'N/A',
      'ChromaSubsampling': videoInfo?.ChromaSubsampling || 'N/A',
      'BitDepth': videoInfo?.BitDepth || 'N/A',
      'ScanType': videoInfo?.ScanType || 'N/A'
    };

    const audioData = {
      'BitMode': audioInfo?.BitMode || 'N/A',
      'BitRate': audioInfo?.BitRate_Mode || 'N/A',
      'Compression Mode': audioInfo?.Compression_Mode || 'N/A'
    };

    return (
      <div>
        <h3>General Info:</h3>
        {renderInfo(generalData)}
        <h3>Video Info:</h3>
        {renderInfo(videoData)}
        <h3>Audio Info:</h3>
        {renderInfo(audioData)}
      </div>
    );
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
                    <label>
                      Type:
                      <input type="text" name="content" value={content} onChange={handleContentChange} required />
                    </label>
                    <br />
                    <label>
                      Expiry Date:
                      <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
                    </label>
                    {isAdmin && <><h1>Admin Info:</h1>
                    {extractAndRenderData(result)}</>}
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
