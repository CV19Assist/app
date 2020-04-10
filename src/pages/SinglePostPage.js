import React from "react";
import { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";

import { Redirect } from "react-router-dom";
const useStyles = makeStyles(theme => ({
  container: {
    textAlign: "center"
  },
  title: {
    padding: theme.spacing(8)
  },
  sub: {
    color: theme.palette.text.secondary
  },
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    lineHeight: theme.spacing(0.2),

    color: theme.palette.text.primary
  }
}));

function SinglePost({ match }) {
  const classes = useStyles();
  const [post, setPost] = useState({});
  const [loaded, setLoaded] = useState(true);
  useEffect(() => {
    fetch(`https://cv19assist.github.io/blog/entry-${match.params.id}.json`)
      .then(res => res.json())
      .then(data => {
        setLoaded(true);
        setPost(data);
      })
      .catch(err => {
        setLoaded(false);
        console.log({ error: err });
      });
  // eslint-disable-next-line
  }, []);

  if (!loaded) {
    return <Redirect to="/*" />;
  }
  return (
    <React.Fragment>
      <main className={classes.container}>
        <div>
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h3"
              className={classes.title}
              align="center"
              gutterBottom
            >
              {post.title}
            </Typography>
            <Typography
              component="h5"
              variant="subtitle2"
              className={classes.sub}
              align="center"
              gutterBottom
            >
              By {post.author}
            </Typography>

            <Typography
              component="h5"
              variant="subtitle2"
              align="center"
              className={classes.sub}
              gutterBottom
            >
              {post.createdAt ? post.createdAt.substring(0, 10) : null}
            </Typography>
            <Typography
              className={classes.content}
              align="center"
              gutterBottom
              dangerouslySetInnerHTML={{ __html: post.html }}
            ></Typography>
            <div className="content"></div>
          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}

export default SinglePost;
