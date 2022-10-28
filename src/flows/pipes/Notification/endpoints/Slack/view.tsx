import React, {FC, useContext} from 'react'
import {
  ColorPreview,
  CreatableTypeAheadDropdown,
  FlexBox,
  Form,
  Input,
  InputType,
  ComponentSize,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

/** The hex colors are suggested from here
 *  https://github.com/influxdata/ui/issues/2572
 */
const suggestedColors = ['#DC4E58', '#FFB94A', '#2FA74D', '#0098F0', '#8E1FC3']

export const Slack: FC<EndpointProps> = () => {
  const {data, update} = useContext(PipeContext)

  const updateUrl = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateChannel = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        channel: evt.target.value,
      },
    })
  }

  const updateColor = hex => {
    update({
      endpointData: {
        ...data.endpointData,
        color: hex,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="Incoming Webhook URL" required={true}>
        <Input
          name="url"
          testID="input--url"
          type={InputType.Text}
          placeholder="ex: https://hooks.slack.com/services/X/X/X"
          value={data.endpointData.url}
          onChange={updateUrl}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Slack Channel" required={true}>
        <Input
          name="channel"
          testID="input--channel"
          type={InputType.Text}
          value={data.endpointData.channel}
          onChange={updateChannel}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Message Color">
        <CreatableTypeAheadDropdown
          selectedOption={data.endpointData.color}
          onSelect={updateColor}
          options={suggestedColors}
          placeholder="#000000"
          inputColorPreviewOn={true}
          customizedDropdownItem={displayText => (
            <FlexBox>
              <ColorPreview color={displayText} />
              <div className="slack-message-color--dropdown-item">
                {displayText}
              </div>
            </FlexBox>
          )}
        />
      </Form.Element>
    </div>
  )
}
