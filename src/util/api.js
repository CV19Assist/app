// Defines the common API.
import { ajax, AjaxRequest } from 'rxjs/ajax';

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

  getAuthenticatedRequestObservable(url, method, data) {
    method = method || "get";
    const req = ajax({
      url: this.URL + url,
      headers: { Authorization: `Bearer ${this._idToken}` },
      body: data, 
    });
    return req;
  }
}

const api = new API();
export default api;