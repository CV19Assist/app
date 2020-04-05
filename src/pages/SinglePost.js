import React from "react";
import { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles(theme => ({
  container: {
    textAlign: "center"
  },
  title: {
    fontSize: "3em",
    margin: "2em 0px"
  },
  sub: {
    fontSize: "0.8rem",
    color: "rgb(85, 85, 85)"
  },
  content: {
    marginTop: "1.5em",
    marginBottom: "1em",
    lineHeight: "1.5em",
    fontSize: "1.2em",
    color: "rgb(85, 85, 85)"
  }
}));

function SinglePost({ match }) {
  const classes = useStyles();
  const [post, setPost] = useState({});
  
  useEffect(() => {
    fetch(`https://cv19assist.github.io/blog/entry-${match.params.id}.json`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
      })
      .catch(err => console.log({ error: err }));
  }, []);

  return (
    <React.Fragment>
      <main className={classes.container}>
        <div>
          <Container maxWidth="md">
            <Typography
              className={classes.title}
              align="center"
              color="textPrimary"
              gutterBottom
            >
              {post.title}
            </Typography>
            <Typography
              variant="p"
              className={classes.sub}
              align="left"
              color="textPrimary"
              gutterBottom
            >
              By {post.author}
            </Typography>
            {" "}-{" "}
            <Typography
              className={classes.sub}
              variant="p"
              align="left"
              color="textPrimary"
              gutterBottom
            >
              {post.createdAt ? post.createdAt.substring(0, 10):null}
            </Typography>
            <Typography
              component="p"
              className={classes.content}
              align="center"
              color="textPrimary"
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
