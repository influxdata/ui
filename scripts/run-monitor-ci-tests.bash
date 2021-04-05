#!/bin/bash

set -eux -o pipefail

# TODO GET the https://circleci.com/api/v2/project/gh/influxdata/monitor-ci/pipeline API,
# filter for pipelines where SHA == .vcs.revision in the json response.
# Check the workflows for those filtered pipelines to see if any pipelines are fully passing.
# If a fully passing pipeline is found, exit early with success; otherwise, continue.

# start the monitor-ci pipeline
printf "\nstarting monitor-ci pipeline targeting monitor-ci branch ${MONITOR_CI_BRANCH}, UI branch ${UI_BRANCH} and using UI SHA ${SHA}\n"
pipeline=$(curl -s --fail --request POST \
  --url https://circleci.com/api/v2/project/gh/influxdata/monitor-ci/pipeline \
  --header "Circle-Token: ${API_KEY}" \
  --header 'content-type: application/json' \
	--header 'Accept: application/json'    \
  --data "{\"branch\":\"${MONITOR_CI_BRANCH}\", \"parameters\":{ \"ui-sha\":\"${SHA}\", \"ui-branch\":\"${UI_BRANCH}\", \"ui-pull-request\":\"${PULL_REQUEST}\"}}")

if [ $? != 0 ]; then
	echo "failed to start the monitor-ci pipeline, quitting"
	exit 1
fi

pipeline_id=$(echo ${pipeline} | jq  -r '.id')
pipeline_number=$(echo ${pipeline} | jq -r '.number')
# pipeline_id="db41d91c-d21b-4805-9609-31f44b2f4504"
# pipeline_number="30"

printf "\nwaiting for monitor-ci pipeline to begin...\n"
sleep 1m

# poll the status of the monitor-ci pipeline
is_failure=0
attempts=0
max_attempts=40 # minutes
while [ $attempts -le $max_attempts ];
do

	workflows=$(curl -s --request GET \
		--url "https://circleci.com/api/v2/pipeline/${pipeline_id}/workflow" \
		--header "Circle-Token: ${API_KEY}" \
		--header 'content-type: application/json' \
		--header 'Accept: application/json')

	number_running_workflows=$(echo ${workflows} | jq  -r '.items | map(select(.status == "running" or .status == "failing")) | length')

	# when the pipeline has finished
	if [ ${number_running_workflows} -eq 0 ]; then
		workflows_ids=( $(echo ${workflows} | jq -r '.items | .[].id') )

		# report failed jobs per workflow
		for workflow_id in "${workflows_ids[@]}"; do
			workflow_status=$(echo ${workflows} | jq -r --arg id "${workflow_id}" '.items | map(select(.id == $id)) | .[].status')

			if [[ "$workflow_status" == "success" ]]; then
				printf "\SUCCESS: monitor-ci workflow with id ${workflow_id} passed: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id} \n"
			else
				printf "\nFAILURE: monitor-ci workflow with id ${workflow_id} failed: https://app.circleci.com/pipelines/github/influxdata/monitor-ci/${pipeline_number}/workflows/${workflow_id} \n"

				# set job failure
				is_failure=1

				# get the jobs that failed for this workflow
				jobs=$(curl -s --request GET \
					--url "https://circleci.com/api/v2/workflow/${workflow_id}/job" \
					--header "Circle-Token: ${API_KEY}" \
					--header 'content-type: application/json' \
					--header 'Accept: application/json')

				# print the names of the failed jobs
				printf "\nFailed jobs:\n"
				failed_jobs=$(echo ${jobs} | jq '.items | map(select(.status == "failed"))')
				failed_jobs_names=( $(echo ${failed_jobs} | jq -r '.[].name') )
				for name in "${failed_jobs_names[@]}"; do
					printf " - ${name}\n"
				done

				# get the artifacts for each failed job
				printf "\nArtifacts from failed jobs:\n"
				for name in "${failed_jobs_names[@]}"; do
					printf "\n===== ${name} =====\n"
					job_number=$(echo ${failed_jobs} | jq -r --arg name "${name}" 'map(select(.name == $name)) | .[].job_number')
					artifacts=$(curl -s --request GET \
					--url "https://circleci.com/api/v1.1/project/github/influxdata/ui/${job_number}/artifacts" \
						--header "Circle-Token: ${API_KEY}" \
						--header 'content-type: application/json' \
						--header 'Accept: application/json')

					artifacts_length=$(echo ${artifacts} | jq -r 'length')
					if [ ${artifacts_length} -eq 0 ]; then
						printf "\n No artifacts for this failed job.\n"
					else
						artifacts_paths=( $(echo ${artifacts} | jq -r '.[].pretty_path') )
						# print each artifact text and link
						for path in "${artifacts_paths[@]}"; do
							url=$(echo ${artifacts} | jq -r --arg path "${path}" 'map(select(.pretty_path == $path)) | .[].url')
							printf "\n- ${path}\n"
							printf "   - URL: ${url}\n"
						done
					fi
				done
			fi
		done

		exit $is_failure
	fi

	# sleep 1 minute and poll the status again
	attempts=$(($attempts+1))
	remaining_attempts=$(($max_attempts-$attempts))
	printf "\nmonitor-ci pipeline isn't finished yet, waiting another minute... ($remaining_attempts minutes left)\n"
	sleep 1m

done

printf "\nmonitor-ci pipeline did not finish in time, quitting\n"
exit 1