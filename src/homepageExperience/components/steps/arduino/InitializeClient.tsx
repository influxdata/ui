// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'
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

// Thunks
import {getBuckets} from 'src/buckets/actions/thunks'

// Helper Components
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

// Types
import {AppState, Authorization} from 'src/types'

// Styles
import './ArduinoSteps.scss'

type OwnProps = {
  setTokenValue: (tokenValue: string) => void
  tokenValue: string
  onSelectBucket: (bucketName: string) => void
}

const collator = new Intl.Collator(navigator.language || 'en-US')

export const InitializeClient: FC<OwnProps> = ({
  setTokenValue,
  tokenValue,
  onSelectBucket,
}) => {
  const org = useSelector(getOrg)
  const me = useSelector(getMe)
  const allPermissionTypes = useSelector(getAllTokensResources)
  const dispatch = useDispatch()

  const currentAuth = useSelector((state: AppState) => {
    return state.resources.tokens.currentAuth.item
  })

  const sortedPermissionTypes = useMemo(
    () => allPermissionTypes.sort((a, b) => collator.compare(a, b)),
    [allPermissionTypes]
  )
  const {bucket} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    dispatch(getBuckets())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onSelectBucket(bucket.name)
  }, [bucket, onSelectBucket])

  useEffect(() => {
    const fetchResources = async () => {
      await dispatch(getAllResources())
    }
    fetchResources()
  }, [])

  useEffect(() => {
    if (sortedPermissionTypes.length && tokenValue === null) {
      const authorization: Authorization = {
        orgID: org.id,
        description: `onboarding-arduinoWizard-token-${Date.now()}`,
        permissions: allAccessPermissions(sortedPermissionTypes, org.id, me.id),
      }

      dispatch(createAuthorization(authorization))
      event(`firstMile.arduinoWizard.tokens.tokenCreated`)
    }
  }, [sortedPermissionTypes.length])

  // when token generated, save it to the parent component
  useEffect(() => {
    if (currentAuth.token) {
      setTokenValue(currentAuth.token)
    }
  }, [currentAuth.token])

  useEffect(() => {
    const fireKeyboardCopyEvent = event => {
      if (
        keyboardCopyTriggered(event) &&
        (userSelection().includes('influx config create') ||
          userSelection().includes('influx bucket create'))
      ) {
        logCopyCodeSnippet()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.arduinoWizard.buckets.code.copied`)
  }

  return (
    <>
      <h1>Initialize Client</h1>
    </>
  )
}
