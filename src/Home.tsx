import React, { useState } from "react";
import * as anchor from "@project-serum/anchor";
import BN from 'bn.js';
import * as bs58 from 'bs58';
import styled from "styled-components";
import { Box, Container, Link, Snackbar, Tab, CircularProgress } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Alert from "@material-ui/lab/Alert";
import { AccountMeta, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, Connection as RPCConnection, SYSVAR_INSTRUCTIONS_PUBKEY, SYSVAR_RECENT_BLOCKHASHES_PUBKEY, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import {
  CandyMachineAccount,
} from "./candy-machine";
import {
  getCandyMachine,
  getATA,
  getEdition,
  getMetadata,
} from './utils/accounts';
import { AlertState, InfoState } from "./utils";
import Grid from "@material-ui/core/Grid";
import "@fortawesome/fontawesome-free/js/all.js";
import Button from "@material-ui/core/Button";
import apecompress from "./apecompress.webp";
import Typography from "@material-ui/core/Typography";
import "./fonts.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import Patch from "./images/patch.png"
import { CANDY_MACHINE_ID, GUMDROP_DISTRIBUTOR_ID, GUMDROP_TEMPORAL_SIGNER, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID, TOKEN_PROGRAM_ID } from "./utils/ids";
import { notify } from "./utils/notifications";
import { explorerLinkFor, sendSignedTransaction } from './utils/transactions';
// import { useConnection } from "./contexts/ConnectionContext";
import { MerkleTree } from "./utils/merkleTree";
import { MintLayout, Token } from "@solana/spl-token";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
// import { useConnection } from "./contexts/ConnectionContext";
// import { useConnection as useGumdropConnection } from './contexts/ConnectionContext';
// import { ConnectButton } from "./components/ConnectButton";
// import Modal from "antd/lib/modal";
// import closeSvg from './close.svg';
// import { Link as Link2 } from 'react-router-dom';

// eslint-disable-next-line
const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #36454F 0%, #45535B 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;
// eslint-disable-next-line
const MintContainer = styled.div``; // add your owns styles here
// eslint-disable-next-line
export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  candyMachineIdsArray: anchor.web3.PublicKey[];
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  // rpcHost: string;
  showInfo: boolean;
  launchTime: number;
}

type Programs = {
  gumdrop: anchor.Program;
  candyMachine: anchor.Program;
};

type ClaimTransactions = {
  setup: Transaction | null;
  claim: Transaction;
};

export const chunk = (arr: Buffer, len: number): Array<Buffer> => {
  const chunks: Array<Buffer> = [];
  const n = arr.length;
  let i = 0;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
};

const Home = (props: HomeProps) => {
  // GUMDROP

  // eslint-disable-next-line
  // const connection = useGumdropConnection();

  // eslint-disable-next-line
  // const connection = props.connection;
  const [program, setProgram] = React.useState<Programs | null>(null);
  // eslint-disable-next-line
  const [loading, setLoading] = React.useState(false);
  // eslint-disable-next-line
  const loadingProgress = () => (
    <CircularProgress
      size={24}
    // sx={{
    //   position: 'absolute',
    //   top: '50%',
    //   left: '50%',
    //   marginTop: '-12px',
    //   marginLeft: '-12px',
    // }}
    />
  );
  const wallet = useAnchorWallet();
  const { connected } = useWallet();

  // const rpc_connection: RPCConnection = useGumdropConnection()
  const rpc_connection_manual = props.connection
  // const connection = new RPCConnection("https://metaplex.devnet.rpcpool.com/")
  const connection = props.connection

  const urlToParams = (url: string) => {
    const distributor = url.split("distributor=")[1].split("&method=wallets&handle=")[0]
    const handle = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[0]
    const amount = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[1].split("&index=")[0]
    const index = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[1].split("&index=")[1].split("&proof=")[0]
    const proof = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[1].split("&index=")[1].split("&proof=")[1].split("&pin=")[0]
    const pin = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[1].split("&index=")[1].split("&proof=")[1].split("&pin=")[1].split("&candy=")[0]
    const candy = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[1].split("&index=")[1].split("&proof=")[1].split("&pin=")[1].split("&candy=")[1].split("&tokenAcc=")[0]
    const tokenAcc = url.split("distributor=")[1].split("&method=wallets&handle=")[1].split("&amount=")[1].split("&index=")[1].split("&proof=")[1].split("&pin=")[1].split("&candy=")[1].split("&tokenAcc=")[1]
    return {
      distributor,
      handle,
      amount,
      index,
      proof,
      candy,
      tokenAcc,
      pin
    }
  }

  const url = "https://gumdrop.metaplex.com//claim?distributor=6PtjYmSaPABvwJyiPy2WE2z8sUAAuouXviBdk5PFghZu&method=wallets&handle=Wi98X8ujGe9WpNLwBMGPUzeyqEUb4EABLmJpCRrP7XG&amount=1&index=4&proof=9APctAZaTqp86fSxjRkK3gLURWDFnJg9cSuUAnQ8WDZF&pin=NA&candy=7aJCx9baQpvZMq9trGh6gC4YR2bTWVSChiHgQYzj1yD4&tokenAcc=CHNYum3JVna5aKYS6pEfEyFxkgrcKbAfKMzpfmdBpy55"


  const params = urlToParams(url)
  console.log(params)


  // const [claimMethod, setClaimMethod] = React.useState(
  //   params.candy
  //     ? 'candy'
  //     : params.tokenAcc
  //     ? 'transfer'
  //     : params.master
  //     ? 'edition'
  //     : '',
  // );
  const claimMethod = "candy";
  // eslint-disable-next-line
  const [tokenAcc, setTokenAcc] = React.useState(
    (params.tokenAcc as string) || '',
  );
  // eslint-disable-next-line
  const [candyMachine, setCandyMachine] = React.useState(
    (params.candy as string) || '',
  );
  // // eslint-disable-next-line
  // const [masterMint, setMasterMint] = React.useState(
  //   (params.master as string) || '',
  // );
  // // eslint-disable-next-line
  // const [editionStr, setEditionStr] = React.useState(
  //   (params.edition as string) || '',
  // );
  // eslint-disable-next-line
  const [handle, setHandle] = React.useState((params.handle as string) || '');
  // const [amountStr, setAmount] = React.useState(
  //   (params.amount as string) || '',
  // );
  // eslint-disable-next-line
  const [amountStr, setAmount] = React.useState(
    (params.amount as string) || '',
  );
  // eslint-disable-next-line
  const [indexStr, setIndex] = React.useState((params.index as string) || '');
  // eslint-disable-next-line
  const [pinStr, setPin] = React.useState((params.pin as string) || '');
  // eslint-disable-next-line
  const [proofStr, setProof] = React.useState((params.proof as string) || '');
  // eslint-disable-next-line
  const [commMethod, setCommMethod] = React.useState(
    'aws-email',
  );

  // temporal verification
  // eslint-disable-next-line
  const [transaction, setTransaction] =
    React.useState<ClaimTransactions | null>(null);
  // eslint-disable-next-line
  const [OTPStr, setOTPStr] = React.useState('');

  // async computed
  // eslint-disable-next-line
  const [asyncNeedsTemporalSigner, setNeedsTemporalSigner] =
    React.useState<boolean>(true);

  // eslint-disable-next-line
  const [distributor, setDistributor] = React.useState(
    (params.distributor as string) || '',
  );

  // eslint-disable-next-line
  const [isUserMinting, setIsUserMinting] = useState(false);
  // const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  // eslint-disable-next-line
  const [candyMachineArray, setCandyMachineArray] = useState<CandyMachineAccount[]>([]);
  // eslint-disable-next-line
  const [isLive, setIsLive] = useState(props.launchTime < new Date().getTime());
  // setIsLive(props.launchTime < new Date().getTime());
  // const [launchTime, setLaunchTime] = useState(new Date().getTime() + 10000);
  // const launchTime = new Date().getTime() + 86400000 / 2


  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined
  });
  const [infoState, setInfoState] = useState<InfoState>({
    showInfo: false
  });

  const skipAWSWorkflow = false;
  const lambdaAPIEndpoint = `https://${process.env.LAMBDA_GATEWAY_API_ID}.execute-api.us-east-2.amazonaws.com/send-OTP`;

  // eslint-disable-next-line
  //   const rpcUrl = props.rpcHost;
  // console.log(rpcUrl);

  // const wallet = useWallet();

  // const anchorWallet = useMemo(() => {
  //   if (
  //     !wallet ||
  //     !wallet.publicKey ||
  //     !wallet.signAllTransactions ||
  //     !wallet.signTransaction
  //   ) {
  //     return;
  //   }

  //   return {
  //     publicKey: wallet.publicKey,
  //     signAllTransactions: wallet.signAllTransactions,
  //     signTransaction: wallet.signTransaction
  //   } as anchor.Wallet;
  // }, [wallet]);

  // const refreshCandyMachineState = useCallback(async () => {
  //   if (!anchorWallet) {
  //     return;
  //   }

  //   if (props.candyMachineId) {
  //     try {
  //       const cndy = await getCandyMachineState(
  //         anchorWallet,
  //         props.candyMachineId,
  //         props.connection
  //       );
  //       setCandyMachine(cndy);
  //       console.log("candy machine state: ", cndy);
  //     } catch (e) {
  //       console.log("There was a problem fetching Candy Machine state");
  //       console.log(e);
  //     }
  //   }
  // }, [anchorWallet, props.candyMachineId, props.connection]);

  // const refreshCandyMachineArrayState = useCallback(async () => {
  //   if (!anchorWallet) {
  //     return;
  //   }

  //   if (props.candyMachineIdsArray && props.candyMachineIdsArray.length > 0) {
  //     try {
  //       const candyMachineArrayCopy = [];
  //       for (const candyMachineId of props.candyMachineIdsArray) {
  //         const index = props.candyMachineIdsArray.indexOf(candyMachineId);
  //         const cndy = await getCandyMachineState(
  //           anchorWallet,
  //           props.candyMachineIdsArray[index],
  //           props.connection
  //         );
  //         candyMachineArrayCopy[index] = cndy;
  //       }
  //       console.log("candy machine array state: ", candyMachineArrayCopy);
  //       setCandyMachineArray(candyMachineArrayCopy);
  //     } catch (e) {
  //       console.log("There was a problem fetching Candy Machine state");
  //       console.log(e);
  //     }
  //   }
  // }, [anchorWallet, props.candyMachineIdsArray, props.connection]);

  // const onMint = async () => {
  //   try {
  //     setIsUserMinting(true);
  //     document.getElementById("#identity")?.click();
  //     if (wallet.connected && candyMachine?.program && wallet.publicKey) {
  //       const mintTxId = (
  //         await mintOneToken(candyMachine, wallet.publicKey)
  //       )[0];

  //       let status: any = { err: true };
  //       if (mintTxId) {
  //         status = await awaitTransactionSignatureConfirmation(
  //           mintTxId,
  //           props.txTimeout,
  //           props.connection,
  //           true
  //         );
  //       }

  //       if (status && !status.err) {
  //         setAlertState({
  //           open: true,
  //           message: "Congratulations! Mint succeeded!",
  //           severity: "success"
  //         });
  //       } else {
  //         setAlertState({
  //           open: true,
  //           message: "Mint failed! Please try again!",
  //           severity: "error"
  //         });
  //       }
  //     }
  //   } catch (error: any) {
  //     let message = error.msg || "Minting failed! Please try again!";
  //     if (!error.msg) {
  //       if (!error.message) {
  //         message = "Transaction Timeout! Please try again.";
  //       } else if (error.message.indexOf("0x137")) {
  //         message = `SOLD OUT!`;
  //       } else if (error.message.indexOf("0x135")) {
  //         message = `Insufficient funds to mint. Please fund your wallet.`;
  //       }
  //     } else {
  //       if (error.code === 311) {
  //         message = `SOLD OUT!`;
  //         window.location.reload();
  //       } else if (error.code === 312) {
  //         message = `Minting period hasn't started yet.`;
  //       }
  //     }

  //     setAlertState({
  //       open: true,
  //       message,
  //       severity: "error"
  //     });
  //   } finally {
  //     setIsUserMinting(false);
  //   }
  // };

  // const onMintNeutral = async () => {
  //   try {
  //     setIsUserMinting(true);
  //     document.getElementById("#identity")?.click();
  //     if (wallet.connected && candyMachineArray[CandyMachineEnums.NEUTRAL_APES]?.program && wallet.publicKey) {
  //       const mintTxId = (
  //         await mintOneToken(candyMachineArray[CandyMachineEnums.NEUTRAL_APES], wallet.publicKey)
  //       )[0];

  //       let status: any = { err: true };
  //       if (mintTxId) {
  //         status = await awaitTransactionSignatureConfirmation(
  //           mintTxId,
  //           props.txTimeout,
  //           props.connection,
  //           true
  //         );
  //       }

  //       if (status && !status.err) {
  //         setAlertState({
  //           open: true,
  //           message: "Congratulations! Mint succeeded!",
  //           severity: "success"
  //         });
  //       } else {
  //         setAlertState({
  //           open: true,
  //           message: "Mint failed! Please try again!",
  //           severity: "error"
  //         });
  //       }
  //     }
  //   } catch (error: any) {
  //     let message = error.msg || "Minting failed! Please try again!";
  //     if (!error.msg) {
  //       if (!error.message) {
  //         message = "Transaction Timeout! Please try again.";
  //       } else if (error.message.indexOf("0x137")) {
  //         message = `SOLD OUT!`;
  //       } else if (error.message.indexOf("0x135")) {
  //         message = `Insufficient funds to mint. Please fund your wallet.`;
  //       }
  //     } else {
  //       if (error.code === 311) {
  //         message = `SOLD OUT!`;
  //         window.location.reload();
  //       } else if (error.code === 312) {
  //         message = `Minting period hasn't started yet.`;
  //       }
  //     }

  //     setAlertState({
  //       open: true,
  //       message,
  //       severity: "error"
  //     });
  //   } finally {
  //     setIsUserMinting(false);
  //   }
  // };



  const walletKeyOrPda = async (
    walletKey: PublicKey,
    handle: string,
    pin: BN | null,
    seed: PublicKey,
  ): Promise<[PublicKey, Array<Buffer>]> => {
    if (pin === null) {
      try {
        const key = new PublicKey(handle);
        if (!key.equals(walletKey)) {
          throw new Error(
            'Claimant wallet handle does not match connected wallet',
          );
        }
        return [key, []];
      } catch (err) {
        throw new Error(`Invalid claimant wallet handle ${err}`);
      }
    } else {
      const seeds = [
        seed.toBuffer(),
        Buffer.from(handle),
        Buffer.from(pin.toArray('le', 4)),
      ];

      const [claimantPda] = await PublicKey.findProgramAddress(
        [seeds[0], ...chunk(seeds[1], 32), seeds[2]],
        GUMDROP_DISTRIBUTOR_ID,
      );
      return [claimantPda, seeds];
    }
  };

  const createMintAndAccount = async (
    connection: RPCConnection,
    walletKey: PublicKey,
    mint: PublicKey,
    setup: Array<TransactionInstruction>,
  ) => {
    const walletTokenKey = await getATA(walletKey, mint);

    setup.push(
      SystemProgram.createAccount({
        fromPubkey: walletKey,
        newAccountPubkey: mint,
        space: MintLayout.span,
        lamports: await connection.getMinimumBalanceForRentExemption(
          MintLayout.span,
        ),
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    setup.push(
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint,
        0,
        walletKey,
        walletKey,
      ),
    );

    setup.push(
      Token.createAssociatedTokenAccountInstruction(
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        walletTokenKey,
        walletKey,
        walletKey,
      ),
    );

    setup.push(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint,
        walletTokenKey,
        walletKey,
        [],
        1,
      ),
    );
  };

  type ClaimInstructions = {
    setup: Array<TransactionInstruction> | null;
    claim: Array<TransactionInstruction>;
  };

  const buildCandyClaim = async (
    program: anchor.Program,
    candyProgram: anchor.Program,
    walletKey: PublicKey,
    distributorKey: PublicKey,
    distributorInfo: any,
    tokenAcc: string,
    candyMachineStr: string,
    proof: Array<Buffer>,
    handle: string,
    amount: number,
    index: number,
    pin: BN | null,
  ): Promise<[ClaimInstructions, Array<Buffer>, Array<Keypair>]> => {
    let tokenAccKey: PublicKey;
    try {
      tokenAccKey = new PublicKey(tokenAcc);
    } catch (err) {
      throw new Error(`Invalid tokenAcc key ${err}`);
    }

    let candyMachineKey: PublicKey;
    try {
      candyMachineKey = new PublicKey(candyMachineStr);
    } catch (err) {
      throw new Error(`Invalid candy machine key ${err}`);
    }

    const connection = program.provider.connection;
    const candyMachine = await getCandyMachine(connection, candyMachineKey);
    console.log('Candy Machine', candyMachine);

    if (!candyMachine.data.whitelistMintSettings) {
      // soft error?
      throw new Error(
        `Candy machine doesn't seem to have a whitelist mint. You can mint normally!`,
      );
    }
    const whitelistMint = candyMachine.data.whitelistMintSettings.mint;

    const [secret, pdaSeeds] = await walletKeyOrPda(
      walletKey,
      handle,
      pin,
      whitelistMint,
    );

    // TODO: since it's in the PDA do we need it to be in the leaf?
    const leaf = Buffer.from([
      ...new BN(index).toArray('le', 8),
      ...secret.toBuffer(),
      ...whitelistMint.toBuffer(),
      ...new BN(amount).toArray('le', 8),
    ]);

    const matches = MerkleTree.verifyClaim(
      leaf,
      proof,
      Buffer.from(distributorInfo.root),
    );

    if (!matches) {
      throw new Error('Gumdrop merkle proof does not match');
    }

    const [claimStatus, cbump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('ClaimStatus'),
        Buffer.from(new BN(index).toArray('le', 8)),
        distributorKey.toBuffer(),
      ],
      GUMDROP_DISTRIBUTOR_ID,
    );

    // candy machine mints fit in a single transaction
    const merkleClaim: Array<TransactionInstruction> = [];

    if ((await connection.getAccountInfo(claimStatus)) === null) {
      // atm the contract has a special case for when the temporal key is defaulted
      // (aka always passes temporal check)
      // TODO: more flexible
      const temporalSigner =
        distributorInfo.temporal.equals(PublicKey.default) ||
          secret.equals(walletKey)
          ? walletKey
          : distributorInfo.temporal;

      const walletTokenKey = await getATA(walletKey, whitelistMint);
      if ((await connection.getAccountInfo(walletTokenKey)) === null) {
        merkleClaim.push(
          Token.createAssociatedTokenAccountInstruction(
            SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            candyMachine.data.whitelistMintSettings.mint,
            walletTokenKey,
            walletKey,
            walletKey,
          ),
        );
      }

      merkleClaim.push(
        await program.instruction.claim(
          cbump,
          new BN(index),
          new BN(amount),
          secret,
          proof,
          {
            accounts: {
              distributor: distributorKey,
              claimStatus,
              from: tokenAccKey,
              to: walletTokenKey,
              temporal: temporalSigner,
              payer: walletKey,
              systemProgram: SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
            },
          },
        ),
      );
    }

    const candyMachineMint = Keypair.generate();
    const candyMachineMetadata = await getMetadata(candyMachineMint.publicKey);
    const candyMachineMaster = await getEdition(candyMachineMint.publicKey);

    const [candyMachineCreatorKey, candyMachineCreatorBump] =
      await PublicKey.findProgramAddress(
        [Buffer.from('candy_machine'), candyMachineKey.toBuffer()],
        CANDY_MACHINE_ID,
      );

    const remainingAccounts: Array<AccountMeta> = [];

    if (candyMachine.data.whitelistMintSettings) {
      const whitelistATA = await getATA(walletKey, whitelistMint);
      remainingAccounts.push({
        pubkey: whitelistATA,
        isWritable: true,
        isSigner: false,
      });

      if (candyMachine.data.whitelistMintSettings.mode.burnEveryTime) {
        remainingAccounts.push({
          pubkey: whitelistMint,
          isWritable: true,
          isSigner: false,
        });
        remainingAccounts.push({
          pubkey: walletKey,
          isWritable: false,
          isSigner: true,
        });
      }
    }

    if (candyMachine.tokenMint) {
      const tokenMintATA = await getATA(walletKey, candyMachine.tokenMint);

      remainingAccounts.push({
        pubkey: tokenMintATA,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: walletKey,
        isWritable: false,
        isSigner: true,
      });
    }

    const candyMachineClaim: Array<TransactionInstruction> = [];
    await createMintAndAccount(
      connection,
      walletKey,
      candyMachineMint.publicKey,
      candyMachineClaim,
    );
    candyMachineClaim.push(
      await candyProgram.instruction.mintNft(candyMachineCreatorBump, {
        accounts: {
          candyMachine: candyMachineKey,
          candyMachineCreator: candyMachineCreatorKey,
          payer: walletKey,
          wallet: candyMachine.wallet,
          metadata: candyMachineMetadata,
          mint: candyMachineMint.publicKey,
          mintAuthority: walletKey,
          updateAuthority: walletKey,
          masterEdition: candyMachineMaster,

          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          clock: SYSVAR_CLOCK_PUBKEY,
          recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts,
      }),
    );

    return [
      { setup: merkleClaim, claim: candyMachineClaim },
      pdaSeeds,
      [candyMachineMint],
    ];
  };

  const sendOTP = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!wallet || !program) {
      throw new Error(`Wallet not connected`);
    }

    const index = Number(indexStr);
    const amount = Number(amountStr);
    let pin: BN | null = null;

    if (isNaN(amount)) {
      throw new Error(`Could not parse amount ${amountStr}`);
    }
    if (isNaN(index)) {
      throw new Error(`Could not parse index ${indexStr}`);
    }
    if (params.pin !== 'NA') {
      try {
        pin = new BN(pinStr);
      } catch (err) {
        throw new Error(`Could not parse pin ${pinStr}: ${err}`);
      }
    }

    // TODO: use cached?
    const [distributorKey, distributorInfo] = await fetchDistributor(
      program.gumdrop,
      distributor,
    );

    console.log('Distributor', distributorInfo);

    const proof =
      proofStr === ''
        ? []
        : proofStr.split(',').map(b => {
          const ret = Buffer.from(bs58.decode(b));
          if (ret.length !== 32) throw new Error(`Invalid proof hash length`);
          return ret;
        });

    let instructions, pdaSeeds, extraSigners;
    if (claimMethod === 'candy') {
      console.log('Building candy claim');
      [instructions, pdaSeeds, extraSigners] = await buildCandyClaim(
        program.gumdrop,
        program.candyMachine,
        wallet.publicKey,
        distributorKey,
        distributorInfo,
        tokenAcc,
        candyMachine,
        proof,
        handle,
        amount,
        index,
        pin,
      );
    } else {
      throw new Error(`Unknown claim method ${claimMethod}`);
    }

    // NB: if we're claiming through wallets then pdaSeeds should be empty
    // since the secret is the wallet key (which is also a signer)
    if (pin === null && pdaSeeds.length > 0) {
      throw new Error(
        `Internal error: PDA generated when distributing to wallet directly`,
      );
    }

    const signersOf = (instrs: Array<TransactionInstruction>) => {
      const signers = new Set<PublicKey>();
      for (const instr of instrs) {
        for (const key of instr.keys) if (key.isSigner) signers.add(key.pubkey);
      }
      return [...signers];
    };

    const partialSignExtra = (tx: Transaction, expected: Array<PublicKey>) => {
      const matching = extraSigners.filter(kp =>
        expected.find(p => p.equals(kp.publicKey)),
      );
      if (matching.length > 0) {
        tx.partialSign(...matching);
      }
    };

    const recentBlockhash = (
      await connection.getLatestBlockhash('singleGossip')
    ).blockhash;

    let setupTx: Transaction | null = null;
    if (instructions.setup !== null && instructions.setup.length !== 0) {
      setupTx = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash,
      });

      const setupInstrs = instructions.setup;
      const setupSigners = signersOf(setupInstrs);
      console.log(
        `Expecting the following setup signers: ${setupSigners.map(s =>
          s.toBase58(),
        )}`,
      );
      setupTx.add(...setupInstrs);
      setupTx.setSigners(...setupSigners);
      partialSignExtra(setupTx, setupSigners);
    }

    const claimTx = new Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash,
    });

    const claimInstrs = instructions.claim;
    const claimSigners = signersOf(claimInstrs);
    console.log(
      `Expecting the following claim signers: ${claimSigners.map(s =>
        s.toBase58(),
      )}`,
    );
    claimTx.add(...claimInstrs);
    claimTx.setSigners(...claimSigners);
    partialSignExtra(claimTx, claimSigners);

    const txnNeedsTemporalSigner = claimTx.signatures.some(s =>
      s.publicKey.equals(GUMDROP_TEMPORAL_SIGNER),
    )
      ? claimTx
      : setupTx &&
        setupTx.signatures.some(s =>
          s.publicKey.equals(GUMDROP_TEMPORAL_SIGNER),
        )
        ? setupTx
        : /*otherwise*/ null;
    if (txnNeedsTemporalSigner !== null && !skipAWSWorkflow) {
      const otpQuery: { [key: string]: any } = {
        method: 'send',
        transaction: bs58.encode(txnNeedsTemporalSigner.serializeMessage()),
        seeds: pdaSeeds,
        comm: commMethod,
      };
      const params = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otpQuery),
      };

      const response = await fetch(lambdaAPIEndpoint, params);
      console.log(response);

      if (response.status !== 200) {
        throw new Error(`Failed to send AWS OTP`);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Could not parse AWS OTP response`);
      }

      console.log('AWS OTP response data:', data);

      let succeeded, toCheck;
      switch (commMethod) {
        case 'discord': {
          succeeded = !!data.id;
          toCheck = 'discord';
          break;
        }
        case 'aws-email': {
          succeeded = !!data.MessageId;
          toCheck = 'email';
          break;
        }
        case 'aws-sms': {
          succeeded = !!data.MessageId;
          toCheck = 'SMS';
          break;
        }
      }

      if (!succeeded) {
        throw new Error(`Failed to send AWS OTP`);
      }

      notify({
        message: 'OTP sent',
        description: `Please check your ${toCheck} (${handle}) for an OTP`,
      });
    }

    return {
      setup: setupTx,
      claim: claimTx,
    };
  };

  const fetchNeedsTemporalSigner = async (
    program: anchor.Program,
    distributorStr: string,
    indexStr: string,
    claimMethod: string,
  ) => {
    const [key, info] = await fetchDistributor(program, distributorStr);
    if (!info.temporal.equals(GUMDROP_TEMPORAL_SIGNER)) {
      // default pubkey or program itself (distribution through wallets)
      return false;
    } else if (claimMethod === 'candy') {
      const [claimCount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('ClaimCount'),
          Buffer.from(new BN(Number(indexStr)).toArray('le', 8)),
          key.toBuffer(),
        ],
        GUMDROP_DISTRIBUTOR_ID,
      );
      // if someone (maybe us) has already claimed this, the contract will
      // not check the existing temporal signer anymore since presumably
      // they have already verified the OTP. So we need to fetch the temporal
      // signer if it is null
      const claimCountAccount = await program.provider.connection.getAccountInfo(
        claimCount,
      );
      return claimCountAccount === null;
    } else {
      // default to need one
      return true;
    }
  };

  const fetchDistributor = async (
    program: anchor.Program,
    distributorStr: string,
  ) => {
    let key;
    try {
      key = new PublicKey(distributorStr);
    } catch (err) {
      throw new Error(`Invalid distributor key ${err}`);
    }
    const info = await program.account.merkleDistributor.fetch(key);
    return [key, info];
  };

  React.useEffect(() => {
    console.log('useEffect');
    if (!wallet) {
      return;
    }

    const wrap = async () => {
      try {
        const provider = new anchor.Provider(connection, wallet, {
          preflightCommitment: 'recent',
        });
        const [gumdropIdl, candyIdl] = await Promise.all([
          anchor.Program.fetchIdl(GUMDROP_DISTRIBUTOR_ID, provider),
          anchor.Program.fetchIdl(CANDY_MACHINE_ID, provider),
        ]);

        if (!gumdropIdl) throw new Error('Failed to fetch gumdrop IDL');
        if (!candyIdl) throw new Error('Failed to fetch candy machine IDL');

        setProgram({
          gumdrop: new anchor.Program(
            gumdropIdl,
            GUMDROP_DISTRIBUTOR_ID,
            provider,
          ),
          candyMachine: new anchor.Program(
            candyIdl,
            CANDY_MACHINE_ID,
            provider,
          ),
        });
      } catch (err) {
        console.error('Failed to fetch IDL', err);
      }
    };
    wrap();
  }, [wallet]);

  React.useEffect(() => {
    const wrap = async () => {
      try {
        if (!program) return;
        setNeedsTemporalSigner(
          await fetchNeedsTemporalSigner(
            program.gumdrop,
            distributor,
            indexStr,
            claimMethod,
          ),
        );
      } catch {
        // TODO: log?
      }
    };
    wrap();
  }, [program, distributor, indexStr, claimMethod]);

  const verifyOTP = async (
    e: React.SyntheticEvent,
    transaction: ClaimTransactions | null,
  ) => {
    e.preventDefault();


    if (!transaction) {
      throw new Error(`Transaction not available for OTP verification`);
    }

    if (!wallet || !program) {
      throw new Error(`Wallet not connected`);
    }

    const claimTx = transaction.claim;
    const setupTx = transaction.setup;
    const txnNeedsTemporalSigner = claimTx.signatures.some(s =>
      s.publicKey.equals(GUMDROP_TEMPORAL_SIGNER),
    )
      ? claimTx
      : setupTx &&
        setupTx.signatures.some(s =>
          s.publicKey.equals(GUMDROP_TEMPORAL_SIGNER),
        )
        ? setupTx
        : /*otherwise*/ null;
    if (txnNeedsTemporalSigner && !skipAWSWorkflow) {
      // TODO: distinguish between OTP failure and transaction-error. We can try
      // again on the former but not the latter
      const OTP = Number(OTPStr);
      if (isNaN(OTP) || OTPStr.length === 0) {
        throw new Error(`Could not parse OTP ${OTPStr}`);
      }

      const params = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        FunctionName: 'send-OTP',
        body: JSON.stringify({
          method: 'verify',
          otp: OTP,
          handle: handle, // TODO?
        }),
      };

      const response = await fetch(lambdaAPIEndpoint, params);
      console.log(response);

      if (response.status !== 200) {
        const blob = JSON.stringify(response);
        throw new Error(`Failed to verify AWS OTP. ${blob}`);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Could not parse AWS OTP verification response`);
      }

      console.log('AWS verify response data:', data);

      let sig;
      try {
        sig = bs58.decode(data);
      } catch {
        throw new Error(`Could not decode transaction signature ${data.body}`);
      }

      txnNeedsTemporalSigner.addSignature(GUMDROP_TEMPORAL_SIGNER, sig);
    }

    let fullySigned;
    try {
      fullySigned = await wallet.signAllTransactions(
        transaction.setup === null
          ? [transaction.claim]
          : [transaction.setup, transaction.claim],
      );
    } catch {
      throw new Error('Failed to sign transaction');
    }

    for (let idx = 0; idx < fullySigned.length; ++idx) {
      const tx = fullySigned[idx];
      const result = await sendSignedTransaction({
        connection: rpc_connection_manual,
        signedTransaction: tx,
      });
      console.log(result);
      setAlertState({
                  open: true,
                  message: "Congratulations! Mint succeeded!",
                  severity: "success"
                });
      notify({
        message: `Claim succeeded: ${idx + 1} of ${fullySigned.length}`,
        description: (
          <Link href={explorerLinkFor(result.txid, rpc_connection_manual)}>
            View transaction on explorer
          </Link>
        ),
      });
    }

    setTransaction(null);
    try {
      setNeedsTemporalSigner(
        await fetchNeedsTemporalSigner(
          program.gumdrop,
          distributor,
          indexStr,
          claimMethod,
        ),
      );
    } catch {
      // TODO: log?
    }
  };

  // useEffect(() => {
  //   // refreshCandyMachineState();
  //   refreshCandyMachineArrayState();

  //   const interval = setInterval(() => setIsLive(props.launchTime < new Date().getTime()), 1000);
  //   return () => {
  //     clearInterval(interval);
  //   };

  // }, [
  //   anchorWallet,
  //   props.candyMachineIdsArray,
  //   props.connection,
  //   refreshCandyMachineArrayState,
  //   // refreshCandyMachineState,
  //   props.launchTime
  // ]);

  const toggleInfo = () => {
    console.log(infoState.showInfo);
    if (infoState.showInfo) {
      setInfoState({ showInfo: false });
    } else {
      setInfoState({ showInfo: true });
    }
  };

  const theme = useTheme();

  theme.breakpoints.values = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1367,
    xl: 1536
  };

  const matchesMobile = useMediaQuery(theme.breakpoints.up("md"));

  const [value, setValue] = React.useState('2');

  const handleChange = (event: any, newValue: string) => {
    setValue(newValue);
  };

  // const [isModalVisible, setIsModalVisible] = React.useState<boolean>(true);

  // const LogoLink = () => {
  //   return (
  //     <Link2 to={`/`}>
  //       <p className={'app-logo'}>GUMDROP</p>
  //     </Link2>
  //   );
  // };

  return (
    // <ThemeProvider theme={theme}>
    <Container className={(matchesMobile) ? "vignette" : ""} style={{ overflowY: "scroll", maxHeight: "100vh" }}>
      <Container style={{ marginTop: 30, marginBottom: 20 }}>
        <Container>
          <Grid container direction="column" justifyContent="center" style={{ color: "white" }}>
            <Typography
              align="center"
              variant="h2"
              style={{ fontWeight: 1000, marginBottom: 5, fontFamily: "robo" }}
            >
              Frakt Apes
            </Typography>

            <Typography
              align="center"
              variant="h6"
              style={{ fontWeight: 400, marginBottom: 5, fontFamily: "robo" }}
            >
              Your gateway to NFTs built by AI
            </Typography>
          </Grid>
        </Container>

        <Container maxWidth="sm" style={{ marginTop: 5 }}>
          <Grid container direction="row" justifyContent="center">
            <Button
              href={"https://discord.gg/rMAUCujG7e"}
              target="_blank"
              rel="noreferrer"
              style={{ marginRight: 10 }}
            >
              <i
                className="fab fa-discord fa-3x"
                style={{
                  color: "#fff",
                  opacity: 0.9
                }}
              ></i>
            </Button>
            <Button onClick={toggleInfo} style={{ marginRight: 8 }}>
              <i
                className="fa fa-home fa-4x"
                style={{ color: "#fff", opacity: 0.9, animation: "pulse 1s infinite" }}
              ></i>
            </Button>
            <Button
              href={"https://twitter.com/FraktApes"}
              target="_blank"
              rel="noreferrer"
              style={{}}
            >
              <i
                className="fab fa-twitter fa-3x"
                style={{ color: "#fff", opacity: 0.9 }}
              ></i>
            </Button>
          </Grid>
        </Container>

        {infoState.showInfo ? (
          <Container maxWidth="sm" style={{ marginTop: 15 }}>
            <Paper
              style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 6, paddingTop: 0 }}
            >

              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} variant="fullWidth">
                    <Tab style={{ fontFamily: "robo" }} label="AI Launchpad" value="1" />
                    <Tab label="Genesis Apes" value="2" />
                    <Tab label="Info" value="3" />
                  </TabList>
                </Box>

                <TabPanel value="1">
                  <Grid container spacing={2} direction="column">
                    <Grid item>
                      {/* <MintPaper mintProps={
                        {
                          rpcUrl,
                          candyMachine: candyMachineArray[CandyMachineEnums.NEUTRAL_APES],
                          wallet,
                          isUserMinting,
                          onMint: onMintNeutral
                        }
                      } tooltip="Requires: Degen Ape or FRAKT or WL" connected={wallet.connected} name={"Neutral Apes"} countdownTime={props.launchTime} backgroundImage={WhiteApeBanner}>
                      </MintPaper> */}
                    </Grid>
                    <Grid item>
                      {/* <MintPaper tooltip="Requires: Genesis Ape or 1 SOL" connected={wallet.connected} countdownTime={new Date().getTime() + 86400000 / 2}>
                      </MintPaper> */}
                    </Grid>
                    <Grid item>
                      {/* <MintPaper tooltip="Requires: Genesis Ape or 1 SOL" connected={wallet.connected} countdownTime={new Date().getTime() + 86400000}>
                      </MintPaper> */}
                    </Grid>
                  </Grid>


                </TabPanel>

                <TabPanel value="2">

                  <Grid container direction="column" justifyContent="center">

                    <img src={apecompress} alt="loading..." style={{
                      width: "80%",
                      marginLeft: "auto",
                      marginRight: "auto",
                      // marginTop: 10
                    }} />

                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                    >
                      Artificial Neural Networks have been used to combine
                      <Link variant="body1" underline="always" align="center" style={{ color: "white", fontFamily: "robo", margin: "auto", paddingLeft: 5, paddingRight: 5 }} href="https://www.degenape.academy/">The Degen Ape Academy</Link>
                      and
                      <Link variant="body1" underline="always" style={{ color: "white", fontFamily: "robo", margin: "auto", paddingLeft: 5 }} href="http://www.frakt.art/">FRAKT</Link>, two OG Solana NFT projects.

                    </Typography>

                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 10, marginBottom: 10 }}
                    >

                      Owning a Genesis ape will give access to all the free AI NFT Launchpad mints.
                    </Typography>


                    {!connected ?
                      // <Modal
                      //   title={<LogoLink />}
                      //   visible={isModalVisible}
                      //   footer={null}
                      //   className={'modal-box'}
                      //   closeIcon={
                      //     <img onClick={() => setIsModalVisible(false)} src={closeSvg} />
                      //   }
                      // >
                      <ConnectButton>
                        Connect Wallet Test
                      </ConnectButton>
                      // </Modal>
                      :
                      < React.Fragment >
                        <Box sx={{ position: 'relative' }}>
                          <Button
                            disabled={!wallet || !program || loading}
                            variant="contained"
                            style={{ width: '100%' }}
                            color={asyncNeedsTemporalSigner ? 'primary' : 'secondary'}
                            onClick={e => {
                              setLoading(true);
                              const wrap = async () => {
                                try {
                                  if (!program) {
                                    throw new Error(
                                      `Internal error: no program loaded for claim`,
                                    );
                                  }
                                  const needsTemporalSigner = await fetchNeedsTemporalSigner(
                                    program.gumdrop,
                                    distributor,
                                    indexStr,
                                    claimMethod,
                                  );
                                  const transaction = await sendOTP(e);
                                  if (!needsTemporalSigner) {
                                    await verifyOTP(e, transaction);
                                  } else {
                                    setTransaction(transaction);
                                  }
                                  setLoading(false);
                                  // onClick();
                                } catch (err) {
                                  console.error(err);
                                  notify({
                                    message: 'Claim failed',
                                    description: `${err}`,
                                  });
                                  setAlertState({
                                    open: true,
                                    message: `Claim failed: ${err}`,
                                    severity: "error"
                                  });
                                  // })
                                  setLoading(false);
                                }
                              };
                              wrap();
                            }}
                          >
                            {asyncNeedsTemporalSigner ? 'Next' : 'Claim NFT'}
                          </Button>
                          {loading && loadingProgress()}
                        </Box>
                      </React.Fragment>}

                  </Grid>
                </TabPanel>
                <TabPanel value="3">

                  <Grid container direction="column" justifyContent="center">

                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 0 }}
                    >
                      Frakt Apes are an NFT collection giving access to an AI NFT launchpad.
                    </Typography>


                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 20, marginBottom: 20 }}
                    >
                      Royalties from the collection will be used to fund community artists to feature in the launchpad, giving Genesis Ape holders ongoing utility.
                    </Typography>

                    <img src={Patch} alt="loading..." style={{
                      width: "35%",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }} />

                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                    >
                      A Project by
                      <Link variant="body1" underline="always" align="center" style={{ color: "white", fontFamily: "robo", margin: "auto", paddingLeft: 8 }} href="https://twitter.com/PatchNFT">Patch</Link>
                    </Typography>

                  </Grid>

                </TabPanel>
              </TabContext>

            </Paper>
          </Container>
        ) : (
          // <Container maxWidth="sm" style={{ marginTop: 25 }}>
          //   <Paper
          //     style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 6 }}
          //     hidden
          //   >
          //     {!wallet.connected ? (
          //       <Grid container direction="column" justifyContent="center">
          //         <Grid container direction="row" justifyContent="center" style={{ marginBottom: 2 }}>
          //           <Typography
          //             align="center"
          //             variant="body1"
          //             style={{ color: "grey" }}
          //           >
          //             Mint Countdown
          //           </Typography>

          //           <Tooltip
          //             title="Best Practice: Use a new/burner wallet when minting, nefarious projects will try and steal your funds with malicious smart contracts"
          //             style={{ marginLeft: 4, color: "grey", fontSize: "1.05em" }}>
          //             <HelpIcon fontSize="small" />

          //           </Tooltip>
          //         </Grid>

          //         <MintCountdown
          //           date={new Date(1646899200000)}
          //           style={{ justifyContent: "center" }}
          //         />

          //         <ConnectButton>Connect Wallet</ConnectButton>
          //       </Grid>
          //     ) : (
          //       <>
          //         <Header candyMachine={candyMachineArray[CandyMachineEnums.NEUTRAL_APES]} />
          //         <MintContainer>
          //           {candyMachineArray[CandyMachineEnums.NEUTRAL_APES]?.state.isActive &&
          //             candyMachineArray[CandyMachineEnums.NEUTRAL_APES]?.state.gatekeeper &&
          //             wallet.publicKey &&
          //             wallet.signTransaction ? (
          //             <GatewayProvider
          //               wallet={{
          //                 publicKey:
          //                   wallet.publicKey ||
          //                   new PublicKey(CANDY_MACHINE_PROGRAM),
          //                 //@ts-ignore
          //                 signTransaction: wallet.signTransaction
          //               }}
          //               gatekeeperNetwork={
          //                 candyMachineArray[CandyMachineEnums.NEUTRAL_APES]?.state?.gatekeeper?.gatekeeperNetwork
          //               }
          //               clusterUrl={rpcUrl}
          //               options={{ autoShowModal: false }}
          //             >
          //               <MintButton
          //                 candyMachine={candyMachineArray[CandyMachineEnums.NEUTRAL_APES]}
          //                 isMinting={isUserMinting}
          //                 onMint={onMintNeutral}
          //               />
          //             </GatewayProvider>
          //           ) : (
          //             <MintButton
          //               candyMachine={candyMachineArray[CandyMachineEnums.NEUTRAL_APES]}
          //               isMinting={isUserMinting}
          //               onMint={onMintNeutral}
          //             />
          //           )}
          //         </MintContainer>
          //       </>
          //     )}
          //   </Paper>
          // </Container>
          <></>
        )}

        <Snackbar
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          <Alert
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
          >
            {alertState.message}
          </Alert>
        </Snackbar>
      </Container>
    </Container >
    // </ThemeProvider>
  );
};

export default Home;
