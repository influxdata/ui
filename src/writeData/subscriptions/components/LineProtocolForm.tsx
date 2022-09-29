// Libraries
import React, {FC} from 'react'

// Components
import {Grid, Form, Dropdown, ComponentStatus} from '@influxdata/clockface'

// Types
import {Subscription, PrecisionTypes} from 'src/types/subscriptions'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/writeData/subscriptions/components/LineProtocolForm.scss'

interface Props {
  formContent: Subscription
  edit: boolean
}

const LineProtocolForm: FC<Props> = ({formContent, edit}) => (
  <div className="line-protocol-form">
    <Grid.Column>
      <div className="line-protocol-form__container">
        <Form.Label label="Timestamp precision" />
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="lp-timestamp-precision"
              status={edit ? ComponentStatus.Default : ComponentStatus.Disabled}
            >
              {Object.keys(PrecisionTypes).find(
                k => PrecisionTypes[k] === formContent.timestampPrecision
              )}{' '}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {Object.keys(PrecisionTypes).map(key => (
                <Dropdown.Item
                  key={key}
                  id={key}
                  value={key}
                  onClick={() => {
                    event(
                      'completed form field',
                      {
                        formField: 'timestampPrecision',
                        selected: PrecisionTypes[key],
                      },
                      {feature: 'subscriptions'}
                    )
                    formContent.timestampPrecision = PrecisionTypes[key]
                  }}
                  selected={
                    formContent.timestampPrecision === PrecisionTypes[key]
                  }
                  testID={`json-timestamp-precision-${key}`}
                >
                  {key}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </div>
    </Grid.Column>
  </div>
)

export default LineProtocolForm
