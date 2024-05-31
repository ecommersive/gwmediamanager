import React, { useEffect, useRef } from 'react';

const Test = ({ catData, file, setFile, metadata, setMetadata}) => {
  const audioRef = useRef(null);
  console.log('time',file.lastModifiedDate.getSeconds());
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileType = file.type;
        const fileSize = file.size;
        const fileModifiedDate = file.lastModifiedDate;

        setMetadata({
          name: file.name,
          size: fileSize,
          type: fileType,
          mtime: fileModifiedDate,
        });

        if (fileType.startsWith('audio/')) {
          const audio = new Audio(reader.result);
          audio.addEventListener('loadedmetadata', () => {
            setMetadata(prevMetadata => ({ ...prevMetadata, duration: audio.duration }));
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const handleFileDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };
  console.log('metadata = ', metadata);
  return (
    <div
      onDrop={handleFileDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      {catData === 'TestModal' && (
        <>
          <h1>Hello World</h1>
          {metadata && (
            <div>
              <p>File name: {metadata.name}</p>
              <p>File size: {metadata.size} bytes</p>
              <p>File type: {metadata.type}</p>
              <p>Last modified: {metadata.mtime.toLocaleString()}</p>
              {metadata.duration && <p>Duration: {metadata.duration} seconds</p>}
            </div>
          )}
          {audioRef.current && <audio ref={audioRef} src={file} />}
        </>
      )}
    </div>
  );
};

export default Test;