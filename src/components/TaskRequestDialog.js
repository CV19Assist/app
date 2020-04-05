import React from 'react';
// import { makeStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
// import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { useDispatch, useSelector } from 'react-redux';
import { cancelRequestNeedAssignment, submitForAssignment } from "../modules/needs";
import NeedDetails from './NeedDetails';
import Hidden from "@material-ui/core/Hidden";
import ShareIcon from '@material-ui/icons/Share';
import AcceptIcon from '@material-ui/icons/ThumbUp';
import OpenInNewWindowIcon from '@material-ui/icons/OpenInNew';

// const useStyles = makeStyles(theme => ({
// }));

function TaskRequestDialog() {
  // const classes = useStyles();
  const dispatch = useDispatch();
  const ui = useSelector(state => state.getIn(["ui", "needs", "request"]));
  const need = ui.get("requestedNeed");
  const dialogOpen = ui.get("dialogOpen");

  const handleCancelRequest = () => {
    dispatch(cancelRequestNeedAssignment());
  };

  const handleTaskAssignment = () => {
    dispatch(submitForAssignment(need));
  };

  const handleOpenInNewWindow = () => {
    window.open(`/needs/${need.id}`);
  };

  const getNeedUrl = id => {
    let href = window.location.href;
    let path = `${href.substr(
      0,
      href.indexOf("/", href.indexOf("://") + 3)
    )}/needs/${id}`;
    // console.log(path);
    return path;
  };

  return (
    <Dialog open={dialogOpen} maxWidth="md" fullWidth>
      {dialogOpen && (
        <React.Fragment>
          {/* <DialogTitle>Request</DialogTitle> */}
          <DialogContent dividers>
            <NeedDetails id={need.id} hideActionButtons={true} />
          </DialogContent>
          <DialogActions>
            {/* <Button autoFocus onClick={handleClose} color="primary"> */}
            <Button color="secondary" onClick={handleCancelRequest}>
              Cancel
            </Button>
            <Hidden only={["xs", "sm"]}>
              <Button onClick={handleOpenInNewWindow} startIcon={<OpenInNewWindowIcon />}>
                Open in New Window
              </Button>
            </Hidden>
            {navigator.share && (
              <Button startIcon={<ShareIcon />} onClick={() => {
                navigator.share({
                  title: "CV19 Assist Need Link",
                  text: "CV19 Assist Need Link",
                  url: getNeedUrl(need.id)
                });
              }}>
                Share
              </Button>
            )}
            <Button autoFocus color="primary" onClick={handleTaskAssignment} startIcon={<AcceptIcon />}>
              Looks good, assign to me
            </Button>
          </DialogActions>
        </React.Fragment>
      )}
    </Dialog>
  );
}

export default TaskRequestDialog;
