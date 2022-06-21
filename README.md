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

First, run the command:

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
For the end to end tests to run properly, the server needs to be running in the e2e testing mode with the in-memory data store.
From the influxdb directory:
`$ ./bin/darwin/influxd --assets-path=ui/build --e2e-testing --store=memory`

**monitor-ci**
From the ui directory. Build the javascript with
`$ yarn start`
To run Cypress locally with monitor-ci:
`$ yarn cy:dev`

**k8s-idpe**
From the ui directory. Build the javascript with
`$ yarn start:kind`
To run Cypress locally with k8s-idpe:
`$ yarn test:e2e:kind`

## Starting Dev Server

Running `/ui` locally depends on `monitor-ci` or `k8s-idpe`.

- [Monitor-ci Quickstart](https://github.com/influxdata/monitor-ci#quickstart-for-local-development)
- [Remocal Quickstart](https://docs.influxdata.io/development/remocal/development/#ui-development)

## Zuora Form

**Troubleshooting**: If your Zuora form isn't rendering or calling your callback function which you passed in `client.render`.
When running UI locally using [Monitor CI](https://github.com/influxdata/monitor-ci), get Zuora PageID which you are using to render the form. Then, from Zuora admin console, get the `Host` and `Port` that PageID is corresponding to. Make sure to match those `Host` and `Port` with your `INGRESS_HOST` and `PORT_HTTPS` provided in the `.env` file of `monitor-ci`.
