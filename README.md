# CV19Assist App

[![Build Status][build-status-image]][build-status-url]
[![Coverage][coverage-image]][coverage-url]
[![License][license-image]][license-url]
[![Code Style][code-style-image]][code-style-url]

> App for connecting volunteers with at-health-risk population during The Coronavirus Pandemic

## Table of Contents

1. [Requirements](#requirements)
1. [Getting Started](#getting-started)
1. [Config Files](#config-files)
1. [Application Structure](#application-structure)
1. [Routing](#routing)
   1. [Async Routes](#async-routes)
   1. [Sync Routes](#sync-routes)
1. [Testing](#testing)
   1. [UI Tests](#ui-tests)
   1. [Functions Unit Tests](#functions-unit-tests)
1. [Configuration](#configuration)
1. [Deployment](#deployment)
1. [FAQ](#faq)

## Requirements

- node `^10.18.0`
- npm `^6.0.0`
- yarn `^1.0.0`

## Getting Started

1. Install app and functions dependencies: `yarn install && yarn install --prefix functions`
1. Copy settings from one of the `.env.*` files into `.env.local` - this is not tracked by git and will be how your local development project gets Firebase config.
1. Start Development server: `yarn start`

While developing, you will probably rely mostly on `yarn start`; however, there are additional scripts at your disposal:

| `yarn <script>` | Description                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `start`         | Serves your app at `localhost:3000` with automatic refreshing and hot module replacement                                |
| `start:dist`    | Builds the application to `./dist` then serves at `localhost:3000` using firebase hosting emulator                      |
| `start:emulate` | Same as `start`, but pointed to database emulators (make sure to call `emulators` first to boot up emulators)           |
| `build`         | Builds the application to `./dist`                                                                                      |
| `test`          | Runs ui tests with Cypress. See [testing](#testing)                                                                     |
| `test:open`     | Opens ui tests runner (Cypress Dashboard). See [testing](#testing)                                                      |
| `test:emulate`  | Same as `test:open` but with tests pointed at emulators                                                                 |
| `lint`          | [Lints](http://stackoverflow.com/questions/8503559/what-is-linting) the project for potential errors                    |
| `lint:fix`      | Lints the project and [fixes all correctable errors](http://eslint.org/docs/user-guide/command-line-interface.html#fix) |

[Husky](https://github.com/typicode/husky) is used to enable `prepush` hook capability. The `prepush` script currently runs `eslint`, which will keep you from pushing if there is any lint within your code. If you would like to disable this, remove the `prepush` script from the `package.json`.

## Config Files

There are multiple configuration files:

- Firebase Project Configuration - `.firebaserc`
- Cloud Functions Local Configuration - `functions/.runtimeconfig.json`

More details in the [Application Structure Section](#application-structure)

## Application Structure

The application structure presented in this boilerplate is **fractal**, where functionality is grouped primarily by feature rather than file type. Please note, however, that this structure is only meant to serve as a guide, it is by no means prescriptive. That said, it aims to represent generally accepted guidelines and patterns for building scalable applications.

```
├── .github                  # Github Settings + Github Actions Workflows
│   ├── deploy.yml           # Deploy workflow (called on merges to "master" and "production" branches)
│   └── verify.yml           # Verify workflow (run when PR is created)
├── cypress                  # UI Tests
│   └── index.html           # Main HTML page container for app
├── public                   # All build-related configuration
│   └── index.html           # Main HTML page container for app
├── src                      # Application source code
│   ├── components           # Global Reusable Presentational Components
│   ├── constants            # Project constants such as firebase paths and form names
│   │  └── paths.js          # Paths for application routes
│   ├── containers           # Global Reusable Container Components
│   ├── layouts              # Components that dictate major page structure
│   │   └── CoreLayout       # Global application layout in which routes are rendered
│   ├── routes               # Main route definitions and async split points
│   │   ├── index.js         # Bootstrap main application routes
│   │   └── Home             # Fractal route
│   │       ├── index.js     # Route definitions and async split points
│   │       ├── components   # Presentational React Components (state connect and handler logic in enhancers)
│   │       └── routes/**    # Fractal sub-routes (** optional)
│   ├── styles               # Application-wide styles (generally settings)
│   └── utils                # General Utilities (used throughout application)
│   │   ├── components.js    # Utilities for building/implementing react components (often used in enhancers)
│   │   ├── form.js          # For forms
│   │   └── router.js        # Utilities for routing such as those that redirect back to home if not logged in
├── .env.local               # Environment settings for when running locally
├── .eslintignore            # ESLint ignore file
├── .eslintrc.js             # ESLint configuration
├── .firebaserc              # Firebase Project configuration settings (including ci settings)
├── cypress.json             # Cypress project settings
├── database.rules.json      # Security Rules for Firebase Real Time Database
├── db.json-schema.json      # JSON Schema for database
├── dbschema.txt.js          # File outlining planned database schema
├── firebase.json            # Firebase Service settings (Hosting, Functions, etc)
├── firestore.indexes.json   # Indexes for Cloud Firestore
├── firestore.rules          # Security Rules for Cloud Firestore
└── storage.rules            # Security Rules for Cloud Storage For Firebase
```

## Routing

We use `react-router-dom` [route matching](https://reacttraining.com/react-router/web/guides/basic-components/route-matching) (`<route>/index.js`) to define units of logic within our application. The application routes are defined within `src/routes/index.js`, which loads route settings which live in each route's `index.js`. The component with the suffix `Page` is the top level component of each route (i.e. `HomePage` is the top level component for `Home` route).

There are two types of routes definitions:

### Sync Routes

The most simple way to define a route is a simple object with `path` and `component`:

_src/routes/Home/index.js_

```js
import HomePage from "./components/HomePage";

// Sync route definition
export default {
  path: "/",
  component: HomePage,
};
```

### Async Routes

Routes can also be seperated into their own bundles which are only loaded when visiting that route, which helps decrease the size of your main application bundle. Routes that are loaded asynchronously are defined using `loadable` function which uses `React.lazy` and `React.Suspense`:

_src/routes/NotFound/index.js_

```js
import loadable from "utils/components";

// Async route definition
export default {
  path: "*",
  component: loadable(() =>
    import(/* webpackChunkName: 'NotFound' */ "./components/NotFoundPage")
  ),
};
```

With this setting, the name of the file (called a "chunk") is defined as part of the code as well as a loading spinner showing while the bundle file is loading.

More about how routing works is available in [the react-router-dom docs](https://reacttraining.com/react-router/web/guides/quick-start).

## Testing

### UI Tests

Cypress is used to write and run UI tests which live in the `cypress` folder. The following scripts can be used to run tests:

- Run using Cypress run: `yarn test`
- Open Test Runner UI (`cypress open`): `yarn test:open`

To run tests against emulators:

1. Start database emulators: `yarn emulators`
1. Start React app pointed at emulators: `yarn start:emulate`
1. Open Cypress test runner with test utils pointed at emulators: `yarn test:emulate`

To Run tests in CI add the following environment variables within your CI provider:

- `SERVICE_ACCOUNT` - Used to create custom auth tokens for test user login
- `FIREBASE_APP_NAME` - name of Firebase app (used to load SDK config)
- `TEST_UID` - UID of the user used for testing

### Functions Unit Tests

Mocha/Chai are used to run Functions unit tests. Unit tests are run against Firebase emulators. The following scripts can be used to run functions tests:

- Start emulators and run functions unit tests: `yarn functions:test`
- Start emulators and run functions unit tests, generating coverage: `yarn functions:test:cov`

## Deployment

Build code before deployment by running `yarn build`. There are multiple options below for types of deployment, if you are unsure, checkout the Firebase section.

Before starting make sure to install Firebase Command Line Tool: `yarn i -g firebase-tools`

#### CI Deploy (recommended)

**Note**: Config for this is located within
`firebase-ci` has been added to simplify the CI deployment process. All that is required is providing authentication with Firebase:

1. Login: `firebase login:ci` to generate an authentication token (will be used to give CI rights to deploy on your behalf)
1. Set `FIREBASE_TOKEN` environment variable within CI environment
1. Run a build on CI

If you would like to deploy to different Firebase instances for different branches (i.e. `prod`), change `ci` settings within `.firebaserc`.

For more options on CI settings checkout the [firebase-ci docs](https://github.com/prescottprue/firebase-ci)

#### Manual deploy

1. Run `firebase:login`
1. Build Project: `yarn build`
1. Deploy to Firebase (everything including Hosting and Functions): `firebase deploy`

**NOTE:** You can use `yarn start:dist` to test how your application will work when deployed to Firebase.

## FAQ

1. Why node `10` instead of a newer version?

[Cloud Functions runtime runs on `10`](https://cloud.google.com/functions/docs/writing/#the_cloud_functions_runtime), which is why that is what is used for the CI build version.

[build-status-image]: https://img.shields.io/github/workflow/status/CV19Assist/app/Deploy?style=flat-square
[build-status-url]: https://github.com/CV19Assist/app/actions
[climate-image]: https://img.shields.io/codeclimate/github/CV19Assist/app.svg?style=flat-square
[climate-url]: https://codeclimate.com/github/CV19Assist/app
[coverage-image]: https://img.shields.io/codecov/c/gh/CV19Assist/app&style=flat-square
[coverage-url]: https://codecov.io/gh/CV19Assist/app
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/CV19Assist/app/blob/master/LICENSE
[code-style-image]: https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat-square
[code-style-url]: http://airbnb.io/javascript/
