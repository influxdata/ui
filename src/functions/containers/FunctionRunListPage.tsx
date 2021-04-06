// Libraries
import React, {FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Button, ComponentColor, Page} from '@influxdata/clockface'
import FunctionRunsList from 'src/functions/components/FunctionRunsList'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'

const FunctionRunListPage: FC = () => {
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)
  const {id: functionID} = useParams<{id: string}>()

  const goToFunctionPage = () => {
    history.push(`/orgs/${orgID}/functions/${functionID}/edit`)
  }

  return (
    <Page titleTag={pageTitleSuffixer(['Function Runs'])}>
      <Page.Header fullWidth={false} testID="functions-runs-page--header">
        <Page.Title title="Function Runs" />
      </Page.Header>
      <Page.ControlBar fullWidth={false}>
        <Page.ControlBarRight>
          <Button
            onClick={goToFunctionPage}
            text="Edit or Trigger This Function"
            color={ComponentColor.Primary}
          />
        </Page.ControlBarRight>
      </Page.ControlBar>
      <Page.Contents fullWidth={false} scrollable={true}>
        <FunctionRunsList />
      </Page.Contents>
    </Page>
  )
}

export default FunctionRunListPage
