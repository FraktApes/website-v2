import * as anchor from "@project-serum/anchor";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { MintCountdown } from "./MintCountdown";
import { toDate, formatNumber } from "./utils";
import { CandyMachineAccount } from "./candy-machine";

type HeaderProps = {
  candyMachine?: CandyMachineAccount;
};

export const Header = ({ candyMachine }: HeaderProps) => {
  return (
    <Grid container direction="row" justifyContent="center" wrap="nowrap">
      <Grid container direction="row" wrap="nowrap">
        <Grid container style={{ justifyContent: "center" }} direction="column">
          <Typography
            style={{ marginLeft: 5 }}
            variant="body2"
            color="textSecondary"
          >
            Time until mint
          </Typography>
          <MintCountdown
            date={toDate(
              candyMachine?.state.goLiveDate
                ? candyMachine?.state.goLiveDate
                : candyMachine?.state.isPresale
                ? new anchor.BN(new Date().getTime() / 1000)
                : undefined
            )}
            // style={{ justifyContent: 'flex-end' }}
            status={
              !candyMachine?.state?.isActive || candyMachine?.state?.isSoldOut
                ? "COMPLETED"
                : candyMachine?.state.isPresale
                ? "PRESALE"
                : "LIVE"
            }
          />
        </Grid>
        {candyMachine && (
          <Grid container direction="row" wrap="nowrap" style={{marginLeft:5, marginTop:10}}>
            <Grid container direction="column">
              <Typography variant="body2" color="textSecondary">
                Remaining
              </Typography>
              <Typography
                variant="h6"
                color="textPrimary"
                style={{
                  fontWeight: "bold",
                }}
              >
                {/*TODO UPDATE BEOFRE LAUNCH*/}
                {/* 5000 */}
                {`${candyMachine?.state.itemsRemaining}`}
              </Typography>
            </Grid>
            <Grid container direction="column">
              <Typography variant="body2" color="textSecondary">
                Price
              </Typography>
              <Typography
                variant="h6"
                color="textPrimary"
                style={{ fontWeight: "bold" }}
              >
                {/*TODO UPDATE BEOFRE LAUNCH*/}
                {/* ??? 0.5 */}
                {getMintPrice(candyMachine)}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

const getMintPrice = (candyMachine: CandyMachineAccount): string => {
  const price = formatNumber.asNumber(
    candyMachine.state.isPresale &&
      candyMachine.state.whitelistMintSettings?.discountPrice
      ? candyMachine.state.whitelistMintSettings?.discountPrice!
      : candyMachine.state.price!
  );
  return `??? ${price}`;
};
