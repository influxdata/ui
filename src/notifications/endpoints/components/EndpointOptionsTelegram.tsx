// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {
  Input,
  InputType,
  FormElement,
  Panel,
  Grid,
  Columns,
} from '@influxdata/clockface'

interface Props {
  token: string
  channel: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const EndpointOptionsTelegram: FC<Props> = ({token, channel, onChange}) => {
  return (
    <Panel>
      <Panel.Header>
        <h4>Telegram Options</h4>
      </Panel.Header>
      <Panel.Body>
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve}>
              <FormElement label="Bot Token">
                <Input
                  name="token"
                  value={token}
                  testID="token"
                  onChange={onChange}
                  type={InputType.Password}
                />
              </FormElement>
              <FormElement label="Chat ID">
                <Input
                  name="channel"
                  value={channel}
                  testID="channel"
                  onChange={onChange}
                  type={InputType.Text}
                />
              </FormElement>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Panel.Body>
    </Panel>
  )
}

export default EndpointOptionsTelegram
