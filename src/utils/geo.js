import { GeoFirestore } from 'geofirestore';

// eslint-disable-next-line import/prefer-default-export
export function getGeofirestore(firestore) {
  return new GeoFirestore(firestore);
}

/**
 * Calculates the distance between two points (given the latitude/longitude of those points).
 * From https://www.geodatasource.com/developers/javascript.
 * @see https://www.geodatasource.com/developers/javascript
 * @param {*} lat1
 * @param {*} lon1
 * @param {*} lat2
 * @param {*} lon2
 * @param {String} unit - Unit of distance where 'M' is statute miles (default), 'K' is kilometers, 'N' is nautical miles
 */
export function distanceBetweenPoints(lat1, lon1, lat2, lon2, unit) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') {
    dist *= 1.609344;
  }
  if (unit === 'N') {
    dist *= 0.8684;
  }
  return dist;
}
