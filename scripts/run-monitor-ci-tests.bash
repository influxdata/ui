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
pipeline_number=$(echo ${pipeline} | jq -r '.number')
# pipeline_id="db41d91c-d21b-4805-9609-31f44b2f4504"
# pipeline_number="30"

# poll the status of the monitor-ci pipeline
echo "waiting for monitor-ci pipeline..."
is_failure=0
attempts=0
max_attempts=10
while [ $attempts -le $max_attempts ];
do

	workflows=$(curl -s --request GET \
		--url "https://circleci.com/api/v2/pipeline/${pipeline_id}/workflow" \
		--header "Circle-Token: ${API_KEY}" \
		--header 'content-type: application/json' \
		--header 'Accept: application/json')

	number_running_workflows=$(echo ${workflows} | jq  -r '.items | map(select(.status == "running")) | length')

	# when the pipeline has finished
	if [ ${number_running_workflows} -eq 0 ]; then
		workflows_ids=( $(echo ${workflows} | jq -r '.items | .[].id') )

		# report failed jobs per workflow
		for workflow_id in "${workflows_ids[@]}"; do
			workflow_status=$(echo ${workflows} | jq -r --arg id "${workflow_id}" '.items | map(select(.id == $id)) | .[].status')

			if [[ "$workflow_status" == "success" ]]; then
				echo "PASSED: monitor-ci workflow with id ${workflow_id} passed: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id}"
			else
				echo "FAILURE: monitor-ci workflow with id ${workflow_id} failed: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id}"

				# set job failure
				is_failure=1

				# get the jobs that failed for this workflow
				jobs=$(curl -s --request GET \
					--url "https://circleci.com/api/v2/workflow/${workflow_id}/job" \
					--header "Circle-Token: ${API_KEY}" \
					--header 'content-type: application/json' \
					--header 'Accept: application/json')

				echo "Failed jobs:"
				failed_jobs=$(echo ${jobs} | jq '.items | map(select(.status == "failed"))')
				failed_jobs_names=( $(echo ${failed_jobs} | jq -r '.[].name') )
				for name in "${failed_jobs_names[@]}"; do
					echo "- ${name}"
				done
			fi
		done

		exit $is_failure
	fi

	# sleep 1 minute and poll the status again
	attempts=$(($attempts+1))
	remaining_attempts=$(($max_attempts-$attempts))
	echo "monitor-ci pipeline isn't finished yet, waiting another minute... ($remaining_attempts minutes left)"
	sleep 1m

done

echo "monitor-ci pipeline did not finish in time, quitting"
exit 1