# COVID-19 Assist App

[![Build Status][build-status-image]][build-status-url]
[![Coverage][coverage-image]][coverage-url]
[![License][license-image]][license-url]
[![Code Style][code-style-image]][code-style-url]

> App for connecting volunteers with at-health-risk population during The Coronavirus Pandemic

## Table of Contents

1. [Requirements](#requirements)
1. [Getting Started](#getting-started)
1. [Data Model Concepts and Conventions](#data-model-concepts-and-conventions)
1. [Config Files](#config-files)
1. [Application Structure](#application-structure)
1. [Routing](#routing)
   1. [Route Types](#route-types)
   1. [Routes Requiring Auth](#routes-requiring-auth)
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
- jq `^1.5` - Commandline JSON tool (can be installed through homebrew: `brew install jq`)

## Getting Started

1. Install app and functions dependencies: `yarn install && yarn install --cwd functions`
1. Copy settings from one of the `.env.*` files, such as `.env.next` into `.env.local` <!-- - this is not tracked by git and will be how your local development project gets Firebase config. -->
1. Start Development server: `yarn start`

While developing, you will probably rely mostly on `yarn start`; however, there are additional scripts at your disposal:

| `yarn <script>` | Description                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `start`         | Serves your app at `localhost:3000` with automatic refreshing and hot module replacement                                |
| `start:dist`    | Builds the application to `./dist` then serves at `localhost:3000` using firebase hosting emulator                      |
| `start:emulate` | Same as `start`, but pointed to database emulators (make sure to call `emulators` first to boot up emulators)           |
| `build`         | Builds the application to `./dist`                                                                                      |
| `emulators`     | Firebase database emulators                                                                                             |
| `functions:test`| Start Firebase database emulators and run functions tests                                                               |
| `functions:test:cov`| Start Firebase database emulators, run functions tests, and generate code coverage                                  |
| `functions:test:base`| Run functions tests (requires `yarn emulators` to be running already)                                              |
| `test`          | Runs ui tests with Cypress. See [testing](#testing)                                                                     |
| `test:open`     | Opens ui tests runner (Cypress Dashboard). See [testing](#testing)                                                      |
| `test:emulate`  | Same as `test:open` but with tests pointed at emulators                                                                 |
| `lint`          | [Lints](http://stackoverflow.com/questions/8503559/what-is-linting) the project for potential errors                    |
| `lint:fix`      | Lints the project and [fixes all correctable errors](http://eslint.org/docs/user-guide/command-line-interface.html#fix) |

[Husky](https://github.com/typicode/husky) is used to enable `prepush` hook capability. The `prepush` script currently runs `eslint`, which will keep you from pushing if there is any lint within your code. If you would like to disable this, remove the `prepush` script from the `package.json`.

## Data Model Concepts and Conventions

Below are some data model concepts and conventions to be aware of.

### User document types

| Document           | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `users`            | Private user info that only the user themselves and the system admins can see.                                      |
| `users_privileged` | Semi-private data which, in the future, folks like organizational admins which a user might associate with can see. |
| `users_public`     | Public user information that anyone can see.                                                                        |

### Request document types

| Document          | Description                                                                      |
| ----------------- | -------------------------------------------------------------------------------- |
| `requests`        | Private request info that only the user themselves and the system admin can see. |
| `requests_public` | Public request information that anyone can see.                                  |


### Location conventions

| Property              | Description                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `preciseLocation`     | The exact location that we might have gotten from the user by clicking, using location API or by entering address. |
| `generalLocation`     | A "scrambled" version of the preciseLocation that randomly moves the lat/lng within a 1,000 feet.                  |
| `generalLocationName` | A "general" name for the preciseLocation which can be publicly shared, e.g. "Madison, WI," or "Milwaukee, MI."     |

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
├── rules-tests              # Rules tests
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

### Route Types

There are two types of routes definitions:

#### Sync Routes

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

#### Async Routes

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

### Routes Requiring Authentication

Routes can require that the user is authenticated before visiting the route. In the case that the user is not authenticated, they will be redirected the the login page.

_src/routes/Account/index.js_

```js
import loadable from "utils/components";
import { ACCOUNT_PATH as path } from "constants/paths"

export default {
  path,
  // Auth is required for page to load, otherwise redirects to login page
  authRequired: true,
  component: loadable(() =>
    import(/* webpackChunkName: 'Account' */ "./components/AccountPage")
  ),
};
```

## Testing

### Testing Setup

1. Visit the [Firebase Console](https://console.firebase.google.com/)
1. Select your project
1. Navigate to Project Settings (gear icon button at the top left of the page).
1. Navigate to "Service Accounts" tab
1. Click "Generate New Private Key"
1. Save the service account file to the root of the repo under `serviceAccount.json`

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
- `TEST_UID` - UID of the user used for testing

### Functions Unit Tests

Mocha/Chai are used to run Functions unit tests. Unit tests are run against Firebase emulators. The following scripts can be used to run functions tests:

- Start emulators and run functions unit tests: `yarn functions:test`
- Start emulators and run functions unit tests, generating coverage: `yarn functions:test:cov`

### Rules Tests

Mocha/Chai are used to run Rules tests, for example against Firestore Security Rules. This script will start the emulators and run the tests:

`yarn test-rules`

## FAQ

1. Why node `10` instead of a newer version?

    [Cloud Functions runtime runs on `10`](https://cloud.google.com/functions/docs/writing/#the_cloud_functions_runtime), which is why that is what is used for the CI build version.

[build-status-image]: https://img.shields.io/github/workflow/status/CV19Assist/app/Deploy?style=flat-square
[build-status-url]: https://github.com/CV19Assist/app/actions
[climate-image]: https://img.shields.io/codeclimate/github/CV19Assist/app.svg?style=flat-square
[climate-url]: https://codeclimate.com/github/CV19Assist/app
[coverage-image]: https://img.shields.io/codecov/c/github/CV19Assist/app.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/CV19Assist/app
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/CV19Assist/app/blob/master/LICENSE
[code-style-image]: https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat-square
[code-style-url]: http://airbnb.io/javascript/
