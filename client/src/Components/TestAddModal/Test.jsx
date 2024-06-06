import React, { useState } from 'react';
import mediaInfoFactory from 'mediainfo.js';

const Test = ({ catData, currentData, handleSelectedCategoryChange, tag, handleTagChange, content, handleContentChange, expiry, handleExpiryChange }) => {
  const [file, setFile] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [result, setResult] = useState(null);
  console.log('catData ===== ', catData);
  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFile(file);

    try {
      const mediaInfoInstance = await mediaInfoFactory({ locateFile: () => '/MediaInfoModule.wasm' });
      setMediaInfo(mediaInfoInstance);

      const fileSize = file.size;
      const readChunk = async (chunkSize, offset) => {
        const buffer = await file.slice(offset, offset + chunkSize).arrayBuffer();
        return new Uint8Array(buffer);
      };

      const result = await mediaInfoInstance.analyzeData(fileSize, readChunk);
      setResult(result);
      console.log('resulttttttttttttttttt=', result);
    } catch (error) {
      console.error('Error analyzing file:', error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

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

  // const renderResult = (data) => {
  //   if (!data) return null;

  //   const generalInfo = data.media.track.find(track => track['@type'] === 'General');
  //   const videoInfo = data.media.track.find(track => track['@type'] === 'Video');
  //   const audioInfo = data.media.track.find(track => track['@type'] === 'Audio');

  //   return (
  //     <div>
  //       <h2>General Info:</h2>
  //       {generalInfo && renderInfo(generalInfo)}
  //       <h2>Video Info:</h2>
  //       {videoInfo && renderInfo(videoInfo)}
  //       <h2>Audio Info:</h2>
  //       {audioInfo && renderInfo(audioInfo)}
  //     </div>
  //   );
  // };
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
        <p><b>File Type: </b>{fileType}</p>
        {videoInfo && <p><b>Duration:</b> {formatDuration(videoInfo.Duration)}</p>}
      </div>
    );
  };
  
  const formatDuration = (duration) => {
    const seconds = Math.floor(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }



  return (
    catData === 'TestModal' && (
      <>

        <div

          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ border: '1px solid black', padding: '20px', width: '300px' }}
        >

          {file ? (
            <div>
              {result && (
                <div>
                   
                  <p><b>Category: </b>{currentData}</p>
                  <p><b>File name: </b>{file.name}</p>
                  {renderResult(result)} 
                 <label>
                    <b>Tag:</b>
                    <input name="tag" value={tag} onChange={handleTagChange} />
                  </label>
                  <br />
                  <label>
                    <b>Type:</b>
                    <input type="text" name="content" value={content} onChange={handleContentChange} required />
                  </label>
                  <br />
                  <label>
                    <b>Expiry Date:</b>
                    <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
                  </label>
                  {/* <br />
                  {renderResult(result)} */}
                </div>
              )}
            </div>
          ) : (
            <p>Drag and drop a file here</p>
          )}
        </div>


      </>
    )
  );
};

export default Test;
