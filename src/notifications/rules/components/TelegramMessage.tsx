// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {Form, TextArea} from '@influxdata/clockface'
import {TelegramNotificationRuleBase} from 'src/types/alerting'

interface EventHandlers {
  onChange: (e: ChangeEvent) => void
}
type Props = Omit<TelegramNotificationRuleBase, 'type'> & EventHandlers

const TelegramMessage: FC<Props> = ({messageTemplate, onChange}) => {
  return (
    <Form.Element label="Message Template">
      <TextArea
        name="messageTemplate"
        testID="slack-message-template--textarea"
        value={messageTemplate}
        onChange={onChange}
        rows={3}
      />
    </Form.Element>
    /*
      // keep it simple, the following elements are possible, but too advanced
      <Form.Element label="Parse Mode">
        <Input value={parseMode} name="parseMode" onChange={onChange} />
      </Form.Element>
      <Form.Element label="">
        <Input
          value={String(!disableWebPagePreview)}
          name="disableWebPagePreview"
          onChange={onChange}
          type={InputType.Checkbox}
        />
      </Form.Element> 
    */
  )
}

export default TelegramMessage
