# COVID-19 Assist app

## Please note that all new development is now being done on the [`next branch`](/CV19Assist/app/tree/next) which will be going live in the coming days.

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

## CI

CI uses Github Actions and the settings live within the [workflows folder](/.github/workflows). There are two workflows:

* `verify.yml` - verifies code on pull request by checking for lint then building
* `deploy.yml` - deploys to Firebase project which matches branch name (aliases in [.firebaserc](/.firebaserc))

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

## Initializing the Firebase Environment

The firebase functions require the following environment variables.

```
# Set the environment URL - Production
firebase functions:config:set environment.name=Production
firebase functions:config:set frontend.url=https://cv19assist.com
firebase functions:config:set admin.emails.0='first-email-address-here'
firebase functions:config:set admin.emails.1='second-email-address-here'

# For staging
firebase functions:config:set environment.name=Dev
firebase functions:config:set frontend.url=https://cv19assist-dev.web.app
firebase functions:config:set admin.emails.0='first-email-address-here'
firebase functions:config:set admin.emails.1='second-email-address-here'
```
