import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ConfigModalProps {
  onRegister: (email: string) => void;
  onClose: () => void;
}

export default function ConfigModal({ onRegister, onClose }: ConfigModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.warning('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onRegister(email);
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface border border-border2 rounded-3xl p-7 w-96 max-w-90vw transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold mb-1.5 tracking-tight">
          Get Started with Robin
        </h2>
        <p className="text-xs text-text3 mb-5 leading-relaxed">
          Enter your email to start chatting with Robin. Your preferences will be saved locally.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text2 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              className="w-full bg-surface2 border border-border2 rounded-r-sm px-3 py-2 text-xs text-text outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          <div className="flex gap-2.5 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 rounded-r-sm border border-border2 bg-transparent text-text2 text-xs font-medium cursor-pointer hover:bg-surface2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4.5 py-2 rounded-r-sm border-none bg-accent text-white text-xs font-medium font-medium cursor-pointer hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Start Chatting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
