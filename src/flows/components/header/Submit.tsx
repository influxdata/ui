// Libraries
import React, {FC, useContext} from 'react'
import {IconFont} from '@influxdata/clockface'

import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import {QueryContext} from 'src/shared/contexts/query'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/flows/components/header/Submit.scss'

const fakeNotify = notify

export const Submit: FC = () => {
  const {cancel} = useContext(QueryContext)
  const {generateMap, queryAll, status} = useContext(FlowQueryContext)

  const hasQueries = generateMap(true).filter(s => !!s.source).length > 0

  const handleSubmit = () => {
    event('Notebook Submit Button Clicked')
    queryAll()
  }

  return (
    <SubmitQueryButton
      className="submit-btn"
      text="Run"
      icon={IconFont.Play}
      submitButtonDisabled={hasQueries === false}
      queryStatus={status}
      onSubmit={handleSubmit}
      onNotify={fakeNotify}
      queryID=""
      cancelAllRunningQueries={cancel}
    />
  )
}

export default Submit
