import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Post from './Post';
import './Modal.css';

const PostModal = ({ isOpen, onClose, post, birdName, username }) => {
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
        <div className="post-content">
          <Post post={post} birdName={birdName} username={username} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PostModal;