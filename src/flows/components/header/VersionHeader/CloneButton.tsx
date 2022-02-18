// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import {ComponentColor, SquareButton, IconFont} from '@influxdata/clockface'

// Utility
import {event} from 'src/cloud/utils/reporting'
import {getOrg} from 'src/organizations/selectors'
import {postNotebook} from 'src/client/notebooksRoutes'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {serialize} from 'src/flows/context/flow.list'

const CloneVersionButton: FC = () => {
  const {flow} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)

  const handleClone = async () => {
    event('clone_notebook_version')
    try {
      const _flow = serialize(flow)
      const response = await postNotebook(_flow)

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const clonedId = response.data.id
      history.push(
        `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
      )
    } catch (error) {
      console.error({error})
    }
  }

  if (!flow) {
    return null
  }

  return (
    <SquareButton
      icon={IconFont.Duplicate_New}
      onClick={handleClone}
      color={ComponentColor.Primary}
      titleText="Clone"
    />
  )
}

export default CloneVersionButton
