import { useState, useEffect } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, Program, web3, setProvider } from '@coral-xyz/anchor';
import idl from './anchor_spl_memo.json';
import type { AnchorSplMemo } from './anchor_spl_memo';
import type { ErrorType } from './types';
import './App.css';

// const programID = new web3.PublicKey('38CCrZs232VvV1aJqTKyvYNUwxC8zcmRwzwSFmh54A4y');
const memoProgramID = new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');


function App() {
  const MEMO_MAX_LENGTH = 280; // Set a reasonable max length for the memo
  
  const [memoText, setMemoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorType | null>(null);
  const [successNotification, setSuccessNotification] = useState<{ message: string; txUrl: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showWalletHighlight, setShowWalletHighlight] = useState(false);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only process if not in loading state
      if (isLoading) return;

      // Enter to send memo
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (memoText.trim() && wallet) {
          sendMemo();
        } else if (!wallet) {
          setError({
            message: 'Please connect your wallet to send memos',
            severity: 'warning',
            code: 'NO_WALLET'
          });
          setShowWalletHighlight(true);
          setTimeout(() => setShowWalletHighlight(false), 3000);
        } else if (!memoText.trim()) {
          handleEmptyMemoClick();
        }
      }

      // Escape to clear input
      if (e.key === 'Escape') {
        setMemoText('');
        setError(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [memoText, wallet, isLoading]); // Dependencies for the effect

  // Auto-hide success notification
  useEffect(() => {
    if (successNotification) {
      const timer = setTimeout(() => {
        setSuccessNotification(null);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successNotification]);

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.querySelector('.particles');
      if (particlesContainer) {
        for (let i = 0; i < 9; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particlesContainer.appendChild(particle);
        }
      }
    };
    createParticles();
  }, []);

  const handleEmptyMemoClick = () => {
    setIsShaking(true);
    setError({
      message: 'Please enter some text for your memo',
      severity: 'warning',
      code: 'EMPTY_MEMO'
    });
    setTimeout(() => setIsShaking(false), 500);
  };

  const sendMemo = async () => {
    setError(null);

    if (!wallet) {
      setError({
        message: 'Please connect your wallet to send memos',
        severity: 'warning',
        code: 'NO_WALLET'
      });
      setShowWalletHighlight(true);
      setTimeout(() => setShowWalletHighlight(false), 3000);
      return;
    }

    if (!memoText.trim()) {
      handleEmptyMemoClick();
      return;
    }

    setIsLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const program = new Program(idl as AnchorSplMemo, provider);

      const txSig = await program.methods
        .sendMemo(memoText)
        .accounts({
          payer: wallet.publicKey,
          memoProgram: memoProgramID,
        }).transaction();

      // Add success animation
      const button = document.querySelector('.send-button');
      if (button) {
        button.classList.add('success-animation');
        setTimeout(() => button.classList.remove('success-animation'), 600);
      }

      // Show success message with transaction details
      const txUrl = `https://explorer.solana.com/tx/${txSig}?cluster=devnet`;
      setSuccessNotification({
        message: 'Memo sent successfully!',
        txUrl: txUrl
      });
      
      setMemoText('');
    } catch (err: any) {
      console.error('Error sending memo:', err);
      
      // Handle different types of errors
      if (err.message?.includes('insufficient funds')) {
        setError({
          message: 'Insufficient funds in your wallet to complete this transaction',
          severity: 'error',
          code: 'INSUFFICIENT_FUNDS',
          isRetriable: false
        });
      } else if (err.message?.includes('User rejected')) {
        setError({
          message: 'Transaction was cancelled by user',
          severity: 'warning',
          code: 'USER_CANCELLED',
          isRetriable: true
        });
      } else if (err.message?.includes('timeout')) {
        setError({
          message: 'Transaction timed out. Please try again',
          severity: 'error',
          code: 'TIMEOUT',
          isRetriable: true
        });
      } else {
        setError({
          message: 'Failed to send memo. Please try again',
          severity: 'error',
          code: 'UNKNOWN_ERROR',
          isRetriable: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Success notification */}
      {successNotification && (
        <div className="notification notification-success">
          <span>✅ {successNotification.message}</span>
          <a 
            href={successNotification.txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="notification-link"
          >
            View transaction
          </a>
        </div>
      )}

      {/* Floating particles background */}
      <div className="particles"></div>
      
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
          <div className={`error-message error-${error.severity}`}>
            <span>{error.message}</span>
            {error.isRetriable && (
              <button 
                onClick={() => {
                  setError(null);
                  sendMemo();
                }}
                className="retry-button"
              >
                Retry
              </button>
            )}
          </div>
        )}
        
        <div className="memo-input-container">
          <input
            type="text"
            placeholder="Type your memo..."
            value={memoText}
            onChange={(e) => {
              const newText = e.target.value;
              if (newText.length <= MEMO_MAX_LENGTH) {
                setMemoText(newText);
                if (error?.code === 'EMPTY_MEMO') {
                  setError(null);
                }
              }
            }}
            maxLength={MEMO_MAX_LENGTH}
            className={`memo-input ${!memoText.trim() ? 'empty' : ''} ${isShaking ? 'shake' : ''}`}
            disabled={isLoading}
          />
          <div className="input-tooltip">
            Press Enter to send • Esc to clear
          </div>
          <div className={`character-counter ${
            memoText.length >= MEMO_MAX_LENGTH ? 'at-limit' :
            memoText.length >= MEMO_MAX_LENGTH * 0.9 ? 'near-limit' : ''
          }`}>
            {memoText.length}/{MEMO_MAX_LENGTH}
          </div>
        </div>
        
        <button
          onClick={() => {
            if (!wallet) {
              setError({
                message: 'Please connect your wallet to send memos',
                severity: 'warning',
                code: 'NO_WALLET'
              });
              setShowWalletHighlight(true);
              setTimeout(() => setShowWalletHighlight(false), 3000);
            } else if (!memoText.trim()) {
              handleEmptyMemoClick();
            } else {
              sendMemo();
            }
          }}
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
