import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {Button, ComponentColor, ComponentSize} from '@influxdata/clockface'

import {notify} from 'src/shared/actions/notifications'
import {getResourcesTokensFailure} from 'src/shared/copy/notifications'
import {getAllResources} from 'src/authorizations/actions/thunks'
import {connect, ConnectedProps, useDispatch, useSelector} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {getOrg} from 'src/organizations/selectors'

type ReduxProps = ConnectedProps<typeof connector>

const CreateToken: FC<ReduxProps & RouteComponentProps> = ({
  showOverlay,
  dismissOverlay,
  getAllResources,
}) => {
  const org = useSelector(getOrg)
  const dispatch = useDispatch()
  const handleAllAccess = async () => {
    try {
      await getAllResources()
      showOverlay('add-master-token', null, dismissOverlay)
    } catch (e) {
      dispatch(notify(getResourcesTokensFailure('all access token')))
    }
  }

  return (
    <>
      <h1>Create a Token</h1>
      <p>
        InfluxDB Cloud uses Tokens to authenticate API access. Click below to
        create an all-access token.
      </p>
      <Button
        text="Generate Token"
        onClick={handleAllAccess}
        color={ComponentColor.Primary}
        size={ComponentSize.Medium}
      />
      <p style={{marginTop: '51px'}}>
        Save your token as an environment variable; you’ll use it soon. Run this
        command in your terminal:
      </p>
      <CodeSnippet
        text="export INFLUXDB_TOKEN=<your token here>"
        onCopy={null}
      />
      <p style={{marginTop: '46px'}}>
        You can create tokens in the future in the{' '}
        <a target="_blank" href={`orgs/${org.id}/load-data/tokens`}>
          Token page
        </a>
        .
      </p>
    </>
  )
}

const mdtp = {
  showOverlay,
  dismissOverlay,
  getAllResources,
}

const connector = connect(null, mdtp)

export default connector(withRouter(CreateToken))
