import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import {
  useFirestore,
  useFirestoreCollection,
  useUser,
  useFirestoreDoc,
} from 'reactfire';
import { Skeleton } from '@material-ui/lab';
import { useNotifications } from 'modules/notification';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  REQUESTS_PUBLIC_COLLECTION,
  REQUESTS_DISCUSSIONS_COLLECTION,
  USERS_COLLECTION,
} from 'constants/collections';
import kindMap from 'constants/discussion';
import styles from './Discussion.styles';

const useStyles = makeStyles(styles);

function CommentList({ requestId }) {
  const classes = useStyles();
  const firestore = useFirestore();

  const querySnapshot = useFirestoreCollection(
    firestore
      .collection(`${REQUESTS_DISCUSSIONS_COLLECTION}`)
      .where('requestId', '==', requestId)
      .orderBy('createdAt', 'asc'),
  );

  if (querySnapshot.empty) {
    return (
      <Box color="text.disabled">
        <Typography
          variant="body2"
          className={classes.noComments}
          data-test="no-comments">
          No comments yet.
        </Typography>
        <Divider className={classes.divider} />
      </Box>
    );
  }

  return (
    <>
      <List>
        {querySnapshot.docs.map(
          (docSnap) =>
            // When new comment is added locally, the createdAt can be the serverTimestamp() value.
            // So, we wait on rendering until any new snapshot has finished writing.
            !docSnap.metadata.hasPendingWrites && (
              <ListItem key={docSnap.id} divider alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{docSnap.get('author.firstName').slice(0, 1)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="subtitle2">
                      {docSnap.get('author.firstName')} &ndash;{' '}
                      <Typography
                        variant="body2"
                        display="inline"
                        color="textSecondary">
                        {format(docSnap.get('createdAt').toDate(), 'p - PPPP')}
                      </Typography>{' '}
                      {docSnap.get('kind') !== 1 && (
                        <Chip
                          variant="outlined"
                          size="small"
                          icon={kindMap[docSnap.get('kind')].icon}
                          label={kindMap[docSnap.get('kind')].shortDescription}
                        />
                      )}
                    </Typography>
                  }
                  secondary={docSnap
                    .get('content')
                    .split('\n')
                    .map((content, key) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Typography variant="body1" key={key} gutterBottom>
                        {content}
                      </Typography>
                    ))}
                />
              </ListItem>
            ),
        )}
      </List>
    </>
  );
}

CommentList.propTypes = {
  requestId: PropTypes.string.isRequired,
};

function CommentEntry({ requestId }) {
  const firestore = useFirestore();
  const user = useUser();
  const { FieldValue } = useFirestore;
  const { showSuccess, showError } = useNotifications();

  const { register, handleSubmit, errors, reset, isSubmitting } = useForm({
    nativeValidation: false,
  });
  const [showForm, setShowForm] = useState(false);

  const userProfile = useFirestoreDoc(
    firestore.doc(`${USERS_COLLECTION}/${user.uid}`),
  );

  if (!showForm) {
    return <Button onClick={() => setShowForm(true)}>Add Comment</Button>;
  }

  async function onSubmit(values) {
    const comment = {
      requestId,
      kind: 1, // Discussion
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      author: {
        firstName: userProfile.get('firstName'),
        displayName: userProfile.get('displayName'),
      },
      contentType: 'text',
      content: values.comment,
    };
    try {
      await firestore.collection(REQUESTS_DISCUSSIONS_COLLECTION).add(comment);
      reset();
      setShowForm(false);
      showSuccess('Comment added');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Comment add error', err);
      showError('Unexpected error, failed to add comment.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        name="comment"
        multiline
        label="Comment"
        variant="outlined"
        fullWidth
        margin="dense"
        error={!!errors.comment}
        helperText={errors.comment && 'Please enter a comment.'}
        inputRef={register({ required: true })}
      />
      <Button
        size="small"
        color="primary"
        variant="contained"
        type="submit"
        disabled={isSubmitting}>
        Add Comment
      </Button>
    </form>
  );
}

CommentEntry.propTypes = {
  requestId: PropTypes.string.isRequired,
};

/*
 * This component assumes that the user is logged in.
 */
function Discussion({ requestId }) {
  const classes = useStyles();
  const firestore = useFirestore();
  const user = useUser();
  const userProfileSnap = useFirestoreDoc(
    firestore.doc(`${USERS_COLLECTION}/${user.uid}`),
  );

  const requestPublicSnap = useFirestoreDoc(
    firestore.doc(`${REQUESTS_PUBLIC_COLLECTION}/${requestId}`),
  );

  if (
    requestPublicSnap.get('d.owner') !== user.uid &&
    userProfileSnap.get('role') !== 'admin'
  ) {
    return null;
  }

  return (
    <Paper className={classes.paper} data-test="discussion">
      <Typography variant="h6">Private Comments</Typography>
      <Typography variant="body2">
        These comments are only shown to the assigned volunteer and the
        administrators.
      </Typography>
      <Suspense
        fallback={
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        }>
        <CommentList requestId={requestId} />
      </Suspense>
      {user && <CommentEntry requestId={requestId} />}
    </Paper>
  );
}

Discussion.propTypes = {
  requestId: PropTypes.string.isRequired,
};

export default Discussion;
