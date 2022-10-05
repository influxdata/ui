// Libraries
import React, {MouseEvent} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'

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
import GlobalHeaderTypeAheadMenu from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

// Styles
import './GlobalHeaderDropdown.scss'

// Eventing
import {
  MainMenuEventPrefix,
  multiOrgTag,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

export interface MainMenuItem {
  name: string
  iconFont: string
  href: string
  className?: string
  showDivider?: boolean
}

export interface TypeAheadMenuItem {
  id: string | number
  name: string
}

export interface Props extends StandardFunctionProps {
  defaultButtonText?: string
  defaultTestID?: string
  dropdownButtonIcon?: IconFont
  dropdownButtonSize?: ComponentSize
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuTheme?: DropdownMenuTheme
  mainMenuEventPrefix?: MainMenuEventPrefix
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
  additionalHeaderItems?: JSX.Element[]
}

type State = {
  showTypeAheadMenu: boolean
}

export class GlobalHeaderDropdown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showTypeAheadMenu: this.props.onlyRenderSubmenu ?? false,
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
      typeAheadSelectedOption,
    } = this.props
    return (
      <Dropdown.Button
        active={active}
        className="global-header--dropdown-button"
        onClick={onClick}
        size={dropdownButtonSize}
        testID={defaultTestID}
        trailingIcon={dropdownButtonIcon || IconFont.DoubleCaretVertical}
      >
        {typeAheadSelectedOption?.name || defaultButtonText}
      </Dropdown.Button>
    )
  }

  private sendMainMenuEvent = (menuItem: string) => () => {
    const {mainMenuEventPrefix} = this.props
    event(`${mainMenuEventPrefix}${menuItem}.clicked`, multiOrgTag)
  }

  private toggleShowTypeAheadMenu = () => {
    const {mainMenuEventPrefix} = this.props
    const {showTypeAheadMenu} = this.state
    // 'Clicked the switch button' event only emitted when opening the typeahead.
    if (!showTypeAheadMenu) {
      event(`${mainMenuEventPrefix}Switch.clicked`, multiOrgTag)
    }
    this.setState({showTypeAheadMenu: !showTypeAheadMenu})
  }

  private getMainMenuOption = (
    menuItem: MainMenuItem,
    onCollapse: VoidFunction
  ) => {
    const iconEl = <Icon glyph={menuItem.iconFont} className="button-icon" />
    const textEl = <span>{menuItem.name}</span>
    const addMoreOrgsClassNames = classNames(
      'global-header--main-dropdown-item',
      menuItem.className ?? ''
    )
    return (
      <div
        onClick={this.sendMainMenuEvent(menuItem.name)}
        key={`eventWrapper.${menuItem.name}`}
      >
        <Dropdown.LinkItem
          className={addMoreOrgsClassNames}
          key={menuItem.name}
          testID={`${this.props.mainMenuTestID}-${menuItem.name}`}
          selected={false}
        >
          <Link
            to={menuItem.href}
            className="global-header--main-dropdown-item-link"
            onClick={onCollapse}
          >
            {iconEl}
            {textEl}
          </Link>
        </Dropdown.LinkItem>
      </div>
    )
  }

  private renderMainMenuOptions = (onCollapse: VoidFunction) => {
    const {mainMenuOptions} = this.props
    return (
      <div>
        {mainMenuOptions.reduce((prev, curr) => {
          if (curr?.showDivider) {
            prev.push(
              <hr key={`SectionBreak ${curr.name}`} className="section-break" />
            )
          }
          prev.push(this.getMainMenuOption(curr, onCollapse))

          return prev
        }, [])}
      </div>
    )
  }

  private renderTypeAheadMenu = () => {
    const {
      dropdownMenuStyle,
      typeAheadMenuOptions,
      typeAheadSelectedOption,
      typeAheadEventPrefix,
      typeAheadInputPlaceholder,
      typeAheadOnSelectOption,
    } = this.props
    return (
      <GlobalHeaderTypeAheadMenu
        defaultSelectedItem={typeAheadSelectedOption ?? null}
        onSelectOption={typeAheadOnSelectOption}
        style={dropdownMenuStyle}
        testID={this.props.typeAheadTestID}
        typeAheadEventPrefix={typeAheadEventPrefix}
        typeAheadMenuOptions={typeAheadMenuOptions}
        typeAheadPlaceHolder={typeAheadInputPlaceholder}
      />
    )
  }

  private renderMenu = (onCollapse: VoidFunction) => {
    const {
      dropdownMenuStyle,
      dropdownMenuTheme = DropdownMenuTheme.None,
      mainMenuHeaderText,
      onlyRenderSubmenu = false,
      typeAheadMenuOptions,
      additionalHeaderItems = [],
    } = this.props
    const {showTypeAheadMenu} = this.state

    const textEl = <span>{mainMenuHeaderText}</span>
    const iconEl = (
      <Icon
        glyph={showTypeAheadMenu ? IconFont.CaretLeft_New : IconFont.Switch_New}
        className="button-icon"
      />
    )
    const showSwitchOrgItem =
      !onlyRenderSubmenu && typeAheadMenuOptions.length > 1
    const showAdditionalHeaderItems =
      !onlyRenderSubmenu &&
      !showTypeAheadMenu &&
      additionalHeaderItems.length > 0
    const showDivider = showSwitchOrgItem || showAdditionalHeaderItems

    return (
      <Dropdown.Menu
        style={dropdownMenuStyle}
        theme={dropdownMenuTheme}
        testID={this.props.mainMenuTestID}
      >
        {/* Multi-org UI tickets #4051 and #4047, when user only has 1 account or 1 org, switch button is disabled */}
        <>
          {showSwitchOrgItem && (
            <Dropdown.Item
              onClick={this.toggleShowTypeAheadMenu}
              className="global-header--switch-button"
            >
              <FlexBox
                justifyContent={JustifyContent.SpaceBetween}
                alignItems={AlignItems.Center}
              >
                <span className="global-header--main-dropdown-item">
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
          {showAdditionalHeaderItems && additionalHeaderItems}
          {showDivider && <hr className="line-break" />}
        </>
        {showTypeAheadMenu
          ? this.renderTypeAheadMenu()
          : this.renderMainMenuOptions(onCollapse)}
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
        menu={onCollapse => this.renderMenu(onCollapse)}
        testID={this.props.testID}
      />
    )
  }
}
