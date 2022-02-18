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
import {patchNotebook} from 'src/client/notebooksRoutes'
import {serialize} from 'src/flows/context/flow.list'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'

const RevertVersionButton: FC = () => {
  const {flow} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)

  const handleRevert = async () => {
    event('revert_notebook_version')
    try {
      const _flow = {id: flow.id, ...serialize(flow)}
      const response = await patchNotebook(_flow)

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      history.push(
        `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${flow.id}`
      )
    } catch (error) {
      console.error({error})
    }
  }

  return (
    <SquareButton
      icon={IconFont.Undo}
      onClick={handleRevert}
      color={ComponentColor.Danger}
      titleText="Revert"
    />
  )
}

export default RevertVersionButton
