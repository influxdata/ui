#!/bin/bash

# This script is used to create a draft release for a new version of the OSS UI.
#
# It will create a changelog, build the UI assets & add them to a tar, and then
# upload the release as a draft using the changelog as the release notes.
#
# This script should be run from the root of the repository. It requires
# having a GITHUB_TOKEN environment variable set. You also need go, yarn,
# docker, and ghr.
#
# If you have go, you can install ghr by running:
#   GO111MODULE=on go get -u github.com/tcnksm/ghr@v0.13.0

# Cleanup any previous artifacts
rm -rf release && mkdir -p release
yarn clean

# Generate changelog. The current HEAD must be tagged with the desired tag for
# the release. The changelog is generated as all of the commits from the tag
# just prior to this one to the current tag.
current_tag="$(git tag --points-at HEAD)"
previous_tag="$(git tag -l --merged | grep '^OSS-[0-9]*\.[0-9]*\.[0-9]*.*' | sort -V | tail -2 | head -1)"
docker run \
  -v "${PWD}"/:/ui \
  --rm \
  -e GIT_REPO=https://github.com/influxdata/ui \
  quay.io/influxdb/changelogger:0dbf37ba8a912460358d322dcad414b80ce074f2 \
  git-cliff -w ui -t "$current_tag" "$previous_tag".."$current_tag" > release/CHANGELOG.md

# Build the UI and publish the draft release.
yarn install && yarn build
tar -czvf release/build.tar.gz ./build
cd release && shasum -a 256 build.tar.gz > sha256.txt && cd ../
ghr \
  -t "${GITHUB_TOKEN}" \
  -u influxdata \
  -r ui \
  -n "$current_tag" \
  -b "$(cat release/CHANGELOG.md)" \
  -draft \
  "$current_tag" \
  release
