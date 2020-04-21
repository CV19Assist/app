import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import PropTypes from 'prop-types';
import styles from './Post.styles';

const useStyles = makeStyles(styles);

function Post({ title, author, slug, date, content }) {
  const classes = useStyles();
  return (
    <>
      <Typography
        variant="h5"
        className={classes.title}
        gutterBottom
        component={Link}
        to={`/blog/${slug}`}>
        {title}
      </Typography>
      <br />
      <Typography
        variant="subtitle2"
        className={classes.sub}
        align="left"
        gutterBottom>
        By {author}
      </Typography>
      <Typography
        className={classes.sub}
        variant="subtitle2"
        align="left"
        gutterBottom>
        {date}
      </Typography>
      <Typography
        className={classes.content}
        component="p"
        align="left"
        gutterBottom>
        {content}
      </Typography>
      <Divider light className={classes.divider} />
    </>
  );
}

Post.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};
export default Post;
