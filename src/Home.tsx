import { useEffect, useMemo, useState, useCallback } from "react";
import * as anchor from "@project-serum/anchor";

import styled from "styled-components";
import { Container, Snackbar } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Alert from "@material-ui/lab/Alert";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken
} from "./candy-machine";
import { AlertState, InfoState } from "./utils";
import { Header } from "./Header";
import { MintButton } from "./MintButton";
import { GatewayProvider } from "@civic/solana-gateway-react";
import Grid from "@material-ui/core/Grid";
import "@fortawesome/fontawesome-free/js/all.js";
import Button from "@material-ui/core/Button";
import apegif from "./apegif.gif";
import Typography from "@material-ui/core/Typography";
import { MintCountdown } from "./MintCountdown";
import "./fonts.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";

const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
  showInfo: boolean;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined
  });
  const [infoState, setInfoState] = useState<InfoState>({
    showInfo: true
  });

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection
        );
        setCandyMachine(cndy);
      } catch (e) {
        console.log("There was a problem fetching Candy Machine state");
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async () => {
    try {
      setIsUserMinting(true);
      document.getElementById("#identity")?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true
          );
        }

        if (status && !status.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success"
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error"
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error"
      });
    } finally {
      setIsUserMinting(false);
    }
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState
  ]);

  const toggleInfo = () => {
    console.log(infoState.showInfo);
    if (infoState.showInfo) {
      setInfoState({ showInfo: false });
    } else {
      setInfoState({ showInfo: true });
    }
  };
  // let theme = createTheme();
  //
  // const styles = (theme: Theme) => ({
  //   root: {
  //     margin: "auto",
  //     [theme.breakpoints.down("md")]: {
  //       width: "50%"
  //     },
  //     [theme.breakpoints.up("md")]: {
  //       width: "75%"
  //     },
  //     [theme.breakpoints.up("lg")]: {
  //       width: "90%"
  //     }
  //   }
  // });

  // const IMG2 = styled("img")(({ theme }) => ({
  //   margin: "auto",
  //   [theme.breakpoints.down("md")]: {
  //     width: "50%"
  //   },
  //   [theme.breakpoints.up("md")]: {
  //     width: "75%"
  //   },
  //   [theme.breakpoints.up("lg")]: {
  //     width: "90%"
  //   }
  // }));


  const theme = useTheme();

  theme.breakpoints.values =  {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1367,
    xl: 1536,
  }
  const matches = useMediaQuery(theme.breakpoints.up('lg'));
  const matchesMobile = useMediaQuery(theme.breakpoints.up('md'));

  return (
    // <ThemeProvider theme={theme}>
    <Container className={(matchesMobile) ? "vignette": ""}>
      <Container style={{ marginTop: 30 }}>
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
              href={"https://twitter.com/FraktApes"}
              target="_blank"
              rel="noreferrer"
              style={{ marginRight: 10 }}
            >
              <i
                className="fab fa-twitter fa-3x"
                style={{ color: "#fff", opacity: 0.9 }}
              ></i>
            </Button>
            <Button
              href={"https://discord.gg/ZBQx6wwz25"}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 10, marginRight: 10 }}
            >
              <i
                className="fab fa-discord fa-3x"
                style={{
                  color: "#fff",
                  opacity: 0.9
                }}
              ></i>
            </Button>
            <Button onClick={toggleInfo} style={{ marginLeft: 10 }}>
              <i
                className="fas fa-info-circle fa-4x"
                style={{ color: "#fff", opacity: 0.9, animation: "pulse 1s infinite" }}
              ></i>
            </Button>
          </Grid>
        </Container>

        {infoState.showInfo ? (
          <Container maxWidth="sm" style={{ marginTop: 15 }}>
            <Paper
              style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 6 }}
            >
              <Grid container direction="column" justifyContent="center">

                {(matches) ? <img src={apegif} alt="loading..." style={{
                  width: "80%",
                  margin: "auto"
                }}/> : <img src={apegif} alt="loading..." style={{ width: "60%", margin: "auto" }}/>}

                <Typography
                  align="center"
                  variant="body1"
                  style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                >
                  Artificial Neural Networks have been used to synthesise Degen Apes
                  and Frakt Artwork together.
                </Typography>

                <Typography
                  align="center"
                  variant="body1"
                  style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                >
                  A Neuralism Pass will be included with each purchase, giving buyers access to an AI NFT Launchpad and further free airdrops.
                </Typography>

                <Typography
                  align="center"
                  variant="body1"
                  style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                >
                  More information on the project (incl. whitelist) can be found in the discord.
                </Typography>

                {/*<Typography*/}
                {/*  align="center"*/}
                {/*  variant="body1"*/}
                {/*  style={{ color: "grey" }}*/}
                {/*>*/}
                {/*  Click the project info button again to mint.*/}
                {/*</Typography>*/}
              </Grid>
            </Paper>
          </Container>
        ) : (
          <Container maxWidth="sm" style={{ marginTop: 25 }}>
            <Paper
              style={{ padding: 24, backgroundColor: "#151A1F", borderRadius: 6 }}
            >
              {!wallet.connected ? (
                <Grid container direction="column" justifyContent="center">
                  <Typography
                    align="center"
                    variant="body1"
                    style={{ color: "grey" }}
                  >
                    Time until mint.
                  </Typography>
                  <MintCountdown
                    date={new Date(1646899200000)}
                    style={{ justifyContent: "center" }}
                    status={"PRESALE"}
                  />
                  <ConnectButton>Connect Wallet</ConnectButton>
                  {/*<Typography*/}
                  {/*  align="center"*/}
                  {/*  variant="body1"*/}
                  {/*  style={{ color: "grey" }}*/}
                  {/*>*/}
                  {/*  Click the project info button or connect your wallet.*/}
                  {/*</Typography>*/}
                </Grid>
              ) : (
                <>
                  <Header candyMachine={candyMachine}/>
                  <MintContainer>
                    {candyMachine?.state.isActive &&
                    candyMachine?.state.gatekeeper &&
                    wallet.publicKey &&
                    wallet.signTransaction ? (
                      <GatewayProvider
                        wallet={{
                          publicKey:
                            wallet.publicKey ||
                            new PublicKey(CANDY_MACHINE_PROGRAM),
                          //@ts-ignore
                          signTransaction: wallet.signTransaction
                        }}
                        gatekeeperNetwork={
                          candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                        }
                        clusterUrl={rpcUrl}
                        options={{ autoShowModal: false }}
                      >
                        <MintButton
                          candyMachine={candyMachine}
                          isMinting={isUserMinting}
                          onMint={onMint}
                        />
                      </GatewayProvider>
                    ) : (
                      <MintButton
                        candyMachine={candyMachine}
                        isMinting={isUserMinting}
                        onMint={onMint}
                      />
                    )}
                  </MintContainer>
                </>
              )}
            </Paper>
          </Container>
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
    </Container>
    // </ThemeProvider>
  );
};

export default Home;
