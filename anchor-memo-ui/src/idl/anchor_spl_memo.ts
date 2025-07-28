/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_spl_memo.json`.
 */
export type AnchorSplMemo = {
  "address": "38CCrZs232VvV1aJqTKyvYNUwxC8zcmRwzwSFmh54A4y",
  "metadata": {
    "name": "anchorSplMemo",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "sendMemo",
      "discriminator": [
        206,
        178,
        79,
        19,
        63,
        210,
        72,
        239
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "memoProgram",
          "address": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        }
      ],
      "args": [
        {
          "name": "memo",
          "type": "string"
        }
      ]
    }
  ]
};
