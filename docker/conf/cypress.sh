#! /bin/bash

set +e
set -o pipefail

cd /repo && \
yarn cypress run --browser chrome --spec $1 --reporter junit --reporter-options 'mochaFile=junit-results/test-output-[hash].xml'
retVal=$?

exit $retVal
