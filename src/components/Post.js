import React from "react";
import { Fragment } from "react";
import { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: "1.4em",
    color: "primary",
    marginTop: "2em"
  },
  sub: {
    fontSize: "0.8rem",
    color: "rgb(85, 85, 85)"
  },
  content:{
      marginTop: "1em",
      marginBottom: "1em",
      lineHeight: "1.5em",
      color: "rgb(85, 85, 85)"
  },
  divider: {
      margin: "2em"
  }
}));

function Post(props) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography
        variant="h5"
        className={classes.title}
        color="textPrimary"
        gutterBottom
        component={Link}
        to={`/blog/${props.slug}`}
      >
        {props.title}
      </Typography>
      <br />
      <Typography
        variant="p"
        className={classes.sub}
        align="left"
        color="textPrimary"
        gutterBottom
      >
        By {props.author}
      </Typography>
      {" "}-{" "}
      <Typography
        className={classes.sub}
        variant="p"
        align="left"
        color="textPrimary"
        gutterBottom
      >
        {props.date}
      </Typography>
      <Typography
        className={classes.content}
        component="p"
        align="left"
        color="textPrimary"
        gutterBottom
      >
        {props.content}
      </Typography>
      <Divider light className={classes.divider}/>
    </React.Fragment>
  );
}

export default Post;