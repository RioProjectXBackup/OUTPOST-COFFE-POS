import React from 'react';
import { AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'info',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertOctagon className="w-6 h-6 text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-100',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
      border: 'border-rose-100',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
      border: 'border-amber-100',
    },
    info: {
      icon: <Info className="w-6 h-6 text-brand-green-800" />,
      iconBg: 'bg-brand-green-50 border-brand-green-100',
      buttonBg: 'bg-brand-green-900 hover:bg-brand-green-950 text-white focus:ring-brand-green-800',
      border: 'border-brand-green-100',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden transform transition-all p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header/Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}>
            {currentVariant.icon}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-sm font-extrabold text-stone-900 tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200/60 text-stone-600 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-stone-200 cursor-pointer active:scale-98"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer active:scale-98 ${currentVariant.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
