import { GeoFirestore } from 'geofirestore';

// eslint-disable-next-line import/prefer-default-export
export function getGeofirestore(firestore) {
  return new GeoFirestore(firestore);
}
