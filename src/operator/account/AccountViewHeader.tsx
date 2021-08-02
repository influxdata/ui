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
import {AccountContext} from 'src/operator/context/account'
import {useSelector} from 'react-redux'
import {getQuartzMe} from 'src/me/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const AccountViewHeader: FC = () => {
  const {account, setVisible, visible} = useContext(AccountContext)
  const quartzMe = useSelector(getQuartzMe)

  const operatorHasPermissions = () => {
    return (
      !isFlagEnabled('operatorRole') ||
      (quartzMe.isOperator && quartzMe?.operatorRole === 'read-write')
    )
  }

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
    >
      <FlexBox.Child>
        <Link to="/operator" data-testid="account-view--back-button">
          <Icon glyph={IconFont.CaretLeft} />
          Back to Account List
        </Link>
      </FlexBox.Child>
      {operatorHasPermissions() && (
        <ButtonBase
          color={ComponentColor.Danger}
          shape={ButtonShape.Default}
          onClick={_e => setVisible(!visible)}
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
