// Libraries
import React, {useContext} from 'react'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {Button, IconFont, ComponentColor} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

const FlowCreateButton = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()
  const {add} = useContext(FlowListContext)

  const handleCreate = async () => {
    event('create_notebook')
    const id = await add()
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
  }

  return (
    <Button
      icon={IconFont.Plus}
      color={ComponentColor.Primary}
      text={`Create ${PROJECT_NAME}`}
      titleText={`Click to create a ${PROJECT_NAME}`}
      onClick={handleCreate}
      testID="create-flow--button"
    />
  )
}

export default FlowCreateButton
