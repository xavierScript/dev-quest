import { type FC } from 'react';
import type { ErrorType } from '../types/types';

interface ErrorMessageProps {
  error: ErrorType;
  onRetry?: () => void;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ error, onRetry }) => {
  return (
    <div className={`error-message error-${error.severity}`}>
      <span>{error.message}</span>
      {error.isRetriable && onRetry && (
        <button 
          onClick={onRetry}
          className="retry-button"
        >
          Retry
        </button>
      )}
    </div>
  );
};
