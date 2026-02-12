import React from 'react';
import Button from './Button';

/**
 * Modal - Mobile-friendly modal component
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-2',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`bg-white rounded-xl shadow-lg w-full md:w-auto md:${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-bounce-in relative z-50`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-earth-200 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between z-10 rounded-t-xl">
          <h2 className="text-lg md:text-base font-bold text-earth-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-earth-400 hover:text-earth-600 transition-colors p-1"
          >
            <svg
              className="w-6 h-6 md:w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 py-4 md:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-earth-200 px-4 md:px-6 py-4 md:py-5 bg-earth-50">
            {footer}
          </div>
        )}
      </div>

      {/* Backdrop click handler */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => closeOnBackdrop && onClose()}
      />
    </div>
  );
};

/**
 * Confirmation Dialog
 */
export const ConfirmDialog = ({
  isOpen = false,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      closeOnBackdrop={false}
      size="sm"
    >
      <p className="text-earth-700 text-base md:text-sm mb-6">{message}</p>
      <div className="button-group">
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          size="lg"
          fullWidth
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onCancel}
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

/**
 * Alert Dialog
 */
export const AlertDialog = ({
  isOpen = false,
  title,
  message,
  onClose,
  variant = 'info',
}) => {
  const variantIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠️',
    info: 'ℹ',
  };

  const variantColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      closeOnBackdrop={true}
      size="sm"
    >
      <div className="text-center mb-6">
        <div className={`text-5xl md:text-4xl mb-4 ${variantColors[variant]}`}>
          {variantIcons[variant]}
        </div>
        <p className="text-earth-700 text-base md:text-sm">{message}</p>
      </div>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onClose}
      >
        OK
      </Button>
    </Modal>
  );
};

export default Modal;
