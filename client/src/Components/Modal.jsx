// ModalComponent.js
import React from 'react';
import '../styles/modal.css';
const Modal = ({ isOpen, onClose, children, maxWidth  }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth }}>
        <button onClick={onClose} className="close-button">X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
