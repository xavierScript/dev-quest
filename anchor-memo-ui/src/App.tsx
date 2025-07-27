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
  const [memoText, setMemoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorType | null>(null);
  const [successNotification, setSuccessNotification] = useState<{ message: string; txUrl: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

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
          code: 'INSUFFICIENT_FUNDS'
        });
      } else if (err.message?.includes('User rejected')) {
        setError({
          message: 'Transaction was cancelled by user',
          severity: 'warning',
          code: 'USER_CANCELLED'
        });
      } else if (err.message?.includes('timeout')) {
        setError({
          message: 'Transaction timed out. Please try again',
          severity: 'error',
          code: 'TIMEOUT'
        });
      } else {
        setError({
          message: 'Failed to send memo. Please try again',
          severity: 'error',
          code: 'UNKNOWN_ERROR'
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
        </div>

        {error && (
          <div className={`error-message error-${error.severity}`}>
            {error.message}
          </div>
        )}
        
        <div className="memo-input-container">
          <input
            type="text"
            placeholder="Type your memo..."
            value={memoText}
            onChange={(e) => {
              setMemoText(e.target.value);
              if (error?.code === 'EMPTY_MEMO') {
                setError(null);
              }
            }}
            className={`memo-input ${!memoText.trim() ? 'empty' : ''} ${isShaking ? 'shake' : ''}`}
            disabled={isLoading}
          />
          <div className="input-tooltip">
            Please enter your memo text here
          </div>
        </div>
        
        <button
          onClick={memoText.trim() ? sendMemo : handleEmptyMemoClick}
          disabled={isLoading || !wallet}
          className={`send-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Sending...' : 'Send Memo'}
        </button>
      </div>
    </div>
  );
}

export default App;
