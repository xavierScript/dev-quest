use anchor_lang::prelude::*;
use anchor_spl::memo::{build_memo, BuildMemo, Memo};

declare_id!("2p1eq5RNKv4MrESEPtA9za96diQnRHxLd48gz33Yq7r4");

#[program]
pub mod anchor_spl_memo {
    use std::mem::transmute;

    use super::*;

    pub fn send_memo(ctx: Context<InvokeMemoContext>, memo: String) -> Result<()> {
        // getting list of signers from remaining accounts
        let signers: Vec<AccountInfo> = unsafe {
            transmute(
                ctx.remaining_accounts
                    .iter()
                    .map(|account| account.clone())
                    .collect::<Vec<AccountInfo>>(),
            )
        };
        // create the memo instruction with all signers if any signers
        let accounts = CpiContext::new(ctx.accounts.memo_program.to_account_info(), BuildMemo {})
            .with_remaining_accounts(signers);

        // invoke memo cpi
        build_memo(accounts, memo.as_bytes())?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InvokeMemoContext<'info> {
    // payer to create memo
    #[account(mut)]
    pub payer: Signer<'info>,

    // memo program that will be called by cpi to place a memo
    pub memo_program: Program<'info, Memo>,
}
