# 🎯 Memo — Template

**Type:** Anchor

---

## 📘 Use Case

This template enables you to attach a memo (text message) to a Solana transaction using the Memo program via a CPI (cross-program invocation).  
It supports passing a list of signers to the memo instruction and is ideal for logging messages on-chain or tagging transactions with metadata.

---

## 🧱 Data Structure

| Account         | Description                                                |
|------------------|------------------------------------------------------------|
| `payer`          | The transaction signer and payer for the memo instruction |
| `memo_program`   | The Memo program invoked via CPI                           |

---

## 🧾 Instructions

| Name        | Description                                                  |
|-------------|--------------------------------------------------------------|
| `send_memo` | Sends a memo string via the Memo program (can include signers) |