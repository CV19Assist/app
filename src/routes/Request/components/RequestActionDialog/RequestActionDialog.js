import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useFirestore, useUser } from 'reactfire';
import { useNotifications } from 'modules/notification';
import {
  REQUESTS_ACTIONS_COLLECTION,
  REQUESTS_DISCUSSIONS_COLLECTION,
  USERS_COLLECTION,
} from 'constants/collections';

function RequestActionDialog({
  actionType,
  open,
  onCancel,
  onCloseDialog,
  requestPublicSnapshot,
}) {
  const user = useUser();
  const firestore = useFirestore();
  const { FieldValue } = useFirestore;
  const { register, handleSubmit, errors, reset, isSubmitting } = useForm();
  const { showError, showSuccess } = useNotifications();

  async function onSubmit(values) {
    const userProfileSnap = await firestore
      .doc(`${USERS_COLLECTION}/${user.uid}`)
      .get();

    const batch = firestore.batch();

    const userInfo = {
      firstName: userProfileSnap.get('firstName'),
      displayName: userProfileSnap.get('displayName'),
    };

    const statusUpdate = {
      d: {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
    };

    // Action
    const action = {
      requestId: requestPublicSnapshot.id,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
      ...userInfo,
    };

    if (actionType === 'accept') {
      // For now not implementing comments when accepting.
      statusUpdate.d.status = 10; // Assigned
      statusUpdate.d.owner = user.uid;
      statusUpdate.d.ownerInfo = {
        takenAt: FieldValue.serverTimestamp(),
        ...userInfo,
      };
      action.kind = 10; // Took ownership.
    } else {
      const comment = {
        requestId: requestPublicSnapshot.id,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: user.uid,
        author: userInfo,
        contentType: 'text',
        content: values.comment,
      };

      if (actionType === 'release') {
        statusUpdate.d.status = 1; // Back to unassigned
        statusUpdate.d.owner = null;
        statusUpdate.d.ownerInfo = null;
        action.kind = 5; // Release
        comment.kind = 5; // Completion comment
      } else if (actionType === 'complete') {
        statusUpdate.d.status = 20; // Complete
        action.kind = 20; // Complete
        comment.kind = 20; // Completion comment
      }

      const commentRef = firestore
        .collection(REQUESTS_DISCUSSIONS_COLLECTION)
        .doc();
      batch.set(commentRef, comment);
    }
    batch.set(requestPublicSnapshot.ref, statusUpdate, { merge: true });

    const actionRef = firestore.collection(REQUESTS_ACTIONS_COLLECTION).doc();
    batch.set(actionRef, action);

    try {
      await batch.commit();
      showSuccess('Request updated. Thanks, again!');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('failed to commit request action batch', err);
      showError('Could not act on this request.');
    }
    onCloseDialog();
    reset();
  }

  return (
    <Dialog open={open} maxWidth="md" data-test="requsetActionDialog">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {actionType === 'release' && 'Release'}
          {actionType === 'accept' && 'Accept'}
          {actionType === 'complete' && 'Complete'} Request
        </DialogTitle>
        <DialogContent>
          {actionType === 'complete' && (
            <DialogContentText data-test="complete-info-text">
              Thank you very much! Please let us know what you ended up doing to
              complete the request and when you did it. If you need help or
              follow-up, please contact us using the link in the navigation bar.
            </DialogContentText>
          )}
          {actionType === 'release' && (
            <DialogContentText data-test="release-info-text">
              It&apos;s OK to release a request if you cannot complete. We only
              request that you let us know the reason below for not completing
              it.
            </DialogContentText>
          )}
          {actionType === 'accept' && (
            <>
              <div data-test="accept-info-text">
                <DialogContentText>
                  Thank you very much for your interest in this request. Once
                  you confirm below, please reach out to the requester to get
                  any clarifications about the request and decide on the final
                  timing. Given the unique circumstances, we recommend calling
                  the person whenever possible, assuming it’s not too late in
                  the night.
                </DialogContentText>
                <DialogContentText>
                  After accepting, you will be able to add comments to this
                  request. Our goal is to make this efficient for everyone, so,
                  after contacting please add a comment with any follow ups. In
                  case if the requester does not reply or you are sent to the
                  voicemail then please post a comment here mentioning this.
                </DialogContentText>
                <DialogContentText>
                  If after talking to the requester, you realize that you cannot
                  fulfill the request then you can always release it for another
                  volunteer to take. Please make sure to add a comment so the
                  admins can update the request appropriately.
                </DialogContentText>
                <DialogContentText>
                  As always, please ensure that you meet the listed volunteering
                  criteria and feel free to contact us if you have any
                  questions.
                </DialogContentText>
              </div>
            </>
          )}

          {(actionType === 'release' || actionType === 'complete') && (
            <TextField
              name="comment"
              label="Comment"
              helperText={
                errors.comment && 'Please enter at least some information.'
              }
              error={!!errors.comment}
              fullWidth
              multiline
              margin="dense"
              inputRef={register({ required: true })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            color="primary"
            disabled={isSubmitting}
            data-test="submit-button">
            {actionType === 'complete' && 'Complete'}
            {actionType === 'release' && 'Release'}
            {actionType === 'accept' && 'OK'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

RequestActionDialog.propTypes = {
  actionType: PropTypes.oneOf(['complete', 'release', 'accept']),
  requestPublicSnapshot: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCloseDialog: PropTypes.func.isRequired,
};

export default RequestActionDialog;
