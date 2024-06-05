import React, { useState } from 'react';
import mediaInfoFactory from 'mediainfo.js';

const Test = ({ catData }) => {
  const [file, setFile] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [result, setResult] = useState(null);

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

  const renderResult = (data) => {
    if (!data) return null;

    const generalInfo = data.media.track.find(track => track['@type'] === 'General');
    const videoInfo = data.media.track.find(track => track['@type'] === 'Video');
    const audioInfo = data.media.track.find(track => track['@type'] === 'Audio');

    return (
      <div>
        <h2>General Info:</h2>
        {generalInfo && renderInfo(generalInfo)}
        <h2>Video Info:</h2>
        {videoInfo && renderInfo(videoInfo)}
        <h2>Audio Info:</h2>
        {audioInfo && renderInfo(audioInfo)}
      </div>
    );
  };

  return (
    catData === 'TestModal' && (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: '1px solid black', padding: '20px', width: '300px' }}
      >
        {file ? (
          <div>
            {result && (
              <div>
                <h2>Filename:</h2>
                <p><b>File name: </b>{file.name}</p>
                {renderResult(result)}
              </div>
            )}
          </div>
        ) : (
          <p>Drag and drop a file here</p>
        )}
      </div>
    )
  );
};

export default Test;
