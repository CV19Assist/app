# COVID-19 Assist app

## Firebase Deployment Notes

* View Environments: `firebase use`
* Select proejct: `firebase use project_id_or_alias` Either `default` for dev, or `production` for production.

To deploy, make sure that you select the right environment.  Then run one of the following.

```
# For single component
firebase deploy --only functions
firebase deploy --only hosting

# For multiple components
firebase deploy --only functions,hosting
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build:staging`

This will do a production build, but use the `.env.staging` file which has build configuration for the cv19assist-dev firebase project.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Local Development

For local development, you can create a `.env.development.local` with the following configuration to run against the local firebase functions emulator.


```
REACT_APP_API_URL=http://localhost:5001/cv19assist-dev/us-central1/api/v1
```