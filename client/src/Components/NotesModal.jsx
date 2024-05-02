// NotesModal.js
import React from 'react';
import Modal from './Modal';

const NotesModal = ({ isOpen, notes, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Notes</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>{note.text}</li>
        ))}
      </ul>
    </Modal>
  );
};

export default NotesModal;
