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

// Utils
import {getOrg} from 'src/organizations/selectors'

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
}

const ParsingDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  saveForm,
  edit,
  setEdit,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <div className="update-parsing-form">
      <Form onSubmit={() => {}} testID="update-parsing-form-overlay">
        <Overlay.Header title="Define Data Parsing Rules"></Overlay.Header>
        <Overlay.Body>
          <Grid>
            <Grid.Row>
              {edit ? (
                <ParsingDetailsEdit
                  currentSubscription={currentSubscription}
                  updateForm={updateForm}
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
        <Overlay.Footer>
          <Button
            text="Close"
            color={ComponentColor.Tertiary}
            onClick={() => {
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
            onClick={() => setEdit(!edit)}
            testID="update-parsing-form--edit"
          />
          {edit && (
            <Button
              type={ButtonType.Button}
              text="Save Changes"
              color={ComponentColor.Secondary}
              onClick={() => {
                saveForm(currentSubscription)
              }}
              testID="update-parsing-form--submit"
            />
          )}
          <Button
            text="View Data"
            color={ComponentColor.Success}
            type={ButtonType.Button}
            onClick={() => {
              history.push(`/orgs/${org.id}/notebooks`)
            }}
            testID="update-parsing-form--view-data"
            status={ComponentStatus.Default}
          />
        </Overlay.Footer>
      </Form>
    </div>
  )
}
export default ParsingDetails
