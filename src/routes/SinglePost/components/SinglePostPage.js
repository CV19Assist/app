import React, { useEffect, useState } from 'react';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';

import { Redirect, useRouteMatch } from 'react-router-dom';
import styles from './SinglePostPage.styles';

const useStyles = makeStyles(styles);

function SinglePostPage() {
  const classes = useStyles();
  const [post, setPost] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const match = useRouteMatch();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BLOG_POST_URL}entry-${match.params.id}.json`)
      .then((res) => res.json())
      .then((data) => {
        setLoaded(true);
        setLoading(false);
        setPost(data);
      })
      .catch(() => {
        setLoaded(false);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  if (!loaded && !loading) {
    return <Redirect to="/*" />;
  }
  return (
    <>
      <main className={classes.container}>
        <div>
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h3"
              className={classes.title}
              align="center"
              gutterBottom>
              {post.title}
            </Typography>
            <Typography
              component="h5"
              variant="subtitle2"
              className={classes.sub}
              align="center"
              gutterBottom>
              By {post.author}
            </Typography>

            <Typography
              component="h5"
              variant="subtitle2"
              align="center"
              className={classes.sub}
              gutterBottom>
              {post.createdAt ? post.createdAt.substring(0, 10) : null}
            </Typography>
            <Typography
              className={classes.content}
              align="center"
              gutterBottom
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <div className="content" />
          </Container>
        </div>
      </main>
    </>
  );
}

export default SinglePostPage;
