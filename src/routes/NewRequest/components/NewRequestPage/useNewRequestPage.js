import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useFirestore, useUser, useAnalytics } from 'reactfire';
import { useNotifications } from 'modules/notification';
import {
  USERS_PRIVILEGED_COLLECTION,
  USERS_COLLECTION,
  REQUESTS_COLLECTION,
  REQUESTS_PUBLIC_COLLECTION,
  REQUESTS_CONTACT_INFO_COLLECTION,
  REQUESTS_ACTIONS_COLLECTION,
} from 'constants/collections';
import { GeoFirestore } from 'geofirestore';
import { REQUEST_SUCCESSFUL_PATH } from 'constants/paths';
import { DEFAULT_LOCATION_INFO } from 'constants/geo';

export default function useNewRequestPage() {
  const history = useHistory();
  const firestore = useFirestore();
  const analytics = useAnalytics();
  const user = useUser();
  const { FieldValue, GeoPoint } = useFirestore;
  const { showSuccess, showError } = useNotifications();
  const [requestLocation, setRequestLocation] = useState(DEFAULT_LOCATION_INFO);
  const [requestLocationLoading, setRequestLocationLoading] = useState(true);

  // Conditionally load Profile (only if current auth user exists)
  useEffect(() => {
    async function loadLatLongFromProfile() {
      // Set lat/long from user object if they exist
      if (user && user.uid) {
        const profileRef = firestore.doc(`${USERS_COLLECTION}/${user.uid}`);
        const profileSnap = await profileRef.get();
        const geopoint = profileSnap.get('preciseLocation');
        if (geopoint) {
          const { latitude, longitude } = geopoint;
          const newRequestLocation = {
            generalLocation: { latitude, longitude },
            generalLocationName: profileSnap.get('generalLocationName'),
            preciseLocation: { latitude, longitude },
          };
          // console.log('effect', newRequestLocation);
          setRequestLocation(newRequestLocation);
        }
        setRequestLocationLoading(false);
      } else {
        setRequestLocationLoading(false);
      }
    }
    // NOTE: useEffect is used to load data so it can be done conditionally based
    // on whether current user is logged in
    loadLatLongFromProfile();
  }, [user, firestore]);

  /**
   * Submit help request
   * @param {Object} values - Form values
   */
  async function submitRequest(values) {
    if (!requestLocation) {
      alert('Please select a location by clicking on the map above.'); // eslint-disable-line no-alert
      return;
    }

    const { lastName, phone, email, ...publicValues } = values;

    const requestPublicInfo = {
      ...publicValues,
      firstName: values.firstName,
      needFinancialAssistance: Boolean(values.needFinancialAssistance),
      immediacy: parseInt(values.immediacy, 10),
      createdAt: FieldValue.serverTimestamp(),
      lastUpdatedAt: FieldValue.serverTimestamp(),
      usersWithContactInfoAccess: [],
      status: 1,
      generalLocation: new GeoPoint(
        requestLocation.generalLocation.latitude,
        requestLocation.generalLocation.longitude,
      ),
      generalLocationName: requestLocation.generalLocationName,
    };

    // Convert needs to an array
    requestPublicInfo.needs = [];
    Object.keys(values.needs).forEach((item) => {
      if (values.needs[item]) {
        requestPublicInfo.needs.push(item);
      }
    });

    const requestContactInfo = {
      phone,
      email,
    };

    const requestPrivateInfo = {
      firstName: values.firstName,
      lastName: values.lastName,
      immediacy: parseInt(values.immediacy, 10),
      needs: requestPublicInfo.needs,
      status: 1,
      createdAt: FieldValue.serverTimestamp(),
      ...requestLocation,
    };

    let userInfo = null;
    if (user && user.uid) {
      requestPublicInfo.createdBy = user.uid;
      requestPrivateInfo.createdBy = user.uid;

      const userRef = firestore.doc(
        `${USERS_PRIVILEGED_COLLECTION}/${user.uid}`,
      );
      const profile = (await userRef.get()).data();
      // TODO: Test and verify after confirming the sign-in workflow.
      let pieces = user.displayName.split(' ');
      if (pieces.length < 2) {
        pieces = [user.displayName, ''];
      }
      if (profile) {
        profile.displayName = user.displayName;
        [profile.firstName, profile.lastName] = pieces;

        userInfo = {
          uid: user.uid,
          firstName: profile.firstName,
          displayName: profile.displayName,
        };
        requestPublicInfo.createdByInfo = userInfo;
      }
    }

    /* eslint-disable no-console */
    // console.log('Writing values to Firestore:', {
    //   requestPublicInfo,
    //   requestPrivateInfo,
    //   requestContactInfo,
    // });
    /* eslint-enable no-console */

    try {
      const requestRef = await firestore
        .collection(REQUESTS_COLLECTION)
        .add(requestPrivateInfo);

      const action = {
        requestId: requestRef.id,
        kind: 1, // 1-created
        createdAt: requestPublicInfo.createdAt,
        ...userInfo,
      };

      const geofirestore = new GeoFirestore(firestore);
      await Promise.all([
        geofirestore
          .collection(REQUESTS_PUBLIC_COLLECTION)
          .doc(requestRef.id)
          .set(requestPublicInfo, { customKey: 'generalLocation' }),
        firestore
          .collection(REQUESTS_CONTACT_INFO_COLLECTION)
          .doc(requestRef.id)
          .set(requestContactInfo),
        firestore.collection(REQUESTS_ACTIONS_COLLECTION).add(action),
      ]);

      showSuccess('Request submitted!');
      analytics.logEvent('new-request', action);
      history.replace(REQUEST_SUCCESSFUL_PATH);
    } catch (err) {
      showError(err.message || 'Error submitting request');
    }
  }
  /**
   * Update stat once selected in ClickableMap
   * @param {Object} newLocation - New location object from ClickableMap
   */
  async function handleLocationChange(newLocation) {
    // Set location to form
    setRequestLocation(newLocation);
  }

  return {
    submitRequest,
    handleLocationChange,
    requestLocation,
    requestLocationLoading,
  };
}
