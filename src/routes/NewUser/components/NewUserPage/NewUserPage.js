import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from './NewUserPage.styles';

const useStyles = makeStyles(styles);

function NewUserPage() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <span>NewUser Component</span>
    </div>
  );
}

export default NewUserPage;
