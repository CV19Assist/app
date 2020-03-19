// Defines the common API.
import { ajax, AjaxRequest } from 'rxjs/ajax';

class API {
  constructor() {
    this.URL = "https://us-central1-cv19assist-dev.cloudfunctions.net/api";
  }

  async setFirebaseUser(firebaseUser) {
    this._firebaseUser = firebaseUser;
    this._token = await firebaseUser.getIdToken();
    console.log(`Got token ${this._token}`);
  }

  getAuthenticatedRequestObservable(url) {
    console.log(`Token is ${this._token}`);
    const req = ajax.getJSON({
      url: url,
      headers: {
        Authorization: `Bearer ${this._firebaseUser.IdToken}`
      }
    });
    return req;
  }
}

const api = new API();
export default api;