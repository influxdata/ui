## Packages

### Adding new packages

To add a new package, run

```sh
yarn add packageName
```

### Adding devDependency

```sh
yarn add packageName --dev
```

### Updating a package

First, run the command

```sh
yarn outdated
```

... to determine which packages may need upgrading.

We _really_ should not upgrade all packages at once, but, one at a time and make darn sure
to test.

To upgrade a single package named `packageName`:

```sh
yarn upgrade packageName
```

## Testing

Tests can be run via command line with `yarn test`, from within the `/ui` directory. For more detailed reporting, use `yarn test -- --reporters=verbose`.


## Cypress Testing

e2e tests:
For the end to end tests to run properly, the server needs to be running in the e2e testing mode with the in memory data store.
From the influxdb directory
`$ ./bin/darwin/influxd --assets-path=ui/build --e2e-testing --store=memory`

From the ui directory. Build the javascript with
`$ yarn start`
 To run Cypress locally
`$ yarn cy:dev`

## Starting Dev Server

Running `/ui` locally depends on `monitor-ci`. [See the monitor-ci Quickstart](https://github.com/influxdata/monitor-ci#quickstart-for-local-development)


## Running Lighthouse Report Locally
```
## Usage:
# --username <USERNAME> : Username to login to your local UI
# --password <PASSWORD> : Password to login to your local UI
# --host <HOSTNAME> : Hostname where your UI is accessible. i.e. kubernetes.docker.internal
# --port <PORT> : Port on which your UI is accessible. i.e. 8080 or 8448. Take a look at .env or env.testing files
# --pr <PULL_REQUEST_URL> : UI repo's pull request url
# --token <GITHUB_TOKEN> : Github token which rights to write PR comments

node lighthouse/login.js --username <USERNAME> --password <PASSWORD> --port <PORT> --host <HOSTNAME> --pr <PULL_REQUEST_URL> --token <GITHUB_TOKEN>
```
