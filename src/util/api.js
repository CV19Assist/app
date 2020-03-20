// Defines the common API.
import { ajax } from 'rxjs/ajax';

class API {
  constructor() {
    this.URL = "https://us-central1-cv19assist-dev.cloudfunctions.net/api";
  }

  setFirebaseUserAndGetToken(firebaseUser) {
    this._firebaseUser = firebaseUser;
    return firebaseUser.getIdToken();
  }

  setIdToken(token) {
    this._idToken = token;
  }

  _getAuthenticatedRequestObservable(url, method, data, headers) {
    method = method || "get";
    headers = headers || {};
    headers.Authorization = `Bearer ${this._idToken}`

    const req = ajax({
      url: this.URL + url,
      method: method,
      headers: headers,
      body: data, 
    });
    return req;
  }

  getAuthenticatedJSONRequestObservable(url, method, data) {
    return this._getAuthenticatedRequestObservable(url, method, data, {
      "Content-Type": "application/json"
    });
  }

  getAuthenticatedRequestObservable(url, method, data) {
    return this._getAuthenticatedRequestObservable(url, method, data);
  }
}

const api = new API();
export default api;