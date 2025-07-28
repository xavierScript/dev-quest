import { type FC, useEffect } from 'react';
import { MEMO_MAX_LENGTH } from '../CONSTANTS/constants';

interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  isShaking: boolean;
  onEnterPress: () => void;
  onEscapePress: () => void;
}

export const MemoInput: FC<MemoInputProps> = ({
  value,
  onChange,
  isLoading,
  isShaking,
  onEnterPress,
  onEscapePress
}) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onEnterPress();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onEscapePress();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoading, onEnterPress, onEscapePress]);

  return (
    <div className="memo-input-container">
      <input
        type="text"
        placeholder="Type your memo..."
        value={value}
        onChange={(e) => {
          const newText = e.target.value;
          if (newText.length <= MEMO_MAX_LENGTH) {
            onChange(newText);
          }
        }}
        maxLength={MEMO_MAX_LENGTH}
        className={`memo-input ${!value.trim() ? 'empty' : ''} ${isShaking ? 'shake' : ''}`}
        disabled={isLoading}
      />
      <div className="input-tooltip">
        Press Enter to send • Esc to clear
      </div>
      <div className={`character-counter ${
        value.length >= MEMO_MAX_LENGTH ? 'at-limit' :
        value.length >= MEMO_MAX_LENGTH * 0.9 ? 'near-limit' : ''
      }`}>
        {value.length}/{MEMO_MAX_LENGTH}
      </div>
    </div>
  );
};
