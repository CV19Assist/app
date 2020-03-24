import React, { useState, useEffect }  from "react";
import { Button, Grid, makeStyles, Paper, Container, CircularProgress, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom";
import NeedDetailsComponent from '../components/NeedDetails';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(3)
  }
}));

export default function NeedContactInfo(props) {
  const classes = useStyles();
  const id = props.id;
  const dispatch = useDispatch();
  const user = useSelector(state => state.get("user"));
  const ui = useSelector(state => state.getIn(["ui", "needs", "details"]));
  const need = ui.get("need");

  return (
    <React.Fragment>
      Contact Info.
    </React.Fragment>
  );
}

NeedContactInfo.propTypes = {
  id: PropTypes.string.isRequired,
};

export default NeedContactInfo;