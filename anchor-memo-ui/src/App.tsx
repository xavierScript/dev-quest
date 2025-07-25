import React, { useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, Program, web3, utils } from '@coral-xyz/anchor';
import idl from './idl.json';

const programID = new web3.PublicKey(idl.address);
const memoProgramID = new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

function App() {
  const [memoText, setMemoText] = useState('');
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const sendMemo = async () => {
    if (!wallet) return alert('Connect your wallet');

    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl as any, programID, provider);

    try {
      const txSig = await program.methods
        .sendMemo(memoText)
        .accounts({
          payer: wallet.publicKey,
          memoProgram: memoProgramID,
        })
        .rpc();

      alert(`✅ Memo sent! Tx Signature:\n${txSig}`);
    } catch (err) {
      console.error(err);
      alert('❌ Error sending memo');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📜 Solana Memo Sender</h1>
      <WalletMultiButton />
      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Type your memo..."
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
      </div>
      <button
        onClick={sendMemo}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Send Memo
      </button>
    </div>
  );
}

export default App;
