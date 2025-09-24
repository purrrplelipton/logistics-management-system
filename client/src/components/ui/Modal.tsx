'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import closeIcon from '@iconify-icons/solar/close-circle-bold';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Modal({ isOpen, onClose, title, children, size = 'lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Show the dialog
      dialog.showModal();
      
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
    } else {
      // Close the dialog
      dialog.close();
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle dialog close events
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

  // Implement focus trapping since native dialog doesn't handle it reliably
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleTabNavigation = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = dialog.querySelectorAll(focusableElementsSelector);
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        // Shift + Tab - moving backwards
        if (document.activeElement === firstElement || document.activeElement === dialog) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab - moving forwards
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    dialog.addEventListener('keydown', handleTabNavigation);
    
    // Focus the first focusable element when modal opens
    const focusableElements = dialog.querySelectorAll(focusableElementsSelector);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    return () => {
      dialog.removeEventListener('keydown', handleTabNavigation);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-none max-h-none w-screen h-screen"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-center min-h-full p-4 sm:p-6 lg:p-8">
        <div
          className={`
            bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]}
            max-h-[90vh] overflow-hidden flex flex-col
            transform transition-all duration-200 ease-out
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <Icon icon={closeIcon} className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );

  // Portal the modal to the body
  return createPortal(modalContent, document.body);
}