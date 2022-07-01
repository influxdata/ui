// Libraries
import React, {FC, useState} from 'react'

// Components
import {Grid, Form, Dropdown, ComponentStatus} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/writeData/subscriptions/components/LineProtocolForm.scss'

interface Props {
  formContent: Subscription
  edit: boolean
}

const LineProtocolForm: FC<Props> = ({formContent, edit}) => {
  const microsecondsType = 'MS'
  const secondsType = 'S'
  const microseconds2Type = 'US'
  const nanosecondsType = 'NS'
  const precisionList = [
    nanosecondsType,
    microsecondsType,
    secondsType,
    microseconds2Type,
  ]
  const [precision, setPrecision] = useState(nanosecondsType)
  return (
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
                status={
                  edit ? ComponentStatus.Default : ComponentStatus.Disabled
                }
              >
                {formContent.timestampPrecision}
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu onCollapse={onCollapse}>
                {precisionList.map((p, key) => (
                  <Dropdown.Item
                    key={key}
                    id={p}
                    value={p}
                    onClick={() => {
                      event(
                        'completed form field',
                        {formField: 'timestampPrecision', selected: p},
                        {feature: 'subscriptions'}
                      )
                      setPrecision(p)
                      formContent.timestampPrecision = p
                    }}
                    selected={precision === p}
                    testID={`lp-timestamp-precision-${key}`}
                  >
                    {p}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            )}
          />
        </div>
      </Grid.Column>
    </div>
  )
}

export default LineProtocolForm
