import React from 'react'
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

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import './UserPopoverStyles.scss'
import {Link} from 'react-router-dom'

type Props = {
  firstName: string
  lastName: string
  email: string
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
    this.sendEvent(eventName)
  }

  private sendEvent = eventName => {
    const {email, firstName, lastName} = this.props
    event(
      eventName,
      {initiative: 'multiOrg'},
      {firstName: firstName, lastName: lastName, email: email}
    )
  }

  private togglePopoverState = () => {
    const {email, firstName, lastName} = this.props
    const {isPopoverOpen} = this.state
    if (!isPopoverOpen) {
      event(
        'headerNav.userAvatarIcon.clicked',
        {initiative: 'multiOrg'},
        {firstName: firstName, lastName: lastName, email: email}
      )
    }
    this.setState({isPopoverOpen: !isPopoverOpen})
  }

  private setPopoverStateClosed = () => {
    this.setState({isPopoverOpen: false})
  }

  private getUserPopoverContents = () => {
    const {firstName, lastName, email, orgId} = this.props

    return (
      <>
        <div className="user-popover-header">
          <div className="user-popover-header-name">
            {firstName} {lastName}
          </div>
          <div className="user-popover-header-email">{email}</div>
          <hr />
        </div>
        <div className="user-popover-footer">
          <Link
            className="user-popover-footer--button"
            to={`/orgs/${orgId}/user/profile`}
            onClick={this.handlePopoverClick(
              'headerNav.userAvatarProfile.clicked'
            )}
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
            onClick={this.handlePopoverClick(
              'headerNav.userAvatarLogOut.clicked'
            )}
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
            testID="global-header--user-avatar"
            icon={!this.getInitials() ? IconFont.User : null}
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
