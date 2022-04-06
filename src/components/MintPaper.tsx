// Write a react component  

import { Box, Button, Dialog, Grid, Paper, Typography } from "@material-ui/core";
import React from "react";
import { FunctionComponent } from "react";
import { MintCountdown } from "../MintCountdown";

import "../ribbon.css";
import MintModal from "./MintModal";

interface Props {
    countdownTime: number;
    backgroundImage?: string;
    name?: string;
}
const MintPaper: FunctionComponent<Props> = ({
    countdownTime,
    backgroundImage,
    name
}) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };


    const isLive = countdownTime < new Date().getTime()

    return (
        <Button >
            {!isLive ?
                <Paper elevation={0} variant="outlined" style={{ backgroundColor: "#130110", borderRadius: 10 }} >
                    <Box sx={{
                        width: 430,
                        height: 80,
                    }} >
                        <Grid container direction="row" style={{ margin: 5, width: "100%" }}>
                            <Grid item xs={5}>
                                <Typography align="center"
                                    variant="body2"
                                    style={{ color: "white", fontFamily: "robo", marginTop: 12, marginLeft: 25 }}>
                                    Free NFT
                                </Typography>
                                <Typography align="center"
                                    variant="body2"
                                    style={{ color: "white", fontFamily: "robo", marginBottom: 6, marginLeft: 25 }}>
                                    Available in:
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <MintCountdown
                                    date={new Date(countdownTime)}
                                    style={{ justifyContent: "center", marginTop: 6 }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                :
                <>
                    <Dialog
                        onClose={handleClose}
                        aria-labelledby="customized-dialog-title"
                        open={open}
                    >
                        <MintModal onClose={handleClose} name="White Apes" />
                    </Dialog>
                    <Paper elevation={0} style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        borderRadius: 10,

                    }} className="parent">
                        <Box sx={{
                            width: 430,
                            height: 80,
                        }}
                            onClick={handleClickOpen}
                        >
                            <Grid container direction="row" style={{ margin: 5 }}>
                                <Grid item xs={5}>
                                    <Typography align="center"
                                        variant="body1"
                                        style={{ color: "white", fontFamily: "robo", marginTop: 26, marginLeft: 25 }}>
                                        {name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={7}>

                                    <Typography className="ribbon">
                                        FREE
                                    </Typography>
                                </Grid>
                            </Grid>

                        </Box>
                    </Paper>
                </>
            }

        </Button >
    )
}


export default MintPaper;