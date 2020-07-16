#! /bin/bash

cd /repo && \
yarn cypress run --browser chrome --spec "$(circleci tests glob "./cypress/e2e/**/*.test.ts" | circleci tests split --split-by=timings | paste -sd "," -)" --reporter junit --reporter-options 'mochaFile=junit-results/test-output-[hash].xml'
retVal=$?

cp -r /repo/junit-results /test-artifacts

exit $retVal
