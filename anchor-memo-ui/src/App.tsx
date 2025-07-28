import { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ErrorMessage } from './components/ErrorMessage';
import { MemoInput } from './components/MemoInput';
import { ParticlesBackground } from './components/ParticlesBackground';
import { SuccessNotification } from './components/SuccessNotification';
import { useMemoChain } from './hooks/useMemoChain';
import { WALLET_HIGHLIGHT_DURATION, SHAKE_DURATION } from './CONSTANTS/constants';
import '../src/styles/App.css';


function App() {
  const [memoText, setMemoText] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showWalletHighlight, setShowWalletHighlight] = useState(false);
  const wallet = useAnchorWallet();
  
  const {
    sendMemo,
    error,
    isLoading,
    successNotification,
    setError,
    setSuccessNotification
  } = useMemoChain();

  const handleEmptyMemoClick = () => {
    setIsShaking(true);
    setError({
      message: 'Please enter some text for your memo',
      severity: 'warning',
      code: 'EMPTY_MEMO'
    });
    setTimeout(() => setIsShaking(false), SHAKE_DURATION);
  };

  const handleSendMemo = () => {
    if (!wallet) {
      setError({
        message: 'Please connect your wallet to send memos',
        severity: 'warning',
        code: 'NO_WALLET'
      });
      setShowWalletHighlight(true);
      setTimeout(() => setShowWalletHighlight(false), WALLET_HIGHLIGHT_DURATION);
    } else if (!memoText.trim()) {
      handleEmptyMemoClick();
    } else {
      sendMemo(memoText);
    }
  };

  const handleKeyPress = () => {
    if (memoText.trim() && wallet) {
      handleSendMemo();
    } else if (!wallet) {
      setError({
        message: 'Please connect your wallet to send memos',
        severity: 'warning',
        code: 'NO_WALLET'
      });
      setShowWalletHighlight(true);
      setTimeout(() => setShowWalletHighlight(false), WALLET_HIGHLIGHT_DURATION);
    } else if (!memoText.trim()) {
      handleEmptyMemoClick();
    }
  };

  return (
    <div className="app-container">
      {successNotification && (
        <SuccessNotification
          message={successNotification.message}
          txUrl={successNotification.txUrl}
          txId={successNotification.txId}
          onClose={() => setSuccessNotification(null)}
        />
      )}

      <ParticlesBackground />
      
      <div className="glass-card">
        <h1 className="app-title">⛓️ MemoChain</h1>
        
        <div className="wallet-button-container">
          <div className="tooltip-container">
            <WalletMultiButton className="custom-wallet-button" />
            <div className="tooltip">
              Connect your Solana wallet to send memos on the blockchain
            </div>
          </div>
          {showWalletHighlight && <div className="wallet-highlight" />}
        </div>

        {error && (
          <ErrorMessage 
            error={error} 
            onRetry={error.isRetriable ? () => {
              setError(null);
              handleSendMemo();
            } : undefined}
          />
        )}
        
        <MemoInput
          value={memoText}
          onChange={(newText) => {
            setMemoText(newText);
            if (error?.code === 'EMPTY_MEMO') {
              setError(null);
            }
          }}
          isLoading={isLoading}
          isShaking={isShaking}
          onEnterPress={handleKeyPress}
          onEscapePress={() => {
            setMemoText('');
            setError(null);
          }}
        />
        
        <button
          onClick={handleSendMemo}
          disabled={isLoading}
          className={`send-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Sending...' : 'Send Memo'}
        </button>
      </div>
    </div>
  );
}

export default App;
