## Packages
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Finfluxdata%2Fui.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Finfluxdata%2Fui?ref=badge_shield)


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


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Finfluxdata%2Fui.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Finfluxdata%2Fui?ref=badge_large)