#!/bin/bash

set -eu -o pipefail

echo "{\"branch\":\"${BRANCH}\", \"parameters\":{ \"ui-image-tag\":\"${TAG}\"}}"

curl --request POST \
  --url https://circleci.com/api/v2/project/gh/influxdata/monitor-ci/pipeline \
  --header "Circle-Token: ${API_KEY}" \
  --header 'content-type: application/json' \
	--header 'Accept: application/json'    \
  --data "{\"branch\":\"${BRANCH}\", \"parameters\":{ \"ui-image-tag\":\"${TAG}\"}}"

	exit $?