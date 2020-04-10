import React from "react";
import { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { Redirect } from "react-router-dom";
import Post from "../components/Post";

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    fetch(process.env.REACT_APP_BLOG_POST_INDEX)
      .then((res) => res.json())
      .then((data) => {
        setLoaded(true);
        setPosts(data);
      })
      .catch((err) => {
        setLoaded(false);
        console.log({ error: err });
      });
  }, []);

  if (!loaded) {
    return <Redirect to="*" />;
  }

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
}

export default Blog;
