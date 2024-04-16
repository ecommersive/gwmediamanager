import React, { useState } from 'react';
import Modal from './ModalComponent';

const VideoViewer = ({ videoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button onClick={handleOpen}>View Video</button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <iframe
          src={videoUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '500px' }}  // Set appropriate dimensions
        ></iframe>
      </Modal>
    </>
  );
};

export default VideoViewer;
