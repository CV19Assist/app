import { KM_TO_MILES } from 'constants/geo';

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

/**
 * Scrable specific location to a location nearby
 * Based on https://stackoverflow.com/a/31280435/391230
 * @see https://stackoverflow.com/a/31280435/391230
 * @param {Object} center - Center of scramble radius
 * @param {Number} radiusInMeters - Radius from original point to scramble
 */
export function scrambleLocation(center, radiusInMeters) {
  const y0 = center.lat;
  const x0 = center.lng;
  const rd = radiusInMeters / 111300; // about 111300 meters in one degree

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust the x-coordinate for the shrinking of the east-west distances
  const xp = x / Math.cos(y0);

  const newlat = y + y0;
  const newlon2 = xp + x0;

  return {
    _latitude: Math.round(newlat * 1e5) / 1e5,
    _longitude: Math.round(newlon2 * 1e5) / 1e5,
  };
}

/**
 * Converts the given Kilometer value to Miles.
 * @param {Number} km - Kilometers to convert.
 */
export function kmToMiles(km) {
  return km / KM_TO_MILES;
}
