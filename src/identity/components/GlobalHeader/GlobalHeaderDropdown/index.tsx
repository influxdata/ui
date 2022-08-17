// Libraries
import React, {MouseEvent} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  Dropdown,
  DropdownMenuTheme,
  FlexBox,
  Icon,
  IconFont,
  JustifyContent,
  StandardFunctionProps,
} from '@influxdata/clockface'

// Styles
import './GlobalHeaderDropdown.scss'

// Types
import {
  GlobalHeaderTypeAheadMenu,
  TypeAheadLocation,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

interface EventParams {
  componentName: string
  action: string
}

// Utils
import {event} from 'src/cloud/utils/reporting'

// Maybe we should have a single file that contains all event names for multiOrg. Make it an enum so we can change to whatever.
export enum DropdownName {
  HeaderNavChangeOrg = 'headNav.org',
  HeaderNavChangeAccount = 'headerNav.account',
  UserProfileDefaultOrg = 'userProfile.defaultOrg',
  UserProfileDefaultAccount = 'userProfile.defaultAccount',
}

export interface MainMenuItem {
  name: string
  iconFont: string
  href: string
}

export interface TypeAheadMenuItem {
  id: string | number
  name: string
}

export interface Props extends StandardFunctionProps {
  defaultButtonText?: string
  defaultTestID?: string
  dropdownButtonSize?: ComponentSize
  dropdownButtonIcon?: IconFont
  dropdownLocation: TypeAheadLocation
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuTheme?: DropdownMenuTheme
  entity?: DropdownName
  mainMenuHeaderText?: string
  mainMenuHeaderIcon?: IconFont
  mainMenuOptions: MainMenuItem[]
  mainMenuTestID?: string
  onlyRenderSubmenu?: boolean
  testID?: string
  typeAheadSelectedOption?: TypeAheadMenuItem
  typeAheadMenuOptions: TypeAheadMenuItem[]
  typeAheadInputPlaceholder?: string
  typeAheadOnSelectOption?: (item: TypeAheadMenuItem | null) => void
  typeAheadTestID?: string
}

type State = {
  showTypeAheadMenu: boolean
  selectedItem?: TypeAheadMenuItem
}

export class GlobalHeaderDropdown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showTypeAheadMenu: this.props.onlyRenderSubmenu ?? false,
      selectedItem: this.props.typeAheadSelectedOption || null,
    }
  }

  componentDidUpdate() {
    if (this.props.typeAheadSelectedOption !== this.state.selectedItem) {
      this.setState({
        selectedItem: this.props.typeAheadSelectedOption,
      })
    }
  }

  private dropdownButton = (
    active: boolean,
    onClick: (e: MouseEvent<HTMLElement>) => void
  ) => {
    const {
      defaultButtonText,
      defaultTestID,
      dropdownButtonSize,
      dropdownButtonIcon,
    } = this.props
    const {selectedItem} = this.state
    return (
      <Dropdown.Button
        active={active}
        onClick={onClick}
        size={dropdownButtonSize}
        trailingIcon={dropdownButtonIcon || IconFont.DoubleCaretVertical}
        className="global-header--dropdown-button"
        testID={defaultTestID}
      >
        {selectedItem?.name || defaultButtonText}
      </Dropdown.Button>
    )
  }

  private sendEvent = (eventParams: EventParams) => () => {
    const {entity} = this.props
    const {componentName, action} = eventParams

    event(`${entity}${componentName}.${action}`)
  }

  private toggleShowTypeAheadMenu = () => {
    const {entity} = this.props
    const {showTypeAheadMenu} = this.state
    if (!showTypeAheadMenu) {
      event(`${entity}Switch.clicked`)
    }
    this.setState({showTypeAheadMenu: !showTypeAheadMenu})
  }

  private renderMainMenuOptions = () => {
    const {mainMenuOptions} = this.props
    return (
      <div>
        {mainMenuOptions.map(value => {
          const iconEl = <Icon glyph={value.iconFont} className="button-icon" />
          const textEl = <span>{value.name}</span>
          return (
            <div
              onClick={this.sendEvent({
                componentName: value.name,
                action: 'clicked',
              })}
              key={`eventWrapper.${value.name}`}
            >
              <Dropdown.HrefItem
                key={value.name}
                href={value.href}
                className="global-header--align-center"
                testID={`${this.props.mainMenuTestID}-${value.name}`}
              >
                {iconEl}
                {textEl}
              </Dropdown.HrefItem>
            </div>
          )
        })}
      </div>
    )
  }

  private renderTypeAheadMenu = () => {
    const {typeAheadMenuOptions} = this.props
    const {selectedItem} = this.state
    const {
      typeAheadInputPlaceholder,
      typeAheadOnSelectOption,
      dropdownLocation,
      dropdownMenuStyle,
    } = this.props
    return (
      <GlobalHeaderTypeAheadMenu
        dropdownLocation={dropdownLocation}
        typeAheadPlaceHolder={typeAheadInputPlaceholder}
        typeAheadMenuOptions={typeAheadMenuOptions}
        onSelectOption={typeAheadOnSelectOption}
        style={dropdownMenuStyle}
        defaultSelectedItem={selectedItem}
        testID={this.props.typeAheadTestID}
      />
    )
  }

  private renderMenu = () => {
    const {
      mainMenuHeaderText,
      dropdownMenuTheme = DropdownMenuTheme.None,
      dropdownMenuStyle,
      typeAheadMenuOptions,
      onlyRenderSubmenu = false,
    } = this.props
    const {showTypeAheadMenu} = this.state

    const textEl = <span>{mainMenuHeaderText}</span>
    const iconEl = (
      <Icon
        glyph={showTypeAheadMenu ? IconFont.CaretLeft_New : IconFont.Switch_New}
        className="button-icon"
      />
    )
    return (
      <Dropdown.Menu
        style={dropdownMenuStyle}
        theme={dropdownMenuTheme}
        testID={this.props.mainMenuTestID}
      >
        {/* Multi-org UI tickets #4051 and #4047, when user only has 1 account or 1 org, switch button is disabled */}
        {!onlyRenderSubmenu && typeAheadMenuOptions.length > 1 && (
          <>
            <Dropdown.Item
              onClick={this.toggleShowTypeAheadMenu}
              className="global-header--switch-button"
            >
              <FlexBox
                justifyContent={JustifyContent.SpaceBetween}
                alignItems={AlignItems.Center}
              >
                <span className="global-header--align-center">
                  {iconEl}
                  {textEl}
                </span>
                {showTypeAheadMenu === false && (
                  <Icon
                    glyph={IconFont.CaretRight_New}
                    className="button-icon"
                    style={{marginRight: 0}}
                  />
                )}
              </FlexBox>
            </Dropdown.Item>
            <hr className="line-break" />
          </>
        )}
        {showTypeAheadMenu
          ? this.renderTypeAheadMenu()
          : this.renderMainMenuOptions()}
      </Dropdown.Menu>
    )
  }

  render() {
    const {id, style, className} = this.props
    const dropdownProps = {id, style, className}

    return (
      <Dropdown
        {...dropdownProps}
        disableAutoFocus
        button={this.dropdownButton}
        menu={this.renderMenu}
        testID={this.props.testID}
      />
    )
  }
}
