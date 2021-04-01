#!/bin/bash

set -eux -o pipefail

# start the monitor-ci pipeline
echo "starting monitor-ci pipeline targeting UI branch ${BRANCH} and using image tag ${TAG}"
pipeline=$(curl -s --request POST \
  --url https://circleci.com/api/v2/project/gh/influxdata/monitor-ci/pipeline \
  --header "Circle-Token: ${API_KEY}" \
  --header 'content-type: application/json' \
	--header 'Accept: application/json'    \
  --data "{\"branch\":\"${BRANCH}\", \"parameters\":{ \"ui-image-tag\":\"${TAG}\"}}")

# TODO: what if starting the pipeline fails?
pipeline_id=$(echo ${pipeline} | jq  -r '.id')
# pipeline_id="61173d1e-a211-4b4c-be1e-85a00d2087c3"

# poll the status of the monitor-ci pipeline
echo "waiting for monitor-ci pipeline..."
attempts=0
max_attempts=10
while [ $attempts -le $max_attempts ];
do

	workflow=$(curl -s --request GET \
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

		# get the jobs that failed
		jobs=$(curl -s --request GET \
			--url "https://circleci.com/api/v2/workflow/${workflow_id}/job" \
			--header "Circle-Token: ${API_KEY}" \
			--header 'content-type: application/json' \
			--header 'Accept: application/json')

		echo "Failed jobs:"
		failed_jobs=$(echo ${jobs} | jq '.items | map(select(.status == "failed"))')
		failed_jobs_names=$(echo ${failed_jobs} | jq -r '.[].name')
		for name in "${failed_jobs_names[@]}"; do
			echo "- ${name}"
		done

		exit 1
	elif [[ "${status}" == "success" ]]; then
		echo "monitor-ci tests PASSED here: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id}"
		exit 0
	fi

	# sleep 1 minute and poll the status again
	attempts=$(($attempts+1))
	remaining_attempts=$(($max_attempts-$attempts))
	echo "monitor-ci pipeline isn't finished yet, waiting another minute... ($remaining_attempts minutes left)"
	sleep 1m

done