// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

import {Button, IconFont, FlexBox} from '@influxdata/clockface'

// Selectors
import {
  selectCurrentAccount,
  selectCurrentOrg,
  selectUser,
} from 'src/identity/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const DeleteFreeAccountButton: FC = () => {
  const account = useSelector(selectCurrentAccount)
  const history = useHistory()
  const org = useSelector(selectCurrentOrg)
  const user = useSelector(selectUser)

  const handleClickDeleteFreeAccount = () => {
    showDeleteFreeAccountOverlay()
  }

  const showDeleteFreeAccountOverlay = () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
    }
    event('delete_free_account.initiation', payload)

    history.push(`/orgs/${org.id}/accounts/settings/delete`)
  }

  return (
    <>
      <FlexBox.Child className="account-settings-deleteAccount">
        <h4>Delete Account</h4>
        <p className="account-settings--deleteHeading">
          Delete your Free InfluxDB Cloud account and remove any data that you
          have loaded.
        </p>
        <Button
          testID="delete-free-account--button"
          text="Delete"
          icon={IconFont.Trash_New}
          onClick={handleClickDeleteFreeAccount}
        />
      </FlexBox.Child>
    </>
  )
}
