// Libraries
import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {Button, ComponentColor, ComponentSize} from '@influxdata/clockface'
import {connect, ConnectedProps, useDispatch, useSelector} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'

// Selectors
import {notify} from 'src/shared/actions/notifications'
import {getResourcesTokensFailure} from 'src/shared/copy/notifications'
import {getAllResources} from 'src/authorizations/actions/thunks'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {getOrg} from 'src/organizations/selectors'

// Helper Components
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'

type ReduxProps = ConnectedProps<typeof connector>

const CreateTokenComponent: FC<ReduxProps & RouteComponentProps> = ({
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
    } catch {
      dispatch(notify(getResourcesTokensFailure('all access token')))
    }
  }

  const logCopyCodeSnippet = () => {
    event('firstMile.pythonWizard.createToken.code.copied')
  }

  const logDocsOpened = () => {
    event('firstMile.pythonWizard.createToken.docs.opened')
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
        onCopy={logCopyCodeSnippet}
      />
      <p style={{marginTop: '46px'}}>
        You can create tokens in the future in the{' '}
        <SafeBlankLink
          href={`orgs/${org.id}/load-data/tokens`}
          onClick={logDocsOpened}
        >
          Token page
        </SafeBlankLink>
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
export const CreateToken = connector(withRouter(CreateTokenComponent))
