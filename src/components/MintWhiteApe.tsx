import { Button, DialogContent, Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { DialogTitle } from "@mui/material";
import { FunctionComponent } from "react";
import WhiteApe from "../images/Frakt-4941ape3180.png"
import CloseIcon from '@mui/icons-material/Close';


interface Props {
    name?: string;
    image?: string;
    text1?: string;
    text2?: string;
    mintAddress?: string;
    onClose: () => void;
}

const MintWhiteApe: FunctionComponent<Props> = ({
    name,
    image,
    text1,
    text2,
    mintAddress,
    onClose
}) => {

    // const {close} = useModalContext();

    return (
        <Paper style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 10, paddingTop: 0 }}>
            <BootstrapDialogTitle id="modal" onClose={onClose}>
            <Typography style={{ color: "white", fontFamily: "robo"}} variant="h5" align="center">White Apes</Typography>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container direction="column" justifyContent="center">
                    {/* <Typography
                        align="center"
                        variant="body1"
                        style={{ color: "white", fontFamily: "robo" }}
                    >
                        Required to mint: DEGEN APE or FRAKT or WL
                    </Typography> */}

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
                        8888 White Apes have been created to give back to the Degen Ape and FRAKT communities.
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
                        DEGEN APE or FRAKT or WL - Snapshot date TBC.
                    </Typography>

                    <Button  size="large" style={{ background: "#36454F", color: "white", fontFamily: "robo", marginLeft:"auto", marginRight:"auto", marginTop: 20 }} >
                    Mint
                </Button>
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