import React, { Suspense, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFirestoreDoc, useFirestore, useUser } from 'reactfire';
import { Link } from 'react-router-dom';
import {
  REQUESTS_PUBLIC_COLLECTION,
  REQUESTS_CONTACT_INFO_COLLECTION,
} from 'constants/collections';
import { VpnKey as RequestContactIcon } from '@material-ui/icons';
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  makeStyles,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { LOGIN_PATH } from 'constants/paths';
import styles from './ContactInfo.styles';

const useStyles = makeStyles(styles);

function useContactInfo(requestId) {
  const firestore = useFirestore();
  const user = useUser();
  const { FieldValue } = useFirestore;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const requestPublicSnap = useFirestoreDoc(
    firestore.doc(`${REQUESTS_PUBLIC_COLLECTION}/${requestId}`),
  );

  function closeConfirmationDialog() {
    setConfirmationDialogOpen(false);
  }

  function requestAccess() {
    setConfirmationDialogOpen(true);
  }

  async function addUserToAccessList() {
    await requestPublicSnap.ref.set(
      {
        d: {
          usersWithContactInfoAccess: FieldValue.arrayUnion(user.uid),
          lastUpdatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );
  }

  let hasAccess = false;
  const usersWithContactInfoAccess = requestPublicSnap.get(
    'd.usersWithContactInfoAccess',
  );

  hasAccess =
    user != null &&
    usersWithContactInfoAccess != null &&
    usersWithContactInfoAccess.indexOf(user.uid) > -1;

  return [
    hasAccess,
    requestAccess,
    addUserToAccessList,
    confirmationDialogOpen,
    closeConfirmationDialog,
  ];
}

// This component assumes that the user has access to the given contact info and should not be used
// directly. Even though it assumes permissions, it also has a workaround for a timing issues
// related to permission when permission is granted on the request page.
function ContactDetails({ requestId }) {
  const classes = useStyles();
  const firestore = useFirestore();

  const [retries, setRetries] = useState(0);
  const [contactInfo, setContactInfo] = useState(null);

  // This is used to trigger the snapshot subscription after confirming that the user
  // has permission to access the contact info.
  const [docRef, setDocRef] = useState(null);

  // Because of timing issues, this component will likely get run before the server has applied
  // the requested document access resulting in almost a guranteed permission-denied error. So,
  // we use this effect to monitor for permission-denied until the change has propagated, at which
  // point, we do the actual doc subscription (next useEffect);
  useEffect(() => {
    async function getData() {
      try {
        const ref = firestore.doc(
          `${REQUESTS_CONTACT_INFO_COLLECTION}/${requestId}`,
        );
        // Call it once because this will throw the permission exception.
        await ref.get();
        setDocRef(ref); // Setting this will trigger the subscription useEffect.
      } catch (err) {
        // We only try reloading if insufficient permissions.
        if (err.code !== 'permission-denied') {
          throw err;
        }
        window.setTimeout(() => {
          setRetries(retries + 1);
        }, 1000);
      }
    }
    getData();
  }, [retries, firestore, requestId]);

  // Once the previous useEffect verifies that the user has access then this one does the actual
  // document subscription.
  useEffect(() => {
    if (!docRef) return undefined;
    const unsub = docRef.onSnapshot((docSnap) => {
      setContactInfo(docSnap);
    });
    return unsub;
  }, [docRef]);

  if (!contactInfo) {
    return <Skeleton />;
  }

  const phone = contactInfo.get('phone');
  const email = contactInfo.get('email');

  return (
    <div className={classes.info}>
      <Typography variant="body2">
        Phone: {phone ? <a href={`tel:${phone}`}>{phone}</a> : 'Not provided'}
      </Typography>
      <Typography variant="body2">
        Email:{' '}
        {email ? <a href={`mailto:${email}`}>{email}</a> : 'Not provided'}
      </Typography>
    </div>
  );
}

ContactDetails.propTypes = {
  requestId: PropTypes.string.isRequired,
};

function ContactInfo({ requestId }) {
  const classes = useStyles();
  const user = useUser();
  const [
    hasAccess,
    requestAccess,
    addUserToAccessList,
    confirmationDialogOpen,
    closeConfirmationDialog,
  ] = useContactInfo(requestId);

  async function handleOK() {
    await addUserToAccessList();
    closeConfirmationDialog();
  }

  function handleCancel() {
    closeConfirmationDialog();
  }

  return (
    <div className={classes.root}>
      {hasAccess ? (
        <ContactDetails requestId={requestId} />
      ) : (
        <>
          {user ? (
            <Button
              size="small"
              startIcon={<RequestContactIcon />}
              onClick={requestAccess}>
              Show Contact Info...
            </Button>
          ) : (
            <Button
              size="small"
              component={Link}
              to={LOGIN_PATH}
              startIcon={<RequestContactIcon />}>
              Please login to see contact info
            </Button>
          )}
          <Dialog open={confirmationDialogOpen}>
            <DialogTitle>Viewing Contact Details</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This volunteer system is open to public, but to minimize abuse
                we note who looks up the contact information on requests.
              </DialogContentText>
              <DialogContentText>
                We will only ask for this confirmation once per request.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleOK} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}

ContactInfo.propTypes = {
  requestId: PropTypes.string.isRequired,
};

// Wrap the main component so the loading widget is limited to just the section where the contact
// info is displayed.
function ContactInfoWrapped(props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <ContactInfo {...props} />
    </Suspense>
  );
}

ContactInfoWrapped.propTypes = ContactInfo.propTypes;

export default ContactInfoWrapped;
