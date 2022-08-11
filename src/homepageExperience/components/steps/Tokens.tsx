// Libraries
import React, {FC, useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Actions
import {
  createAuthorization,
  getAllResources,
} from 'src/authorizations/actions/thunks'

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
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
} from '@influxdata/clockface'

type OwnProps = {
  wizardEventName: string
  setTokenValue: (tokenValue: string) => void
  tokenValue: string
}

const collator = new Intl.Collator(navigator.language || 'en-US')

export const Tokens: FC<OwnProps> = ({
  wizardEventName,
  setTokenValue,
  tokenValue,
}) => {
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
    dispatch(getAllResources())
  }, [dispatch])

  useEffect(() => {
    if (sortedPermissionTypes.length && tokenValue === null) {
      const authorization: Authorization = {
        orgID: org.id,
        description: `onboarding-${wizardEventName}-token-${Date.now()}`,
        permissions: allAccessPermissions(sortedPermissionTypes, org.id, me.id),
      }

      dispatch(createAuthorization(authorization))
      event(`firstMile.${wizardEventName}.tokens.tokenCreated`)
    }
  }, [
    dispatch,
    me.id,
    org.id,
    sortedPermissionTypes,
    tokenValue,
    wizardEventName,
  ])

  // when token generated, save it to the parent component
  useEffect(() => {
    if (currentAuth.token) {
      setTokenValue(currentAuth.token)
    }
  }, [currentAuth.token, setTokenValue])

  // when tokenValue in the parent component is not null, set text box value to tokenValue
  useEffect(() => {
    if (tokenValue !== null) {
      setTokenTextboxText(`export INFLUXDB_TOKEN=${tokenValue}`)
    }
  }, [tokenValue])

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.${wizardEventName}.tokens.code.copied`)
  }

  const logDocsOpened = () => {
    event(`firstMile.${wizardEventName}.tokens.docs.opened`)
  }

  return (
    <>
      <h1>Tokens</h1>
      <p>
        InfluxDB Cloud uses Tokens to authenticate API access. We've created an
        all-access token for you for this set up process.
      </p>
      <p style={{marginTop: '51px'}}>
        Run this command in your terminal to save your token as an environment
        variable:
      </p>
      <CodeSnippet
        text={tokenTextboxText}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <FlexBox margin={ComponentSize.Large} alignItems={AlignItems.Center}>
        <Icon glyph={IconFont.Info_New} style={{fontSize: '30px'}} />
        <p>
          Creating an all-access token is not the best security practice! We
          recommend you delete this token in the{' '}
          <SafeBlankLink
            href={`orgs/${org.id}/load-data/tokens`}
            onClick={logDocsOpened}
          >
            Tokens page
          </SafeBlankLink>{' '}
          after setting up, and create your own token with a specific set of
          permissions later.
        </p>
      </FlexBox>
    </>
  )
}
