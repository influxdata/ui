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

## Unit Testing

Unit tests can be run via command line with `yarn test`, from within the `/ui` directory. For more detailed reporting, use `yarn test -- --reporters=verbose`.


## Local dev

**cloud platform**
1. From k8s-idpe, start the remocal service with loopback to your local ui changes.
    1. have your remocal instance build and deployed. See [docs here](https://docs.influxdata.io/development/remocal/getting-started/).
    1. `make remocal-dev APPS=ui DETACHED=1`
1. From the ui directory. Build the local dev server:
    1. set env vars for `PUBLIC` (your remocal url)
    1. `yarn install && yarn start:dev:remocal`
    1. `yarn link` different javascript libraries (e.g. giraffe, clockface, flux-lsp) as needed.
        * note that the flux-lsp wasm build produces an output directory which contains a package.json for the release. Make sure to `yarn link` to this directory.

**oss platform**
1. From oss/influxdb repo, start the backend service.
    1. setup service following the [contributing guide](https://github.com/influxdata/influxdb/blob/master/CONTRIBUTING.md#how-to-build-influxdb-from-source).
    1. run the service, goto browser `localhost:8086`
    1. create a login/password. (Remember these!)
    1. **CAVEAT**: influxdb/oss does not have live reload.
        * instead, run `make` and restart influxdb
1. From the ui directory. Build the local dev server:
    1. `yarn install && yarn start:dev:oss`
    1. goto browser `localhost:8080`
    1. the same login/password pair should work.
    1. **CAVEAT**: live reload does not work, so you need to refresh the browser page.

## Cypress Testing

**cloud platform**
1. have your local dev running (see above).
1. `export NS=<your-remocal-namespace>`
1. run cypress test:
    * `yarn test:e2e:remocal` to test on tsm storage
    * `yarn test:e2e:remocal:iox` to test on iox storage

**oss platform**
1. have your local dev running (see above).
    * Make sure to start your oss backend service with `--e2e-testing` flag.
1. run cypress test:
    * `yarn test:e2e:oss`

**Generating Test Reports**
* to run all tests [in series] locally, and generate a report: `yarn test:e2e:<whatever>:report`
    * e.g. `yarn test:e2e:remocal:report`, `yarn test:e2e:remocal:iox:report`, `yarn test:e2e:oss:report`
* this will run in headless mode, so no browser will be shown. Just a stdout waiting as each test runs.
    * **WARNING**: This takes a long time, unlike CI which runs in parallel.
* after all tests complete, it will automatically open a test result viewer.
* any screenshots or vids will be saved in `cypress/videos` and `cypress/screenshots`


## What is oats?
Oats is how we automatically generate our typescript definitions based open the openapi contract. See [here for more details](https://github.com/influxdata/oats). After one of the `yarn generate` scripts are run, the typescript definitions are usually output to `./src/client/`.


## Zuora Form

**Troubleshooting**: If your Zuora form isn't rendering or calling your callback function which you passed in `client.render`.
When running UI locally using [Monitor CI](https://github.com/influxdata/monitor-ci), get Zuora PageID which you are using to render the form. Then, from Zuora admin console, get the `Host` and `Port` that PageID is corresponding to. Make sure to match those `Host` and `Port` with your `INGRESS_HOST` and `PORT_HTTPS` provided in the `.env` file of `monitor-ci`.
