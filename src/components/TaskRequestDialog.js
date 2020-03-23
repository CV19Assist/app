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

  return (
    <Dialog open={dialogOpen} fullScreen>
      {dialogOpen && (
        <React.Fragment>
          {/* <DialogTitle>Request</DialogTitle> */}
          <DialogContent dividers>
            <NeedDetails id={need.id} hideActionButtons={true} />
          </DialogContent>
          <DialogActions>
            {/* <Button autoFocus onClick={handleClose} color="primary"> */}
            <Button autoFocus color="secondary" onClick={handleCancelRequest}>
              Cancel
            </Button>
            <Button autoFocus color="primary" onClick={handleTaskAssignment}>
              Looks good, assign to me
            </Button>
          </DialogActions>
        </React.Fragment>
      )}
    </Dialog>
  );
}

export default TaskRequestDialog;
