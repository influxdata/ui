#!/bin/bash

# This script is used to re-create the release for the pre-built UI assets
# for the OSS Master release. It will build the UI assets, add them to a tar,
# and upload them to the release, deleting the previous release of the same name
# in the process.
#
# This script should be run from the root of the repository. It requires
# having a GITHUB_TOKEN environment variable set. You also need go, yarn and ghr.
#
# If you have go, you can install ghr by running:
#   GO111MODULE=on go get -u github.com/tcnksm/ghr@v0.13.0

yarn install && yarn build
mkdir -p release
tar -czvf release/build.tar.gz ./build
cd release && shasum -a 256 build.tar.gz >> sha256.txt && cd ../
ghr \
  -t ${GITHUB_TOKEN} \
  -u influxdata \
  -r ui \
  -n "OSS Master UI" \
  -b "Pre-built UI assets for the OSS Master Branch." \
  -recreate \
  OSS-Master \
  release
