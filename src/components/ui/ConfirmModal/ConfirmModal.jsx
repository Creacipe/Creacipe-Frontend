// LOKASI: src/components/ui/ConfirmModal/ConfirmModal.jsx

import React, { useEffect } from "react";
import "./ConfirmModal.scss";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal">
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
          </div>
        )}
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
