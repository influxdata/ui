// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Grid, Form, Overlay} from '@influxdata/clockface'
import LineProtocolForm from 'src/writeData/subscriptions/components/LineProtocolForm'
import StringParsingForm from 'src/writeData/subscriptions/components/StringParsingForm'
import JsonParsingForm from 'src/writeData/subscriptions/components/JsonParsingForm'
import ParsingDetailsEdit from 'src/writeData/subscriptions/components/ParsingDetailsEdit'
import ParsingDetailsReadOnly from 'src/writeData/subscriptions/components/ParsingDetailsReadOnly'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'
import DetailsFormFooter from 'src/writeData/subscriptions/components/DetailsFormFooter'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingDetails.scss'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  saveForm: (any) => void
  edit: boolean
  setEdit: (any) => void
  singlePage: boolean
  setStatus: (any) => void
  setFormActive: (any) => void
  active: string
}

const ParsingDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  saveForm,
  edit,
  setEdit,
  singlePage,
  setStatus,
  setFormActive,
  active,
}) => {
  const org = useSelector(getOrg)
  return (
    <div className="update-parsing-form" id="parsing">
      <Form onSubmit={() => {}} testID="update-parsing-form-overlay">
        {!singlePage && (
          <StatusHeader
            currentSubscription={currentSubscription}
            setStatus={setStatus}
          />
        )}
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
                <LineProtocolForm />
              )}
            </Grid.Row>
          </Grid>
        </Overlay.Body>
        {!singlePage ? (
          <DetailsFormFooter
            nextForm=""
            id={org.id}
            edit={edit}
            setEdit={setEdit}
            setFormActive={setFormActive}
            formActive={active}
            currentSubscription={currentSubscription}
            saveForm={saveForm}
          />
        ) : (
          <div className="update-parsing-form__line"></div>
        )}
      </Form>
    </div>
  )
}
export default ParsingDetails
