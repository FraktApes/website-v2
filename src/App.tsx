import "./App.css";
import React from "react";
import * as anchor from "@project-serum/anchor";
import Home from "./Home";
import "./fonts.css";

import { ConnectionProvider } from './contexts/ConnectionContext';
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { ThemeProvider, createTheme } from "@material-ui/core";
import YoutubeBackground from "react-youtube-background";
import responsiveFontSizes from "@material-ui/core/styles/responsiveFontSizes";
import { SPLTokenListProvider } from "./contexts/tokenList";
import { WalletProvider } from "./contexts/WalletContext";
import { LoaderProvider } from './components/Loader';
import { BrowserRouter } from "react-router-dom";
import { CoingeckoProvider } from "./contexts/coingecko";
import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

let theme = createTheme({
  palette: {
    type: "dark"
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1367,
      xl: 1536
    }
  }
});

theme = responsiveFontSizes(theme);

theme.typography.body1 = {
  fontSize: "0.7rem",
  [theme.breakpoints.up("md")]: {
    fontSize: "0.8rem"
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: "0.9rem"
  },
  // [theme.breakpoints.up("xl")]: {
  //   fontSize: "1rem"
  // }
};

// eslint-disable-next-line
const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID!
    );

    return candyMachineId;
  } catch (e) {
    console.log("Failed to construct CandyMachineId", e);
    return undefined;
  }
};

const getCandyMachineIdsArray = (): anchor.web3.PublicKey[] => {
  try {
    return [new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID_NEUTRAL!
    ), new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID_NEUTRAL!
    )];
  } catch (e) {
    console.log("Failed to construct CandyMachineId", e);
    return [];
  }
};

// const candyMachineId = getCandyMachineId();
const candyMachineIdsArray = getCandyMachineIdsArray();
// const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl("devnet")
);

console.log(connection.rpcEndpoint)

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);
const txTimeoutInMilliseconds = 30000;

const App = () => {
  // eslint-disable-next-line
  // const endpoint = useMemo(() => clusterApiUrl(network), []);

  // eslint-disable-next-line
  // const wallets = useMemo(
  //   () => [
  //     getPhantomWallet(),
  //     getSolflareWallet(),
  //     getSlopeWallet(),
  //     getSolletWallet({ network }),
  //     getSolletExtensionWallet({ network })
  //   ],
  //   []
  // );

  const videoId = "wRmK2zv1ezw";
  const style = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  };

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ConnectionProvider>
          <SPLTokenListProvider>
            <CoingeckoProvider>
              <LoaderProvider>
                <WalletProvider>
                  <WalletDialogProvider>
                    <YoutubeBackground
                      style={style}
                      videoId={videoId}
                      playerOptions={{ modestbranding: 1 }}
                    >
                      <Home
                        candyMachineIdsArray={candyMachineIdsArray}
                        connection={connection}
                        startDate={startDateSeed}
                        txTimeout={txTimeoutInMilliseconds}
                        // rpcHost={rpcHost}
                        showInfo={true}
                        launchTime={new Date().getTime() + 10000}
                      />
                    </YoutubeBackground>
                  </WalletDialogProvider>
                </WalletProvider>
              </LoaderProvider>
            </CoingeckoProvider>
          </SPLTokenListProvider>
        </ConnectionProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
