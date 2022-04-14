import { WalletContextState } from "@solana/wallet-adapter-react/lib/useWallet";
import { CandyMachineAccount } from "../candy-machine";

export interface MintProps {
    rpcUrl: string;
    candyMachine?: CandyMachineAccount;
    wallet: WalletContextState;
    isUserMinting: boolean;
    onMint: () => Promise<void>;
  }