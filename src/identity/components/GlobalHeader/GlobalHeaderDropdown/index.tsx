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
import GlobalHeaderTypeAheadMenu from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

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
  dropdownButtonSize?: ComponentSize
  dropdownButtonIcon?: IconFont
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuTheme?: DropdownMenuTheme
  mainMenuHeaderText?: string
  mainMenuHeaderIcon?: IconFont
  mainMenuOptions: MainMenuItem[]
  onlyRenderSubmenu?: boolean
  typeAheadSelectedOption?: TypeAheadMenuItem
  typeAheadMenuOptions: TypeAheadMenuItem[]
  typeAheadInputPlaceholder?: string
  typeAheadOnSelectOption?: (item: TypeAheadMenuItem | null) => void
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
      dropdownButtonSize,
      dropdownButtonIcon,
    } = this.props
    const {selectedItem} = this.state
    return (
      <Dropdown.Button
        active={active}
        onClick={onClick}
        size={dropdownButtonSize}
        icon={dropdownButtonIcon}
        className="global-header--dropdown-button"
      >
        {selectedItem?.name || defaultButtonText}
      </Dropdown.Button>
    )
  }

  private toggleShowTypeAheadMenu = () => {
    const {showTypeAheadMenu} = this.state
    this.setState({showTypeAheadMenu: !showTypeAheadMenu})
  }

  private renderMainMenuOptions = () => {
    const {mainMenuOptions} = this.props
    return (
      <div>
        <hr className="line-break" />
        {mainMenuOptions.map(value => {
          const iconEl = <Icon glyph={value.iconFont} className="button-icon" />
          const textEl = <span>{value.name}</span>
          return (
            <Dropdown.HrefItem
              key={value.name}
              href={value.href}
              className="align-center"
            >
              {iconEl}
              {textEl}
            </Dropdown.HrefItem>
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
      dropdownMenuStyle,
    } = this.props
    return (
      <GlobalHeaderTypeAheadMenu
        typeAheadPlaceHolder={typeAheadInputPlaceholder}
        typeAheadMenuOptions={typeAheadMenuOptions}
        onSelectOption={typeAheadOnSelectOption}
        style={dropdownMenuStyle}
        defaultSelectedItem={selectedItem}
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
      <Dropdown.Menu theme={dropdownMenuTheme} style={dropdownMenuStyle}>
        {/* Multi-org UI tickets #4051 and #4047, when user only has 1 account or 1 org, switch button is disabled */}
        {!onlyRenderSubmenu && typeAheadMenuOptions.length > 1 && (
          <Dropdown.Item onClick={this.toggleShowTypeAheadMenu}>
            <FlexBox
              justifyContent={JustifyContent.SpaceBetween}
              alignItems={AlignItems.Center}
            >
              <span className="align-center">
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
      />
    )
  }
}
