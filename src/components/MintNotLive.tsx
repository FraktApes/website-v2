import { DialogContent, Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { DialogTitle } from "@mui/material";
import { FunctionComponent } from "react";
import CloseIcon from '@mui/icons-material/Close';


interface Props {
    name?: string;
    image?: string;
    requirement?: string;
    onClose: () => void;
}

const MintWhiteApe: FunctionComponent<Props> = ({
    name,
    image,
    requirement,
    onClose
}) => {
    return (
        <Paper style={{ padding: 16, backgroundColor: "#151A1F", borderRadius: 10, paddingTop: 0 }}>
            <BootstrapDialogTitle id="modal" onClose={onClose}>
                {name}
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container direction="column" justifyContent="center">

                    <Typography
                        align="center"
                        variant="body1"
                        style={{ color: "white", fontFamily: "robo", marginTop: 5, marginBottom: 5 }}
                    >
                        Required to mint:
                    </Typography>
                    <Typography
                        align="center"
                        variant="body1"
                        style={{ color: "white", fontFamily: "robo", marginBottom: 10 }    }
                    >
                        {requirement}
                    </Typography>

                </Grid>
            </DialogContent>
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