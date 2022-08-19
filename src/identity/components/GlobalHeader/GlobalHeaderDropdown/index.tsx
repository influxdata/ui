// Libraries
import React, {MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

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
import {GlobalHeaderTypeAheadMenu} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

// Eventing
import {
  MainMenuEvent,
  multiOrgEvent,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'

export interface MainMenuItem {
  name: string
  iconFont: string
  href: string
}

export interface TypeAheadMenuItem {
  id: string | number
  name: string
}

export interface OwnProps extends StandardFunctionProps {
  defaultButtonText?: string
  defaultTestID?: string
  dropdownButtonIcon?: IconFont
  dropdownButtonSize?: ComponentSize
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuTheme?: DropdownMenuTheme
  mainMenuEventPrefix?: MainMenuEvent
  mainMenuHeaderIcon?: IconFont
  mainMenuHeaderText?: string
  mainMenuOptions: MainMenuItem[]
  mainMenuTestID?: string
  onlyRenderSubmenu?: boolean
  testID?: string
  typeAheadEventPrefix: TypeAheadEventPrefix
  typeAheadInputPlaceholder?: string
  typeAheadMenuOptions: TypeAheadMenuItem[]
  typeAheadOnSelectOption?: (item: TypeAheadMenuItem | null) => void
  typeAheadSelectedOption?: TypeAheadMenuItem
  typeAheadTestID?: string
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = OwnProps & ReduxProps

type State = {
  showTypeAheadMenu: boolean
  selectedItem?: TypeAheadMenuItem
}

export class GlobalHeaderDrop extends React.Component<Props, State> {
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
      dropdownButtonIcon,
      dropdownButtonSize,
    } = this.props
    const {selectedItem} = this.state
    return (
      <Dropdown.Button
        active={active}
        className="global-header--dropdown-button"
        onClick={onClick}
        size={dropdownButtonSize}
        testID={defaultTestID}
        trailingIcon={dropdownButtonIcon || IconFont.DoubleCaretVertical}
      >
        {selectedItem?.name || defaultButtonText}
      </Dropdown.Button>
    )
  }

  private sendMainMenuEvent = (menuItem: string) => () => {
    const {mainMenuEventPrefix, multiOrgEvent} = this.props
    multiOrgEvent(`${mainMenuEventPrefix}${menuItem}.clicked`)
  }

  private toggleShowTypeAheadMenu = () => {
    const {mainMenuEventPrefix, multiOrgEvent} = this.props
    const {showTypeAheadMenu} = this.state
    // 'Clicked the switch button' event is only emitted if the typeahead was closed.
    if (!showTypeAheadMenu) {
      multiOrgEvent(`${mainMenuEventPrefix}Switch.clicked`)
    }
    this.setState({showTypeAheadMenu: !showTypeAheadMenu})
  }

  private renderMainMenuOptions = () => {
    const {mainMenuOptions} = this.props
    return (
      <div>
        <hr className="line-break" />
        {mainMenuOptions.map(menuItem => {
          const iconEl = (
            <Icon glyph={menuItem.iconFont} className="button-icon" />
          )
          const textEl = <span>{menuItem.name}</span>
          return (
            <div
              onClick={this.sendMainMenuEvent(menuItem.name)}
              key={`eventWrapper.${menuItem.name}`}
            >
              <Dropdown.HrefItem
                className="global-header--align-center"
                key={menuItem.name}
                href={menuItem.href}
                testID={`${this.props.mainMenuTestID}-${menuItem.name}`}
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
      dropdownMenuStyle,
      typeAheadEventPrefix,
      typeAheadInputPlaceholder,
      typeAheadOnSelectOption,
    } = this.props
    return (
      <GlobalHeaderTypeAheadMenu
        defaultSelectedItem={selectedItem}
        onSelectOption={typeAheadOnSelectOption}
        style={dropdownMenuStyle}
        testID={this.props.typeAheadTestID}
        typeAheadEventPrefix={typeAheadEventPrefix}
        typeAheadMenuOptions={typeAheadMenuOptions}
        typeAheadPlaceHolder={typeAheadInputPlaceholder}
      />
    )
  }

  private renderMenu = () => {
    const {
      dropdownMenuStyle,
      dropdownMenuTheme = DropdownMenuTheme.None,
      mainMenuHeaderText,
      onlyRenderSubmenu = false,
      typeAheadMenuOptions,
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
        button={this.dropdownButton}
        disableAutoFocus
        menu={this.renderMenu}
        testID={this.props.testID}
      />
    )
  }
}

const mdtp = {
  multiOrgEvent,
}

const connector = connect(null, mdtp)

export const GlobalHeaderDropdown = connector(GlobalHeaderDrop)
