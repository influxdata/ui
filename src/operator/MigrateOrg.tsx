import {
  AlignItems,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  Form,
  Input,
} from '@influxdata/clockface'
import React, {ChangeEvent, FC, useContext, useState} from 'react'
import {OverlayContext} from 'src/operator/context/overlay'
import {OperatorAccount, getOperatorAccount} from 'src/client/unityRoutes'
import {MigrateOrgOverlay} from './MigrateOrgOverlay'
import {useDispatch} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {getAccountError} from 'src/shared/copy/notifications'

export const MigrateOrg: FC = () => {
  const {organization, setMigrateOverlayVisible} = useContext(OverlayContext)
  const [toAccountId, setToAccountId] = useState('')
  const [toAccount, setToAccount] = useState<OperatorAccount>(null)
  const dispatch = useDispatch()

  const changeToAccountId = (event: ChangeEvent<HTMLInputElement>) => {
    setToAccountId(event.target.value)
  }

  const submit = async () => {
    if (toAccountId === '') {
      return
    }

    try {
      const resp = await getOperatorAccount({accountId: toAccountId})
      if (resp.status !== 200) {
        dispatch(notify(getAccountError(toAccountId)))
        return
      }
      setToAccount(resp.data)
      setMigrateOverlayVisible(true)
    } catch (error) {
      console.error(error)
    }
  }

  const canSubmit = toAccountId !== ''

  return organization?.state !== 'provisioned' ? (
    <></>
  ) : (
    <>
      <MigrateOrgOverlay toAccount={toAccount} />
      <h4 data-testid="migrate-org--title">Migrate Org to another Account</h4>
      <Form onSubmit={submit}>
        <FlexBox
          direction={FlexDirection.Row}
          alignItems={AlignItems.FlexStart}
          margin={ComponentSize.Large}
        >
          <Input
            placeholder="Account ID to migrate resources to"
            inputStyle={{width: '400px'}}
            style={{width: 'auto'}}
            value={toAccountId}
            onChange={changeToAccountId}
            testID="accounts-migrate--account-id"
          />
          <Button
            text="migrate"
            color={ComponentColor.Primary}
            type={ButtonType.Submit}
            testID="accounts-migrate--button"
            className="accounts-migrate--button"
            active={canSubmit}
            status={
              canSubmit ? ComponentStatus.Default : ComponentStatus.Disabled
            }
          />
        </FlexBox>
      </Form>
    </>
  )
}
