import React, { useEffect, useState } from 'react';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Post from './Post/Post';

function BlogPage() {
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
        <Typography variant="h4" gutterBottom>
          Blog
        </Typography>
        {posts.map((post) => {
          return (
            <Post
              slug={post.slug}
              title={post.title}
              author={post.author}
              date={post.createdAt.substring(0, 10)}
              key={post.id}
              content={post.summary}
            />
          );
        })}
      </Container>
    </>
  );
}

export default BlogPage;
