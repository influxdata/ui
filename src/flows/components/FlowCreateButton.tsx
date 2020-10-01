// Libraries
import React, {useContext} from 'react'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {Button, IconFont, ComponentColor} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'

const FlowCreateButton = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()
  const {add} = useContext(FlowListContext)

  const handleCreate = async () => {
    const id = await add()
    history.push(`/orgs/${orgID}/flows/${id}`)
  }

  return (
    <Button
      icon={IconFont.Plus}
      color={ComponentColor.Primary}
      text="Create Flow"
      titleText="Click to create a Flow"
      onClick={handleCreate}
      testID="create-flow--button"
    />
  )
}

export default FlowCreateButton
