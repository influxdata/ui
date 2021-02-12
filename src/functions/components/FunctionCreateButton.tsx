// Libraries
import React from 'react'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {Button, IconFont, ComponentColor} from '@influxdata/clockface'

const FunctionCreateButton = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()

  const handleCreate = async () => {
    // const id = await add()
    console.log('add')
    history.push(`/orgs/${orgID}/functions/new`)
  }

  return (
    <Button
      icon={IconFont.Plus}
      color={ComponentColor.Primary}
      text={`Create function`}
      titleText={`Click to create a function`}
      onClick={handleCreate}
      testID="create-function--button"
    />
  )
}

export default FunctionCreateButton
