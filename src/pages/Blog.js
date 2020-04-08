import React from "react";
import { Fragment } from "react";
import { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import Divider from "@material-ui/core/Divider";
import Post from "../components/Post"

function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("https://cv19assist.github.io/blog/index.json")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
      })
      .catch(err => console.log({ error: err }));
  }, []);

  return (
    <React.Fragment>
      <main>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            align="left"
            color="textPrimary"
            gutterBottom
          >
            
            Recent Blog Posts:
          </Typography>
          {posts.map(post => {
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
      </main>
    </React.Fragment>
  );
}

export default Blog;
