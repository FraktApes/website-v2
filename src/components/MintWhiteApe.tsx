import { Box, Container, DialogContent, Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { DialogTitle } from "@mui/material";
import { FunctionComponent } from "react";
import WhiteApe from "../images/Frakt-4941ape3180.png"
import CloseIcon from '@mui/icons-material/Close';
import styled from "styled-components";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui/lib/WalletDialogButton";
import { Header } from "../Header";
import { GatewayProvider } from "@civic/solana-gateway-react";
import {
    CANDY_MACHINE_PROGRAM,
} from "../candy-machine";
import { MintButton } from "../MintButton";
import { PublicKey } from "@solana/web3.js";
import { MintProps } from "../interfaces/MintProps";
import { useWallet } from "@solana/wallet-adapter-react";

interface Props {
    name?: string;
    image?: string;
    text1?: string;
    text2?: string;
    mintAddress?: string;
    onClose: () => void;
    mintProps: MintProps;
}

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

const MintWhiteApe: FunctionComponent<Props> = ({
    name,
    image,
    text1,
    text2,
    mintAddress,
    onClose,
    mintProps,
}) => {

    const { isUserMinting, candyMachine, rpcUrl, onMint } = mintProps
    const wallet = useWallet();

    return (
        <Paper style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 10, paddingTop: 0 }}>
            <BootstrapDialogTitle id="modal" onClose={onClose}>
                <Typography style={{ color: "white", fontFamily: "robo" }} variant="h5" align="center">{name}</Typography>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container direction="column" justifyContent="center" >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center', 
                        border: 'solid white', 
                        borderRadius: 10,
                        width  : '80%',
                        marginLeft: "auto",
                        marginRight: "auto",    
                    }}>
                        <Grid container direction="column" justifyContent="center">
                            <Typography
                                align="center"
                                variant="body1"
                                style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                            >
                                Required to mint:
                            </Typography>
                            <Typography
                                align="center"
                                variant="body1"
                                style={{ color: "white", fontFamily: "robo", marginBottom: 10 }}
                            >
                                DEGEN APE or FRAKT or WL - Snapshot date TBC.
                            </Typography>
                        </Grid>
                    </Box>


                    <img src={WhiteApe} alt="loading ..." style={{
                        width: "70%",
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginTop: 10
                    }} />

                    <Typography
                        align="center"
                        variant="body1"
                        style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                    >
                        Artificial Neural Networks have been used to combine Degen Apes
                        and FRAKT artwork, two OG Solana NFT projects.
                    </Typography>

                    <Typography
                        align="center"
                        variant="body1"
                        style={{ color: "white", fontFamily: "robo", marginTop: 10 }}
                    >
                        8888 Neutral Apes have been created to give back to the Degen Ape and FRAKT communities.
                    </Typography>



                    {/* <Button size="large" style={{ background: "#36454F", color: "white", fontFamily: "robo", marginLeft: "auto", marginRight: "auto", marginTop: 20 }} >
                        Mint
                    </Button> */}

                    {!wallet.connected ? (
                        <Grid container direction="column" justifyContent="center">
                            <ConnectButton>Connect Wallet</ConnectButton>
                        </Grid>
                    ) : (
                        <Grid container direction="column" justifyContent="center">
                            <Header candyMachine={candyMachine} />
                            <Container>
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
                            </Container>
                        </Grid>
                    )}

                </Grid>
            </DialogContent>
            {/* <DialogActions> */}


            {/* <Button  size="large" style={{ background: "#36454F", color: "white", fontFamily: "robo", marginLeft:"auto", marginRight:"auto" }} >
                    Mint
                </Button> */}
            {/* <Button autoFocus onClick={onClose} style={{background:"grey", color: "white", fontFamily: "robo"}} >
                    Close
                </Button> */}
            {/* </DialogActions> */}
        </Paper>
    )
}

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2, color: "white", fontFamily: "robo", alignContent: "center" }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};

export default MintWhiteApe;