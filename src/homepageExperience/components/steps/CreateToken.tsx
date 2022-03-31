// Libraries
import React, {useEffect, useMemo, useState, FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Actions
import {getAllResources} from 'src/authorizations/actions/thunks'
import {createAuthorization} from 'src/authorizations/actions/thunks'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'
import {getAllTokensResources} from 'src/resources/selectors'

// Helper Components
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'

// Types
import {AppState, Authorization} from 'src/types'

type OwnProps = {
  wizardEventName: string
}

const collator = new Intl.Collator(navigator.language || 'en-US')

export const CreateToken: FC<OwnProps> = ({wizardEventName}) => {
  const org = useSelector(getOrg)
  const me = useSelector(getMe)
  const allPermissionTypes = useSelector(getAllTokensResources)
  const dispatch = useDispatch()
  const [tokenTextboxText, setTokenTextboxText] = useState(
    'Generating your token'
  )

  const currentAuth = useSelector((state: AppState) => {
    return state.resources.tokens.currentAuth.item
  })

  const sortedPermissionTypes = useMemo(
    () => allPermissionTypes.sort((a, b) => collator.compare(a, b)),
    [allPermissionTypes]
  )

  useEffect(() => {
    const fetchResources = async () => {
      await dispatch(getAllResources())
    }
    fetchResources()
  }, [])

  useEffect(() => {
    if (sortedPermissionTypes.length) {
      const authorization: Authorization = {
        orgID: org.id,
        description: `onboarding-${wizardEventName}-token-${Date.now()}`,
        permissions: allAccessPermissions(sortedPermissionTypes, org.id, me.id),
      }

      dispatch(createAuthorization(authorization))
      event(`firstMile.${wizardEventName}.createToken.tokenCreated`)
    }
  }, [sortedPermissionTypes.length])

  useEffect(() => {
    if (currentAuth.token) {
      setTokenTextboxText(`export INFLUXDB_TOKEN=${currentAuth.token}`)
    }
  }, [currentAuth.token])

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.${wizardEventName}.createToken.code.copied`)
  }

  const logDocsOpened = () => {
    event(`firstMile.${wizardEventName}.createToken.docs.opened`)
  }

  return (
    <>
      <h1 data-testID="tokens-page-header">Create a Token</h1>
      <p>
        InfluxDB Cloud uses Tokens to authenticate API access. We've generated
        an all-access token for you.
      </p>
      <p style={{marginTop: '51px'}}>
        Save your token as an environment variable; you’ll use it soon. Run this
        command in your terminal:
      </p>
      <CodeSnippet text={tokenTextboxText} onCopy={logCopyCodeSnippet} />
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
