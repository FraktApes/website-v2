import React, { useEffect, useMemo, useState, useCallback } from "react";
import * as anchor from "@project-serum/anchor";

import styled from "styled-components";
import { Box, Container, Link, Snackbar, Tab } from "@material-ui/core";
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
import apecompress from "./apecompress.webp";
import Typography from "@material-ui/core/Typography";
import { MintCountdown } from "./MintCountdown";
import "./fonts.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import Tooltip from "@material-ui/core/Tooltip";
import HelpIcon from '@mui/icons-material/Help';
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import MintPaper from "./components/MintPaper";
import WhiteApeBanner from "./images/white-apes-banner2.png"
import Patch from "./images/patch.png"

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
    showInfo: false
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
      // setInfoState({ showInfo: true });
      // TODO CHANGE BACK TO FALSE
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

  theme.breakpoints.values = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1367,
    xl: 1536
  };
  // const matches = useMediaQuery(theme.breakpoints.up("lg"));
  const matchesMobile = useMediaQuery(theme.breakpoints.up("md"));

  const [value, setValue] = React.useState('1');

  const handleChange = (event: any, newValue: string) => {
    setValue(newValue);
  };


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
                    <Tab label="Genesis Series" value="2" />
                    <Tab label="Info" value="3" />
                  </TabList>
                </Box>

                <TabPanel value="1">
                  <Grid container spacing={2} direction="column">
                    <Grid item>
                      <MintPaper connected={wallet.connected} name={"White Apes"} countdownTime={new Date('December 17, 1995 13:24:00').getTime()} backgroundImage={WhiteApeBanner}>
                      </MintPaper>
                    </Grid>
                    <Grid item>
                      <MintPaper connected={wallet.connected} countdownTime={new Date().getTime() + 86400000 / 2}>
                      </MintPaper>
                    </Grid>
                    <Grid item>
                      <MintPaper connected={wallet.connected} countdownTime={new Date().getTime() + 86400000}>
                      </MintPaper>
                    </Grid>
                  </Grid>


                </TabPanel>

                <TabPanel value="2">

                  <Grid container direction="column" justifyContent="center">

                    <img src={apecompress} alt="loading..." style={{
                      width: "80%",
                      marginLeft: "auto",
                      marginRight: "auto"
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
                      888 Genesis Apes have been created from the rarest Degen Apes and FRAKT artwork.
                    </Typography>

                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                    >

                      Owning a Genesis ape will give access to all the free AI NFT Launchpad mints.
                    </Typography>

                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 25 }}
                    >
                      Required to mint:
                    </Typography>
                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo" }}
                    >
                      2 SOL
                    </Typography>

                    {/* <Button style={{ background: "#36454F", color: "white", fontFamily: "robo", marginTop: 10 }} >
                      Mint
                    </Button> */}


                    {/* Mint /////// */}
                    {!wallet.connected ? (
                      <Grid container direction="column" justifyContent="center">
                        {/* <Grid container direction="row" justifyContent="center" style={{ marginBottom: 2 }}>
                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "grey" }}
                    >
                      Mint Countdown
                    </Typography>

                    <Tooltip
                      title="Best Practice: Use a new/burner wallet when minting, nefarious projects will try and steal your funds with malicious smart contracts"
                      style={{ marginLeft: 4, color: "grey", fontSize: "1.05em" }}>
                      <HelpIcon fontSize="small" />

                    </Tooltip>
                  </Grid> */}

                        <MintCountdown
                          date={new Date(new Date().getTime() + 86400000 / 2)}
                          style={{ justifyContent: "center" }}
                        />

                        <ConnectButton>Connect Wallet</ConnectButton>
                      </Grid>
                    ) : (
                      <>
                        <Header candyMachine={candyMachine} />
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
                      style={{ color: "white", fontFamily: "robo", marginTop: 20, marginBottom: 20}}
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
                      <Link variant="body1" underline="always" align="center" style={{ color: "white", fontFamily: "robo", margin: "auto", paddingLeft: 8}} href="https://twitter.com/PatchNFT">Patch</Link>
                    </Typography>
                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "white", fontFamily: "robo", marginTop: 5 }}
                    >
                      NFT visionary and AI expert.
                     </Typography>

                    </Grid> 

                </TabPanel>
              </TabContext>

            </Paper>
          </Container>
        ) : (
          <Container maxWidth="sm" style={{ marginTop: 25 }}>
            <Paper
              style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 6 }}
              hidden
            >
              {!wallet.connected ? (
                <Grid container direction="column" justifyContent="center">
                  <Grid container direction="row" justifyContent="center" style={{ marginBottom: 2 }}>
                    <Typography
                      align="center"
                      variant="body1"
                      style={{ color: "grey" }}
                    >
                      Mint Countdown
                    </Typography>

                    <Tooltip
                      title="Best Practice: Use a new/burner wallet when minting, nefarious projects will try and steal your funds with malicious smart contracts"
                      style={{ marginLeft: 4, color: "grey", fontSize: "1.05em" }}>
                      <HelpIcon fontSize="small" />

                    </Tooltip>
                  </Grid>

                  <MintCountdown
                    date={new Date(1646899200000)}
                    style={{ justifyContent: "center" }}
                  />

                  <ConnectButton>Connect Wallet</ConnectButton>
                </Grid>
              ) : (
                <>
                  <Header candyMachine={candyMachine} />
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
