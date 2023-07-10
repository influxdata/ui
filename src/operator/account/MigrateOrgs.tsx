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
import {AccountContext} from '../context/account'
import {MigrateOrgsOverlay} from './MigrateOrgsOverlay'
import {OperatorAccount, getOperatorAccount} from 'src/client/unityRoutes'
import {useDispatch} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {getAccountError} from 'src/shared/copy/notifications'

export const MigrateOrgsTool: FC = () => {
  const {account, setMigrateOverlayVisible} = useContext(AccountContext)
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

  return account.type === 'cancelled' ? (
    <></>
  ) : (
    <>
      <MigrateOrgsOverlay toAccount={toAccount} />
      <h2 data-testid="migrate-resources--title">
        Migrate Organizations and Users
      </h2>
      <Form onSubmit={submit}>
        <Form.Label
          id="accounts-migrate--account-id-label"
          label="Please enter an Account ID to migrate to:"
        />
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
