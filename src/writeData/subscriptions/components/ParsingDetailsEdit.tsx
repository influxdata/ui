// Libraries
import React, {FC} from 'react'

// Components
import {
  Grid,
  Columns,
  SelectGroup,
  ButtonShape,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingDetails.scss'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  className: string
}

const ParsingDetailsEdit: FC<Props> = ({
  currentSubscription,
  updateForm,
  className,
}) => (
  <Grid.Column widthXS={Columns.Twelve}>
    <Heading
      element={HeadingElement.H3}
      weight={FontWeight.Bold}
      className={`${className}-parsing-form__header`}
    >
      Data Format
    </Heading>
    <SelectGroup shape={ButtonShape.StretchToFit} className="retention--radio">
      <SelectGroup.Option
        name="line-protocol"
        id="line-protocol"
        testID={`${className}-parsing-form-line-protocol--button`}
        active={currentSubscription.dataFormat === 'lineprotocol'}
        onClick={() => {
          event(
            'data format toggled',
            {
              from: currentSubscription.dataFormat,
              to: 'lineprotocol',
            },
            {feature: 'subscriptions'}
          )
          updateForm({
            ...currentSubscription,
            dataFormat: 'lineprotocol',
          })
        }}
        value={null}
        titleText="None"
        disabled={false}
      >
        Line Protocol
      </SelectGroup.Option>
      <SelectGroup.Option
        name="json"
        id="json"
        testID={`${className}-parsing-form-json--button`}
        active={currentSubscription.dataFormat === 'json'}
        onClick={() => {
          event(
            'data format toggled',
            {
              from: currentSubscription.dataFormat,
              to: 'json',
            },
            {feature: 'subscriptions'}
          )
          updateForm({
            ...currentSubscription,
            dataFormat: 'json',
          })
        }}
        value={null}
        titleText="None"
        disabled={false}
      >
        JSON
      </SelectGroup.Option>
      <SelectGroup.Option
        name="string"
        id="string"
        testID={`${className}-parsing-form-string--button`}
        active={currentSubscription.dataFormat === 'string'}
        onClick={() => {
          event(
            'data format toggled',
            {
              from: currentSubscription.dataFormat,
              to: 'string',
            },
            {feature: 'subscriptions'}
          )
          updateForm({
            ...currentSubscription,
            dataFormat: 'string',
          })
        }}
        value={null}
        titleText="None"
        disabled={false}
      >
        STRING
      </SelectGroup.Option>
    </SelectGroup>
  </Grid.Column>
)

export default ParsingDetailsEdit
