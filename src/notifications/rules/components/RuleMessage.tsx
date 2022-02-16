// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Form,
  Panel,
  Grid,
  Columns,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'
import RuleEndpointDropdown from 'src/notifications/rules/components/RuleEndpointDropdown'
import RuleMessageContents from 'src/notifications/rules/components/RuleMessageContents'

// Utils
import {getRuleVariantDefaults} from 'src/notifications/rules/utils'
import {getAllActiveEndpoints} from 'src/notifications/endpoints/selectors'
import {useRuleDispatch} from './RuleOverlayProvider'

// Types
import {NotificationRuleDraft} from 'src/types'

interface Props {
  rule: NotificationRuleDraft
}

const RuleMessage: FC<Props> = ({rule}) => {
  const dispatch = useRuleDispatch()
  const endpoints = useSelector(getAllActiveEndpoints)

  const onSelectEndpoint = endpointID => {
    dispatch({
      type: 'UPDATE_RULE',
      rule: {
        ...rule,
        ...getRuleVariantDefaults(endpoints, endpointID),
        endpointID,
      },
    })
  }

  useEffect(() => {
    if (!rule.endpointID && endpoints.length) {
      onSelectEndpoint(endpoints[0].id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid.Row>
      <Grid.Column widthSM={Columns.Two}>
        <Heading element={HeadingElement.H4}> Message</Heading>
      </Grid.Column>
      <Grid.Column widthSM={Columns.Ten}>
        <Panel>
          <Panel.Body>
            <Form.Element label="Notification Endpoint">
              <RuleEndpointDropdown
                endpoints={endpoints}
                onSelectEndpoint={onSelectEndpoint}
                selectedEndpointID={rule.endpointID}
              />
            </Form.Element>
            <RuleMessageContents rule={rule} />
          </Panel.Body>
        </Panel>
      </Grid.Column>
    </Grid.Row>
  )
}

export default RuleMessage
