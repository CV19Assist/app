import React  from "react";
import { makeStyles, Paper, Container } from '@material-ui/core';
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

export default function NeedDetails() {
  const classes = useStyles();
  const { id } = useParams();

  return (
    <Container>
      <Paper className={classes.paper}>
        <NeedDetailsComponent id={id} />
      </Paper>
    </Container>
  );
}