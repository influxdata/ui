import React, {CSSProperties} from 'react'
import {IdentityUser} from 'src/client/unityRoutes'
import {
  Button,
  ButtonShape,
  ClickOutside,
  ComponentColor,
  FlexBox,
  Icon,
  IconFont,
  InfluxColors,
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

  // get button style based on whether popover is open or not
  private getButtonStyle = (): CSSProperties => {
    const {isPopoverOpen} = this.state

    const style: CSSProperties = {
      margin: 0,
      borderRadius: '50%',
      border: isPopoverOpen ? 'none' : `2px solid ${InfluxColors.Grey65}`,
      background: isPopoverOpen
        ? `linear-gradient(75.66deg, #0098F0 0%, ${InfluxColors.Amethyst} 79.64%)`
        : 'none',
    }
    return style
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
      <div className="user-popover">
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
              glyph={IconFont.UserOutline_New}
              className="user-popover-footer--button-icon"
            />
            Profile
          </Link>
          <Link className="user-popover-footer--button" to="/logout">
            <Icon
              glyph={IconFont.Logout_New}
              className="user-popover-footer--button-icon"
            />
            Log Out
          </Link>
        </div>
      </div>
    )
  }

  private getPopoverStyle = () => {
    return {
      position: 'absolute',
      top: 60,
      right: 32,
      opacity: this.state.isPopoverOpen ? 100 : 0,
    } as CSSProperties
  }

  render() {
    const {isPopoverOpen} = this.state
    return (
      <ClickOutside onClickOutside={this.setPopoverStateClosed}>
        <div>
          {/* Button shape is ButtonShape.Square to make the height and width the same
            so we can use the border radius to make it a circle  */}
          <Button
            text={this.getInitials()}
            style={this.getButtonStyle()}
            shape={ButtonShape.Square}
            color={
              isPopoverOpen ? ComponentColor.Default : ComponentColor.Tertiary
            }
            onClick={this.togglePopoverState}
            className="user-avatar-button"
          />
          <FlexBox style={this.getPopoverStyle()}>
            {this.getUserPopoverContents()}
          </FlexBox>
        </div>
      </ClickOutside>
    )
  }
}

export default IdentityUserAvatar
