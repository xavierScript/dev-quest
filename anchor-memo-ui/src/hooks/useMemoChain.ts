import { useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import type { AnchorSplMemo } from '../idl/anchor_spl_memo';
import type { ErrorType } from '../types/types';
import idl from '../idl/anchor_spl_memo.json';
import { MEMO_PROGRAM_ID, EXPLORER_URL } from '../CONSTANTS/constants';

interface UseMemoChainReturn {
  sendMemo: (text: string) => Promise<void>;
  error: ErrorType | null;
  isLoading: boolean;
  successNotification: { message: string; txUrl: string; txId: string } | null;
  setError: (error: ErrorType | null) => void;
  setSuccessNotification: (notification: { message: string; txUrl: string; txId: string } | null) => void;
}

export const useMemoChain = (): UseMemoChainReturn => {
  const [error, setError] = useState<ErrorType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successNotification, setSuccessNotification] = useState<{ message: string; txUrl: string; txId: string } | null>(null);
  
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const sendMemo = async (text: string) => {
    if (!wallet) {
      setError({
        message: 'Please connect your wallet to send memos',
        severity: 'warning',
        code: 'NO_WALLET'
      });
      return;
    }

    if (!text.trim()) {
      setError({
        message: 'Please enter some text for your memo',
        severity: 'warning',
        code: 'EMPTY_MEMO'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const program = new Program(idl as AnchorSplMemo, provider);
      
      const tx = await program.methods
        .sendMemo(text)
        .accounts({
          payer: wallet.publicKey,
          memoProgram: MEMO_PROGRAM_ID,
        }).rpc();

      const txUrl = `${EXPLORER_URL}/tx/${tx}?cluster=devnet`;
      setSuccessNotification({
        message: 'Memo sent successfully!',
        txUrl,
        txId: tx
      });
    } catch (err: any) {
      console.error('Error sending memo:', err);
      
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

  return {
    sendMemo,
    error,
    isLoading,
    successNotification,
    setError,
    setSuccessNotification
  };
};
