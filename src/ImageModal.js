import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <img src={imageUrl} alt="Post" />
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;