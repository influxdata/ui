// Libraries
import React, {FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'

// Constants
import {getNotificationRuleFailed} from 'src/shared/copy/notifications'

// Components
import {Overlay} from '@influxdata/clockface'
import RuleOverlayContents from 'src/notifications/rules/components/RuleOverlayContents'

// Actions
import {updateRule} from 'src/notifications/rules/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// Utils
import RuleOverlayProvider from './RuleOverlayProvider'
import {getByID} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

// Types
import {NotificationRuleDraft, AppState, ResourceType} from 'src/types'

const EditRuleOverlay: FC = () => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const {ruleID} = useParams()
  const dispatch = useDispatch()
  const stateRule = useSelector((state: AppState) =>
    getByID<NotificationRuleDraft>(
      state,
      ResourceType.NotificationRules,
      ruleID
    )
  )

  const handleDismiss = () => {
    history.push(`/orgs/${org.id}/alerting`)
  }

  if (!stateRule) {
    dispatch(notify(getNotificationRuleFailed(ruleID)))
    handleDismiss()
    return null
  }

  const handleUpdateRule = async (rule: NotificationRuleDraft) => {
    await dispatch(updateRule(rule))
    handleDismiss()
  }

  return (
    <RuleOverlayProvider initialState={stateRule}>
      <Overlay visible={true}>
        <Overlay.Container maxWidth={800}>
          <Overlay.Header
            title="Edit this Notification Rule"
            onDismiss={handleDismiss}
            testID="dismiss-overlay"
          />
          <Overlay.Body>
            <RuleOverlayContents
              saveButtonText="Save Changes"
              onSave={handleUpdateRule}
            />
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    </RuleOverlayProvider>
  )
}

export default EditRuleOverlay
