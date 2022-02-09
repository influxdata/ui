// Libraries
import React, {useMemo, FC, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Actions, Selectors
import {createRule} from 'src/notifications/rules/actions/thunks'
import {getOrg} from 'src/organizations/selectors'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Components
import RuleOverlayContents from 'src/notifications/rules/components/RuleOverlayContents'
import {Overlay} from '@influxdata/clockface'

// Utils
import RuleOverlayProvider from 'src/notifications/rules/components/RuleOverlayProvider'
import {initRuleDraft} from 'src/notifications/rules/utils'

// Types
import {NotificationRuleDraft} from 'src/types'

const NewRuleOverlay: FC = () => {
  const dispatch = useDispatch()
  const {onClose} = useContext(OverlayContext)
  const orgID = useSelector(getOrg)?.id

  const handleCreateRule = async(rule: NotificationRuleDraft) => {
    await dispatch(createRule(rule))
    onClose()
  }

  const initialState = useMemo(() => initRuleDraft(orgID), [orgID])

  return (
    <RuleOverlayProvider initialState={initialState}>
      <Overlay visible={true}>
        <Overlay.Container maxWidth={800}>
          <Overlay.Header
            title="Create a Notification Rule"
            onDismiss={onClose}
            testID="dismiss-overlay"
          />
          <Overlay.Body>
            <RuleOverlayContents
              saveButtonText="Create Notification Rule"
              onSave={handleCreateRule}
            />
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    </RuleOverlayProvider>
  )
}

export default NewRuleOverlay
