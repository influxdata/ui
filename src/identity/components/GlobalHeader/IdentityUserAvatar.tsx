import React from 'react'
import {IdentityUser} from 'src/client/unityRoutes'
import classnames from 'classnames'
import {
  Button,
  ButtonShape,
  ClickOutside,
  ComponentColor,
  FlexBox,
  FlexDirection,
  Icon,
  IconFont,
} from '@influxdata/clockface'

import './UserPopoverStyles.scss'
import {Link} from 'react-router-dom'

type Props = {
  user: IdentityUser
}

type State = {
  isPopoverOpen: boolean
}

class IdentityUserAvatar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isPopoverOpen: false,
    }
  }

  private getInitials = (): string => {
    const {user} = this.props
    const firstName = user.firstName
    const lastName = user.lastName
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    return initials
  }

  private togglePopoverState = () => {
    const {isPopoverOpen} = this.state
    this.setState({isPopoverOpen: !isPopoverOpen})
  }

  private setPopoverStateClosed = () => {
    this.setState({isPopoverOpen: false})
  }

  private getUserPopoverContents = () => {
    const {user} = this.props
    return (
      <>
        <div className="user-popover-header">
          <div className="user-popover-header-name">
            {user.firstName} {user.lastName}
          </div>
          <div className="user-popover-header-email">{user.email}</div>
          <hr />
        </div>
        <div className="user-popover-footer">
          <Link className="user-popover-footer--button" to="/">
            <Icon
              glyph={IconFont.User}
              className="user-popover-footer--button-icon"
            />
            Profile
          </Link>
          <Link className="user-popover-footer--button" to="/logout">
            <Icon
              glyph={IconFont.Logout}
              className="user-popover-footer--button-icon"
            />
            Log Out
          </Link>
        </div>
      </>
    )
  }

  render() {
    const userPopoverClassName = classnames('user-popover', {
      'user-popover--open': this.state.isPopoverOpen,
    })

    const userAvatarButtonClassName = classnames('user-avatar-button', {
      'user-popover--open': this.state.isPopoverOpen,
    })

    const {isPopoverOpen} = this.state
    return (
      <ClickOutside onClickOutside={this.setPopoverStateClosed}>
        <div>
          {/* Button shape is ButtonShape.Square to make the height and width the same
            so we can use the border radius to make it a circle  */}
          <Button
            text={this.getInitials()}
            shape={ButtonShape.Square}
            color={
              isPopoverOpen ? ComponentColor.Default : ComponentColor.Tertiary
            }
            onClick={this.togglePopoverState}
            className={userAvatarButtonClassName}
          />
          <FlexBox
            className={userPopoverClassName}
            direction={FlexDirection.Column}
          >
            {this.getUserPopoverContents()}
          </FlexBox>
        </div>
      </ClickOutside>
    )
  }
}

export default IdentityUserAvatar
