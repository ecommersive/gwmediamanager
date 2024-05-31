import React, { useEffect } from 'react';

const Test = ({ catData, file, setFile, metadata, setMetadata}) => {

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
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const handleFileDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Test;