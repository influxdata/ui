// Libraries
import React from 'react'
import {Link} from 'react-router-dom'
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

// Eventing
import {HeaderNavEvent, multiOrgTag} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

// Styles
import './UserPopoverStyles.scss'

type Props = {
  email: string
  firstName: string
  lastName: string
  orgId: string
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
    const {firstName, lastName} = this.props
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    return initials
  }

  private handlePopoverClick = (eventName: string) => () => {
    event(eventName, multiOrgTag)
  }
  private togglePopoverState = () => {
    const {isPopoverOpen} = this.state
    if (!isPopoverOpen) {
      event(HeaderNavEvent.UserAvatarClick, multiOrgTag)
    }
    this.setState({isPopoverOpen: !isPopoverOpen})
  }

  private setPopoverStateClosed = () => {
    this.setState({isPopoverOpen: false})
  }

  private getUserPopoverContents = () => {
    const {email, firstName, lastName, orgId} = this.props

    return (
      <>
        <div className="user-popover-header">
          <div className="user-popover-header-name">
            {firstName ?? null} {lastName ?? null}
          </div>
          <div className="user-popover-header-email">{email}</div>
          <hr />
        </div>
        <div className="user-popover-footer">
          <Link
            className="user-popover-footer--button"
            to={`/orgs/${orgId}/user/profile`}
            onClick={this.handlePopoverClick(HeaderNavEvent.UserProfileClick)}
          >
            <Icon
              className="user-popover-footer--button-icon"
              glyph={IconFont.User}
              testID="global-header--user-popover-profile-button"
            />
            Profile
          </Link>
          <Link
            className="user-popover-footer--button"
            onClick={this.handlePopoverClick(HeaderNavEvent.UserLogoutClick)}
            to="/logout"
          >
            <Icon
              glyph={IconFont.Logout}
              className="user-popover-footer--button-icon"
              testID="global-header--user-popover-logout-button"
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

    const avatarInitials = this.getInitials()

    const {isPopoverOpen} = this.state
    return (
      <ClickOutside onClickOutside={this.setPopoverStateClosed}>
        <div>
          {/* Button shape is ButtonShape.Square to make the height and width the same
            so we can use the border radius to make it a circle  */}
          <Button
            text={avatarInitials}
            shape={ButtonShape.Square}
            color={
              isPopoverOpen ? ComponentColor.Default : ComponentColor.Tertiary
            }
            onClick={this.togglePopoverState}
            className={userAvatarButtonClassName}
            testID="global-header--user-avatar"
            icon={avatarInitials === '' ? IconFont.User : null}
          />
          <FlexBox
            className={userPopoverClassName}
            direction={FlexDirection.Column}
            testID="global-header--user-popover"
          >
            {this.getUserPopoverContents()}
          </FlexBox>
        </div>
      </ClickOutside>
    )
  }
}

export default IdentityUserAvatar
