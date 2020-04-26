import React, { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Paper,
  makeStyles,
} from '@material-ui/core';
import { Redirect, useRouteMatch, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { BLOG_PATH } from 'constants/paths';
import { ChevronLeft as BackIcon } from '@material-ui/icons';
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
      <Helmet>
        <title>{post.title}</title>
      </Helmet>
      <Container maxWidth="md">
        <Typography variant="h5" gutterBottom>
          {post.title}
        </Typography>
        <Paper className={classes.paper}>
          <Typography variant="subtitle2" color="textSecondary">
            By {post.author} &ndash;{' '}
            {post.createdAt ? post.createdAt.substring(0, 10) : null}
          </Typography>
          <Typography
            gutterBottom
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <Button
            component={Link}
            to={BLOG_PATH}
            variant="outlined"
            startIcon={<BackIcon />}
            color="primary">
            Back
          </Button>
        </Paper>
      </Container>
    </>
  );
}

export default SinglePostPage;
