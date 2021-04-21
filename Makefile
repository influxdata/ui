include ./.env
export $(shell sed 's/=.*//' ./.env)

UI_GIT_SHA = $(shell git log -1 --pretty=format:"%H")

start:
	# creates the image
	# creates the container
	# runs that container
	docker build -t local/chronograf:latest -f docker/Dockerfile.chronograf .
	docker run -p ${PORT}:${PORT} \
		-v ${PWD}/src:/repo/src:delegated \
		-v ${PWD}/cypress:/repo/cypress:delegated \
		-v ${PWD}/mocks:/repo/mocks:delegated \
		-v ${PWD}/assets:/repo/assets:delegated \
		-v ${PWD}/static:/repo/build:delegated -d \
		-e PORT=${PORT} \
		-e PUBLIC=https://twodotoh.a.influxcloud.dev.local/ \
		-e CLOUD_URL=/auth \
		--name slowmograf local/chronograf:latest
stop:
	# stop the running slowmograf node
	docker rm -f slowmograf

restart:
	# restarts the cluster or services
	$(MAKE) stop
	$(MAKE) start

build:
	# for forcing a rebuild of a node
	docker build -t local/chronograf:latest -f docker/Dockerfile.chronograf.prod .

####### EVERYTHING UNDER THIS LINE IS APPLICATION SPECIFIC
.PHONY: test build

# running `make pretty` will run prettier on your frontend code
pretty:
	docker run slowmograf \
		-v ${PWD}/src:/repo/src:delegated \
		-v ${PWD}/cypress:/repo/cypress:delegated \
		-v ${PWD}/mocks:/repo/mocks:delegated \
		-v ${PWD}/assets:/repo/assets:delegated \
		-v ${PWD}/static:/repo/build:delegated -d \
		npx prettier --config .prettierrc.json --write '{src,cypress}/**/*.{ts,tsx,scss}'

# running `make test` will run the unit tests in watch mode
test:
	docker run slowmograf \
		-v ${PWD}/src:/repo/src:delegated \
		-v ${PWD}/cypress:/repo/cypress:delegated \
		-v ${PWD}/mocks:/repo/mocks:delegated \
		-v ${PWD}/assets:/repo/assets:delegated \
		-v ${PWD}/static:/repo/build:delegated -d \
		yarn test --watchAll

build-ui-e2e-image:
	docker -t quay.io/influxdb/ui-e2e:$(UI_GIT_SHA) build -f docker/Dockerfile.cypress .

publish-ui-e2e-image:
	docker push quay.io/influxdb/ui-e2e:$(UI_GIT_SHA)
