import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createAccount,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  getMintLen,
  getTransferFeeAmount,
  harvestWithheldTokensToMint,
  mintTo,
  transferChecked,
  transferCheckedWithFee,
  unpackAccount,
  withdrawWithheldTokensFromAccounts,
  withdrawWithheldTokensFromMint,
} from "@solana/spl-token";

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Playground wallet
const secret = [167,144,42,104,242,52,98,117,34,50,236,152,29,76,54,160,248,198,157,221,24,243,192,152,142,103,122,183,151,85,22,236,64,88,15,129,138,157,169,218,87,134,44,60,88,200,5,154,214,42,227,18,57,24,83,34,150,77,54,170,17,130,216,105]; // 👈 Replace with your secret
const payer = Keypair.fromSecretKey(new Uint8Array(secret));
console.log("Payer Address:", payer.publicKey.toString());


// Transaction signature returned from sent transaction
let transactionSignature: string;

// Client
console.log("My address:", payer.publicKey.toString());
const balance = await connection.getBalance(payer.publicKey);
console.log(`My balance: ${balance / LAMPORTS_PER_SOL} SOL`);

// MINT
const mintPublicKey = new PublicKey(
  "2EyHCMqAR2nZedGDv5PjW2U5i9WRtbi6uEinLUQR1bpZ"
);
console.log(`Sam Token Mint: ${mintPublicKey.toString()}`);

const mintAuthority = payer.publicKey;

// Mint tokens to a target account
const mintAccount = new PublicKey(
  "HuZY9bKgELNSqjB4MecAHrUiN3FhsV8X41N66Lnpb4vT"
);
const decimals = 9

const mintTokenFunction = async (amountToMint: number) => {
  const mintTxSignature = await mintTo(
    connection,
    payer, // Transaction fee payer
    mintPublicKey, // Mint Account address
    mintAccount, // Mint to
    mintAuthority, // Mint Authority address
    amountToMint, // Amount
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID
  );
  console.log(
    "\nMint Tokens:",
    `https://explorer.solana.com/tx/${mintTxSignature}?cluster=devnet-solana`
  );
}
const amountToMint = 1 * Math.pow(10, decimals); // Amount to mint
// mintTokenFunction(amountToMint);

// create destination account
const createDestinationAccount = async (randomKeypair: Keypair) => {
  const destinationTokenAccount = await createAccount(
    connection,
    payer, // Payer to create Token Account
    mintPublicKey, // Mint Account address
    randomKeypair.publicKey, // Token Account owner
    undefined, // Optional keypair, default to Associated Token Account
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );

  console.log(
    "\nDestination Token Account:",
    `https://explorer.solana.com/address/${destinationTokenAccount}?cluster=devnet-solana`
  );
  return destinationTokenAccount;
}

const transferTokens = async (transferAmount: number | bigint, destinationKeypair: Keypair) => {

  const destinationTokenAccount = await createDestinationAccount(destinationKeypair);
  // Transfer tokens with fee
  transactionSignature = await transferChecked(
    connection,
    payer, // Transaction fee payer
    mintAccount, // Source Token Account
    mintPublicKey, // Mint Account address
    destinationTokenAccount, // Destination Token Account
    payer.publicKey, // Owner of Source Account
    transferAmount, // Amount to transfer
    decimals, // Mint Account decimals
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );

  console.log(
    "\nTransfer Tokens:",
    `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet-solana`,
  );
}

////////////////// Testing ///////////////////


// // Transfer amount
// const transferAmount = BigInt(10 * Math.pow(10, decimals));

// for (let i = 0; i < 50; i++) {
//   try {
//     const randomKeypair = new Keypair();
//     transferTokens(transferAmount, randomKeypair);
//   } catch (error: any) {
//     console.log(`\nError Transfering Token: `, error);
//   }
// }

// mintTokenFunction(1 * Math.pow(10, decimals));
