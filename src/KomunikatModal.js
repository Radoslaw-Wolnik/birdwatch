import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const KomunikatModal = ({ isOpen, onClose, title, description }) => {
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <div className="komunikat-content">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default KomunikatModal;
