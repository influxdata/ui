#!/bin/bash

set -eux -o pipefail

echo "{\"branch\":\"${BRANCH}\", \"parameters\":{ \"ui-image-tag\":\"${TAG}\"}}"

# start the monitor-ci pipeline
pipeline=$(curl --request POST \
  --url https://circleci.com/api/v2/project/gh/influxdata/monitor-ci/pipeline \
  --header "Circle-Token: ${API_KEY}" \
  --header 'content-type: application/json' \
	--header 'Accept: application/json'    \
  --data "{\"branch\":\"${BRANCH}\", \"parameters\":{ \"ui-image-tag\":\"${TAG}\"}}")

# TODO: what if starting the pipeline fails?
pipeline_id=$(echo ${pipeline} | jq  -r '.id')

# poll the status of the monitor-ci pipeline
attempts=0
while [ $attempts -le 10 ];
do

	workflow=$(curl --request GET \
		--url "https://circleci.com/api/v2/pipeline/${pipeline_id}/workflow" \
		--header "Circle-Token: ${API_KEY}" \
		--header 'content-type: application/json' \
		--header 'Accept: application/json')

	# TODO: what if there are multiple workflows?
	status=$(echo ${workflow} | jq  -r '.items | .[].status')
	pipeline_number=$(echo ${workflow} | jq  -r '.items | .[].pipeline_number')
	workflow_id=$(echo ${workflow} | jq  -r '.items | .[].id')

	if [[ "${status}" == "failed" ]]; then
		echo "monitor-ci tests FAILED here: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id}"
		exit 1
	elif [[ "${status}" == "success" ]]; then
		echo "monitor-ci tests PASSED here: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id}"
		exit 0
	fi

	# sleep 1 minute and poll the status again
	attempts=$(($attempts+1))
	sleep 1m

done