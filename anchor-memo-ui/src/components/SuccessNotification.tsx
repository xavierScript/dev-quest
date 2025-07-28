import { type FC, useEffect } from 'react';
import { SUCCESS_NOTIFICATION_DURATION, COPY_NOTIFICATION_DURATION } from '../CONSTANTS/constants';
import { useState } from 'react';

interface SuccessNotificationProps {
  message: string;
  txUrl: string;
  txId: string;
  onClose: () => void;
}

export const SuccessNotification: FC<SuccessNotificationProps> = ({ 
  message,
  txUrl,
  txId,
  onClose
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(onClose, SUCCESS_NOTIFICATION_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(txId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPY_NOTIFICATION_DURATION);
  };

  return (
    <div className="notification notification-success">
      <span>✅ {message}</span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <a 
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="notification-link"
        >
          View transaction
        </a>
        <button 
          className={`copy-button ${isCopied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          <span className="copy-icon">{isCopied ? '✓' : '📋'}</span>
          {isCopied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>
    </div>
  );
};
