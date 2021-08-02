import React, {FC, useState} from 'react'

// Components
import {
  Accordion,
  Overlay,
  Form,
  Input,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
} from '@influxdata/clockface'

import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'
import TelegrafAccordion from './TelegrafAccordion'

interface OwnProps {
  onClose: () => void
}

export const CustomApiTokenOverlay: FC<OwnProps> = props => {
  const resources = ['telegrafs', 'buckets']
  const handleDismiss = () => {
    props.onClose()
  }
  const [description, setDescription] = useState('')

  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Generate a Personal Api Token"
        onDismiss={handleDismiss}
      />
      <Overlay.Body>
        <Form>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
            <Form.Element label="Description">
              <Input
                placeholder="Describe this new token"
                value={description}
                onChange={handleInputChange}
                testID="custom-api-token-input"
              />
            </Form.Element>
            <Form.Element label="Permissions">
              <Accordion>
                <Accordion.AccordionHeader>
                  TelegrafConfiguration
                </Accordion.AccordionHeader>
                <GetResources resources={[ResourceType.Telegrafs]}>
                  <TelegrafAccordion />
                </GetResources>
              </Accordion>
              <Accordion>
                <Accordion.AccordionHeader>Buckets</Accordion.AccordionHeader>
                <Accordion.AccordionBodyItem>
                  TELE 1
                </Accordion.AccordionBodyItem>
                <Accordion.AccordionBodyItem>
                  TELE 2
                </Accordion.AccordionBodyItem>
              </Accordion>
            </Form.Element>
          </FlexBox>
        </Form>
      </Overlay.Body>
    </Overlay.Container>
  )
}
