// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  Grid,
  Form,
  Overlay,
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import LineProtocolForm from 'src/writeData/subscriptions/components/LineProtocolForm'
import StringParsingForm from 'src/writeData/subscriptions/components/StringParsingForm'
import JsonParsingForm from 'src/writeData/subscriptions/components/JsonParsingForm'
import ParsingDetailsEdit from 'src/writeData/subscriptions/components/ParsingDetailsEdit'
import ParsingDetailsReadOnly from 'src/writeData/subscriptions/components/ParsingDetailsReadOnly'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
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
}

const ParsingDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  saveForm,
  edit,
  setEdit,
  singlePage,
  setStatus,
}) => {
  const history = useHistory()
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
                />
              )}
              {currentSubscription.dataFormat === 'json' && (
                <JsonParsingForm
                  formContent={currentSubscription}
                  updateForm={updateForm}
                />
              )}
              {currentSubscription.dataFormat === 'lineprotocol' && (
                <LineProtocolForm />
              )}
            </Grid.Row>
          </Grid>
        </Overlay.Body>
        {!singlePage ? (
          <Overlay.Footer>
            <Button
              text="Close"
              color={ComponentColor.Tertiary}
              onClick={() => {
                event('close button clicked', {}, {feature: 'subscriptions'})
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Back to subscriptions list"
              type={ButtonType.Button}
              testID="update-parsing-form--cancel"
            />
            <Button
              type={ButtonType.Button}
              text="Edit"
              color={edit ? ComponentColor.Success : ComponentColor.Secondary}
              onClick={() => {
                event('edit button clicked', {}, {feature: 'subscriptions'})
                setEdit(!edit)
              }}
              testID="update-parsing-form--edit"
            />
            <Button
              text="View Data"
              color={ComponentColor.Success}
              onClick={() => {
                event(
                  'view data button clicked',
                  {},
                  {feature: 'subscriptions'}
                )
                history.push(`/orgs/${org.id}/notebooks`)
              }}
              type={ButtonType.Button}
              testID="update-parsing-form--view-data"
              status={ComponentStatus.Default}
            />
            {edit && (
              <Button
                type={ButtonType.Button}
                text="Save Changes"
                color={ComponentColor.Success}
                onClick={() => {
                  event(
                    'save changes button clicked',
                    {},
                    {feature: 'subscriptions'}
                  )
                  saveForm(currentSubscription)
                }}
                testID="update-parsing-form--submit"
              />
            )}
          </Overlay.Footer>
        ) : (
          <div className="update-parsing-form__line"></div>
        )}
      </Form>
    </div>
  )
}
export default ParsingDetails
