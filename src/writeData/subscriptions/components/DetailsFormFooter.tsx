// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {
  ComponentColor,
  Overlay,
  Button,
  ButtonType,
  ComponentStatus,
} from '@influxdata/clockface'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  nextForm: string
  formActive: string
  id: string
  edit: boolean
  setEdit: (any) => void
  setFormActive: (any) => void
  saveForm: (any) => void
  currentSubscription: Subscription
}

const DetailsFormFooter: FC<Props> = ({
  nextForm,
  id,
  edit,
  setEdit,
  setFormActive,
  formActive,
  saveForm,
  currentSubscription,
}) => {
  const history = useHistory()
  return (
    <Overlay.Footer>
      <Button
        text="Close"
        color={ComponentColor.Tertiary}
        onClick={() => {
          event('close button clicked', {}, {feature: 'subscriptions'})
          history.push(`/orgs/${id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
        }}
        titleText="Cancel update and return to Subscriptions list"
        type={ButtonType.Button}
        testID="update-subscription-form--cancel"
      />
      <Button
        text="Edit"
        color={edit ? ComponentColor.Success : ComponentColor.Secondary}
        onClick={() => {
          event('edit button clicked', {}, {feature: 'subscriptions'})
          setEdit(!edit)
        }}
        type={ButtonType.Button}
        titleText="Edit"
        testID="update-subscription-form--edit"
      />
      {!(formActive === 'parsing') && (
        <Button
          text="Next"
          color={ComponentColor.Secondary}
          onClick={() => {
            event('next button clicked', {}, {feature: 'subscriptions'})
            setFormActive(nextForm)
          }}
          type={ButtonType.Button}
          titleText="Next"
          testID="update-subscription-form--submit"
        />
      )}
      <Button
        text="View Data"
        color={ComponentColor.Success}
        onClick={() => {
          event('view data button clicked', {}, {feature: 'subscriptions'})
          history.push(`/orgs/${id}/notebooks`)
        }}
        type={ButtonType.Button}
        testID="update-subscription-form--view-data"
        status={ComponentStatus.Default}
      />
      {edit && formActive === 'parsing' && (
        <Button
          type={ButtonType.Button}
          text="Save Changes"
          color={ComponentColor.Success}
          onClick={() => {
            event('save changes button clicked', {}, {feature: 'subscriptions'})
            saveForm(currentSubscription)
          }}
          testID="update-parsing-form--submit"
        />
      )}
    </Overlay.Footer>
  )
}

export default DetailsFormFooter
