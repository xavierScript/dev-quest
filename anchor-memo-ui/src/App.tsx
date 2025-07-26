import { useState, useEffect } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, Program, web3, setProvider } from '@coral-xyz/anchor';
import idl from './anchor_spl_memo.json';
import type { AnchorSplMemo } from './anchor_spl_memo';
import './App.css';

const programID = new web3.PublicKey('38CCrZs232VvV1aJqTKyvYNUwxC8zcmRwzwSFmh54A4y');
const memoProgramID = new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function App() {
  const [memoText, setMemoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

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

  const sendMemo = async () => {
    if (!wallet) {
      alert('⚠️ Connect your wallet first.');
      return;
    }

    if (!memoText.trim()) {
      alert('⚠️ Please enter a memo text.');
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const program = new Program(idl as AnchorSplMemo, provider);

      // Debug logs
    console.log('IDL:', idl);
    console.log('Program methods:', Object.keys((program as any).methods));
    console.log('Trying to call sendMemo:', (program as any).methods.sendMemo);

      const txSig = await program.methods
        .sendMemo(memoText)
        .accounts({
          payer: wallet.publicKey,
          memoProgram: memoProgramID,
        }).postInstructions([
    web3.SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: web3.Keypair.generate().publicKey,
      lamports: 1,
    })
  ])
        .rpc();

      console.log(txSig);
      setIsSuccess(true);
      
      // Add success animation
      const button = document.querySelector('.send-button');
      if (button) {
        button.classList.add('success-animation');
        setTimeout(() => button.classList.remove('success-animation'), 600);
      }

      alert(`✅ Memo sent!\nTx Signature:\n${txSig}`);
      setMemoText('');
    } catch (err) {
      console.error('❌ Error sending memo:', err);
      alert('❌ Failed to send memo. Check console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Floating particles background */}
      <div className="particles"></div>
      
      <div className="glass-card">
        <h1 className="app-title">📜 Solana Memo Sender</h1>
        
        <div className="wallet-button-container">
          <WalletMultiButton />
        </div>
        
        <input
          type="text"
          placeholder="Type your memo..."
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          className="memo-input"
          disabled={isLoading}
        />
        
        <button
          onClick={sendMemo}
          disabled={isLoading || !wallet || !memoText.trim()}
          className={`send-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Sending...' : 'Send Memo'}
        </button>
      </div>
    </div>
  );
}

export default App;
