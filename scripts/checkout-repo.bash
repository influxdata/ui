#!/bin/bash

# script for CI tools to clone influxdata repo alongside ui directory

set -eu -o pipefail

if [ -d "./${REPO}" ] ; then
  # if repo directory already exists, pull latest version
  cd ${REPO}
  git pull
  git co ${BRANCH}
else
  # if it does not exist, do a shallow clone to speed up the process
  git clone --depth 3 git@github.com:influxdata/${REPO}.git --branch ${BRANCH}
  cd ${REPO}
fi

echo "${REPO} checked out:"
git --no-pager log -1 # Without --no-pager, this fails on CircleCI, with: "WARNING: terminal is not fully functional"
