#! /bin/bash

echo "Starting with DEV_MODE_CLOCKFACE=${1} DEV_MODE_GIRAFFE=${2}"

if [[ "$1" -eq 1 ]]; then
    echo "Linking clockface..."
    pushd /clockface
    yarn link
    popd
    yarn link @influxdata/clockface
fi

if [[ "$2" -eq 1 ]]; then
    echo "Linking giraffe..."
    pushd /giraffe/giraffe
    yarn link
    popd
    yarn link @influxdata/giraffe
fi

echo "Starting UI"
yarn start:docker