import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useDispatch, useSelector } from 'react-redux';
import { cancelRequestNeedAssignment, submitForAssignment } from "../modules/needs";

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}));

function TaskRequestDialog() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const ui = useSelector(state => state.getIn(["ui", "taskRequest"]));
  const need = ui.get("requestedNeed");
  const dialogOpen = ui.get("dialogOpen");

  const handleCancelRequest = () => {
    dispatch(cancelRequestNeedAssignment());
  };

  const handleTaskAssignment = () => {
    dispatch(submitForAssignment(need));
  };

  return (
    <Dialog open={dialogOpen}>
      {dialogOpen && (
        <React.Fragment>
          <DialogTitle>Request</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Title: {need.shortDescription}
              <br />
              Disclaimer and other safety info here...
            </Typography>
          </DialogContent>
          <DialogActions>
            {/* <Button autoFocus onClick={handleClose} color="primary"> */}
            <Button autoFocus color="secondary" onClick={handleCancelRequest}>
              Cancel
            </Button>
            <Button autoFocus color="primary" onClick={handleTaskAssignment}>
              Sounds good, please assign to me
            </Button>
          </DialogActions>
        </React.Fragment>
      )}
    </Dialog>
  );
}

export default TaskRequestDialog;
