import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="errorMessage">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span>{message}</span>
    {onRetry && (
      <button
        type="button"
        className="errorRetryButton"
        onClick={onRetry}
        style={{
          marginLeft: '12px',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid currentColor',
          background: 'transparent',
          cursor: 'pointer',
          color: 'inherit',
          fontWeight: 600,
        }}
      >
        重新加载
      </button>
    )}
  </div>
);

