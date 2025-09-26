'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify-icon/react';
import { cn } from '@/lib/utils';

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
    full: 'max-w-7xl',
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

    const focusableElementsSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
      className={cn(
        'starting:opacity-0 inset-0 m-auto max-h-[90vh] w-full overflow-auto rounded-lg bg-white shadow-xl transition-all backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        sizeClasses[size],
      )}
      aria-labelledby="modal-title"
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="grid place-items-center rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Close modal"
        >
          <Icon icon="solar:close-circle-bold" className="text-2xl" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </dialog>
  );

  // Portal the modal to the body
  return createPortal(modalContent, document.body);
}
