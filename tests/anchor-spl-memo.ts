import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorSplMemo } from "../target/types/anchor_spl_memo";

describe("anchor-spl-memo", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnchorSplMemo as Program<AnchorSplMemo>;

  it("Is initialized!", async () => {

    const signerA = anchor.web3.Keypair.generate()
    const signerB = anchor.web3.Keypair.generate()
    const signerC = anchor.web3.Keypair.generate()


    const tx = await program.methods
      .sendMemo("hello world")
      .remainingAccounts([
        { pubkey: signerA.publicKey, isSigner: true, isWritable: false },
        { pubkey: signerB.publicKey, isSigner: true, isWritable: false },
        { pubkey: signerC.publicKey, isSigner: true, isWritable: false },

      ])
      .signers([signerA, signerB, signerC])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
