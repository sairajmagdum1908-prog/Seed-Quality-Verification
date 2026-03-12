import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger"
}: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void,
  confirmText?: string,
  cancelText?: string,
  type?: "danger" | "primary"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#1A1A1A] rounded-[32px] p-8 border border-white/10 shadow-2xl space-y-6"
      >
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
              type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-agri-green hover:bg-agri-green/90 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
      type === 'success' ? 'bg-agri-green/20 border-agri-green/30 text-white' : 'bg-red-500/20 border-red-500/30 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-agri-green" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
    <span className="text-sm font-bold tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors">
      <X className="w-4 h-4 opacity-50" />
    </button>
  </motion.div>
);

export const LoadingOverlay = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-12 h-12 text-agri-green animate-spin" />
    <p className="text-white font-medium animate-pulse">{message || 'Processing...'}</p>
  </div>
);

export const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div className={`glass rounded-[32px] p-6 ${className}`} onClick={onClick}>
    {children}
  </div>
);

export const Badge = ({ children, color = "green" }: { children: React.ReactNode, color?: "green" | "red" | "yellow" | "blue" }) => {
  const colors = {
    green: "bg-agri-green/20 text-agri-green border-agri-green/30",
    red: "bg-red-500/20 text-red-500 border-red-500/30",
    yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[color]}`}>
      {children}
    </span>
  );
};
