# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, make sure you have the correct version of [Node.js](https://nodejs.org/) installed. See the [`.nvmrc`](./.nvmrc) file for the version used in this project.

### Supported React Native versions

- The SDK supports React Native **0.76 or higher**, and only the [New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page): the Android old-architecture sources have been removed, and while iOS still contains legacy code paths, they are untested.
- The repository itself is developed and tested against **React Native 0.83.x** (see the `react-native` version in [`example/package.json`](./example/package.json)).
- The example app runs with the New Architecture enabled (`newArchEnabled=true` in `example/android/gradle.properties`, which is also the default and only mode on React Native 0.82+).

Run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development without manually migrating.

Then run the full initialization — it generates the version, CMake and env files and builds the library outputs into `lib/`:

```sh
yarn prepare
```

Re-run it whenever changes in `src/` need to be reflected in the built output. Do not edit files under `lib/` directly; they are generated.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

If you want to use Android Studio or Xcode to edit the native code, you can open the `example/android` or `example/ios` directories respectively in those editors. To edit the Objective-C or Swift files, open `example/ios/ChatSdkExample.xcworkspace` in Xcode and find the source files at `Pods > Development Pods > react-native-chat-sdk`.

To edit the Java or Kotlin files, open `example/android` in Android studio and find the source files at `react-native-chat-sdk` under `Android`.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS (install the pods first):

```sh
(cd example/ios && pod install)
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "ChatSdkExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

To run the example app on Web:

```sh
yarn example web
```

### Validating your changes

Make sure your code passes TypeScript, lint and tests before committing:

- `yarn typecheck` — TypeScript type checking.
- `yarn lint` — lint with [ESLint](https://eslint.org/); `yarn lint --fix` to auto-fix.
- `yarn test` — run all [Jest](https://jestjs.io/) tests. Useful subsets:
  - `yarn test:unit` — unit tests only (`src/__tests__/unit`).
  - `yarn test:contract` — contract tests that keep the TS method names in sync with the native method tables in `modules/java/` and `modules/objc/`.
  - `yarn test:coverage` — run tests with a coverage report.
- `yarn scan:deprecated` — scan for deprecated API usage (`yarn scan:deprecated:android` / `yarn scan:deprecated:ios` per platform).
- `yarn check:circular:dpdm` or `yarn check:circular:madge` — detect circular imports in `src/`.

Remember to add tests for your change if possible. Note that the native wrapper code in `modules/java/` and `modules/objc/` is **not** covered by automated tests — after changing it, manually exercise the affected feature in the example app.


### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

The Git hooks are managed with [lefthook](https://github.com/evilmartians/lefthook); run `yarn hooks:install` once after cloning. Besides commitlint, the pre-commit hook runs ESLint, `tsc` and the unit tests related to your staged files, plus the contract tests when the native method tables change.


### Publishing to npm

We use [release-it](https://github.com/release-it/release-it) to make it easier to publish new versions. It handles common tasks like bumping version based on semver, creating tags and releases etc.

To publish new versions, run the following:

```sh
yarn release
```


### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: install dependencies for all workspaces.
- `yarn prepare`: full initialization — generate version/CMake/env files and build the library.
- `yarn clean`: remove build outputs (`lib/`, `android/build`, example build directories).
- `yarn typecheck`, `yarn lint`, `yarn test*`, `yarn scan:deprecated`, `yarn check:circular:*`: see [Validating your changes](#validating-your-changes).
- `yarn example start` / `android` / `ios` / `web`: run the example app.
- `yarn doc <en|cn> [version]`: generate the HTML API reference with TypeDoc (refreshes the API overview, builds into `docs/build/<lang>`, then strips source locations and stamps the version; `version` defaults to `package.json`). `yarn doc:md`: generate the Markdown API reference.
- `yarn hooks:install`: install the lefthook Git hooks.
- `yarn release`: publish a new version (see [Publishing to npm](#publishing-to-npm)).
  
### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
