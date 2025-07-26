import { useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, Program, web3, setProvider } from '@coral-xyz/anchor';
import idl from './anchor_spl_memo.json'; // 🛠 IDL JSON import
import type { AnchorSplMemo } from './anchor_spl_memo'; // 🧾 Types only

const programID = new web3.PublicKey('38CCrZs232VvV1aJqTKyvYNUwxC8zcmRwzwSFmh54A4y'); // ✅ Use correct address path
const memoProgramID = new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function App() {
  const [memoText, setMemoText] = useState('');
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const sendMemo = async () => {
    if (!wallet) return alert('⚠️ Connect your wallet first.');

    const provider = new AnchorProvider(connection, wallet, {});
    setProvider(provider);

    // const program = new Program<AnchorSplMemo>(idl as AnchorSplMemo, programID as any, provider as any);
    const program = new Program(idl as AnchorSplMemo, programID as any, provider as any);


    try {
      const txSig = await program.methods
        .sendMemo(memoText)
        .accounts({
          payer: wallet.publicKey,
          memoProgram: memoProgramID,
        })
        .rpc();

        console.log(txSig);

      alert(`✅ Memo sent!\nTx Signature:\n${txSig}`);
    } catch (err) {
      console.error('❌ Error sending memo:', err);
      alert('❌ Failed to send memo. Check console.');
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
