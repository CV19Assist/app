import React, { useEffect, useState } from 'react';
import { Typography, Paper, Container, makeStyles } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Post from './Post/Post';
import styles from './BlogPage.styles';

const useStyles = makeStyles(styles);

function BlogPage() {
  const classes = useStyles();
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BLOG_POST_URL}index.json`)
      .then((res) => res.json())
      .then((data) => {
        setLoaded(true);
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoaded(false);
        setLoading(false);
      });
  }, []);

  if (!loaded && !loading) {
    return <Redirect to="/*" />;
  }
  return (
    <>
      <Helmet>
        <title>Blog</title>
      </Helmet>
      <Container maxWidth="md">
        <Typography variant="h5" gutterBottom>
          Blog
        </Typography>
        {posts.map((post) => {
          return (
            <Paper className={classes.paper} key={post.id}>
              <Post
                slug={post.slug}
                title={post.title}
                author={post.author}
                date={post.createdAt.substring(0, 10)}
                key={post.id}
                content={post.summary}
              />
            </Paper>
          );
        })}
      </Container>
    </>
  );
}

export default BlogPage;
