import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.text.primary,
    marginTop: theme.spacing(2),
  },
  sub: {
    color: theme.palette.text.secondary,
  },
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    lineHeight: theme.spacing(0.2),
    color: theme.palette.text.primary,
  },
  divider: {
    margin: theme.spacing(2),
  },
}));

function Post(props) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography
        variant="h5"
        className={classes.title}
        gutterBottom
        component={Link}
        to={`/blog/${props.slug}`}
      >
        {props.title}
      </Typography>
      <br />
      <Typography
        variant="subtitle2"
        className={classes.sub}
        align="left"
        gutterBottom
      >
        By {props.author}
      </Typography>
      <Typography
        className={classes.sub}
        variant="subtitle2"
        align="left"
        gutterBottom
      >
        {props.date}
      </Typography>
      <Typography
        className={classes.content}
        component="p"
        align="left"
        gutterBottom
      >
        {props.content}
      </Typography>
      <Divider light className={classes.divider} />
    </React.Fragment>
  );
}

export default Post;
