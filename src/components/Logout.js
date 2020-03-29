import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  makeStyles,
  Container,
  Typography,
  Paper,
  LinearProgress
} from "@material-ui/core";
import { logout } from "../modules/user";
import { Helmet } from 'react-helmet';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(3)
  }
}));

function Logout() {
  const classes = useStyles();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <Container maxWidth="md">
      <Helmet><title>Logging Out</title></Helmet>
      <Paper className={classes.paper}>
        <Typography
          variant="h4"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Logging out...
        </Typography>
        <LinearProgress />
      </Paper>
    </Container>
  );
}

export default Logout;
