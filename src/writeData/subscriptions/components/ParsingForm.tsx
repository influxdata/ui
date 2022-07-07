// Libraries
import React, {FC} from 'react'

// Components
import {
  Grid,
  Form,
  Overlay,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'
import ParsingDetailsEdit from 'src/writeData/subscriptions/components/ParsingDetailsEdit'
import StringParsingForm from 'src/writeData/subscriptions/components/StringParsingForm'
import JsonParsingForm from 'src/writeData/subscriptions/components/JsonParsingForm'
import LineProtocolForm from 'src/writeData/subscriptions/components/LineProtocolForm'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingForm.scss'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  onFocus?: (any) => void
}

const ParsingForm: FC<Props> = ({formContent, updateForm, onFocus}) =>
  formContent && (
    <div
      className={
        formContent.dataFormat === 'lineprotocol'
          ? 'create-parsing-form--line-protocol'
          : 'create-parsing-form'
      }
      id="parsing"
      onFocus={onFocus}
      tabIndex={-1}
    >
      <Form onSubmit={() => {}} testID="create-parsing-form-overlay">
        <Overlay.Header title="Define Data Parsing Rules"></Overlay.Header>
        <Overlay.Body>
          <Heading
            element={HeadingElement.H5}
            weight={FontWeight.Regular}
            className="create-parsing-form__text"
          >
            Specify the format of your messages and define rules to parse it
            into line protocol.
          </Heading>
          <Grid>
            <Grid.Row>
              <ParsingDetailsEdit
                currentSubscription={formContent}
                updateForm={updateForm}
                className="create"
              />
              {formContent.dataFormat === 'lineprotocol' && (
                <LineProtocolForm edit={true} formContent={formContent} />
              )}
              {formContent.dataFormat === 'json' && (
                <JsonParsingForm
                  formContent={formContent}
                  updateForm={updateForm}
                  edit={true}
                />
              )}
              {formContent.dataFormat === 'string' && (
                <StringParsingForm
                  formContent={formContent}
                  updateForm={updateForm}
                  edit={true}
                />
              )}
            </Grid.Row>
          </Grid>
        </Overlay.Body>
        <div className="create-parsing-form__line"></div>
      </Form>
    </div>
  )
export default ParsingForm
