import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import { Link, generatePath } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BLOG_SINGLE_POST_PATH } from 'constants/paths';
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
        to={generatePath(BLOG_SINGLE_POST_PATH, { id: slug })}>
        {title}
      </Typography>
      <br />
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        By {author} &ndash; {date}
      </Typography>
      <Typography variant="body1" gutterBottom className={classes.content}>
        {content}
      </Typography>
      <Typography variant="body2">
        <Link to={generatePath(BLOG_SINGLE_POST_PATH, { id: slug })}>
          Read more...
        </Link>
      </Typography>
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
