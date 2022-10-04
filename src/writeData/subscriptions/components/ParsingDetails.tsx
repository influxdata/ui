// Libraries
import React, {FC} from 'react'

// Components
import {Grid, Form, Overlay} from '@influxdata/clockface'
import LineProtocolForm from 'src/writeData/subscriptions/components/LineProtocolForm'
import {StringParsingForm} from 'src/writeData/subscriptions/components/StringParsingForm'
import JsonParsingForm from 'src/writeData/subscriptions/components/JsonParsingForm'
import ParsingDetailsEdit from 'src/writeData/subscriptions/components/ParsingDetailsEdit'
import ParsingDetailsReadOnly from 'src/writeData/subscriptions/components/ParsingDetailsReadOnly'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingDetails.scss'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  edit: boolean
  onFocus?: () => void
}

const ParsingDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  edit,
  onFocus,
}) => (
  <div
    className={
      currentSubscription.dataFormat === 'lineprotocol'
        ? 'update-parsing-form--line-protocol'
        : 'update-parsing-form'
    }
    id="parsing"
    onFocus={onFocus}
    tabIndex={-1}
  >
    <Form onSubmit={() => {}} testID="update-parsing-form-overlay">
      <Overlay.Header title="Define Data Parsing Rules"></Overlay.Header>
      <Overlay.Body>
        <Grid>
          <Grid.Row>
            {edit ? (
              <ParsingDetailsEdit
                currentSubscription={currentSubscription}
                updateForm={updateForm}
                className="update"
              />
            ) : (
              <ParsingDetailsReadOnly
                currentSubscription={currentSubscription}
              />
            )}
            {currentSubscription.dataFormat === 'string' && (
              <StringParsingForm
                formContent={currentSubscription}
                updateForm={updateForm}
                edit={edit}
              />
            )}
            {currentSubscription.dataFormat === 'json' && (
              <JsonParsingForm
                formContent={currentSubscription}
                updateForm={updateForm}
                edit={edit}
              />
            )}
            {currentSubscription.dataFormat === 'lineprotocol' && (
              <LineProtocolForm edit={edit} formContent={currentSubscription} />
            )}
          </Grid.Row>
        </Grid>
      </Overlay.Body>
      <div className="update-parsing-form__line"></div>
    </Form>
  </div>
)
export default ParsingDetails
