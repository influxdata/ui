// Libraries
import React, {FC, useContext} from 'react'
import {
  ButtonBase,
  ComponentColor,
  ButtonShape,
  IconFont,
  FlexBox,
  FlexDirection,
  ComponentSize,
  Icon,
  ComponentStatus,
} from '@influxdata/clockface'
import {Link} from 'react-router-dom'

// Contexts
import {AccountContext} from 'src/operator/context/account'
import {OperatorContext} from 'src/operator/context/operator'

const AccountViewHeader: FC = () => {
  const {
    account,
    setConvertToContractOverlayVisible,
    convertToContractOverlayVisible,
    setDeleteOverlayVisible,
    deleteOverlayVisible,
  } = useContext(AccountContext)
  const {hasWritePermissions} = useContext(OperatorContext)
  const canConvertToContract =
    account.type === 'free' ||
    (account.type === 'pay_as_you_go' && account.zuoraAccountId !== null)

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
    >
      <FlexBox.Child>
        <Link to="/operator" data-testid="account-view--back-button">
          <Icon glyph={IconFont.CaretLeft_New} />
          Back to Account List
        </Link>
      </FlexBox.Child>
      {hasWritePermissions && (
        <ButtonBase
          color={ComponentColor.Primary}
          shape={ButtonShape.Default}
          onClick={() =>
            setConvertToContractOverlayVisible(!convertToContractOverlayVisible)
          }
          status={
            canConvertToContract
              ? ComponentStatus.Default
              : ComponentStatus.Disabled
          }
          testID="account-convert-to-contract--button"
        >
          Convert to Contract
        </ButtonBase>
      )}
      {hasWritePermissions && (
        <ButtonBase
          color={ComponentColor.Danger}
          shape={ButtonShape.Default}
          onClick={() => setDeleteOverlayVisible(!deleteOverlayVisible)}
          status={
            account?.deletable
              ? ComponentStatus.Default
              : ComponentStatus.Disabled
          }
          testID="account-delete--button"
        >
          Delete Account
        </ButtonBase>
      )}
    </FlexBox>
  )
}

export default AccountViewHeader
