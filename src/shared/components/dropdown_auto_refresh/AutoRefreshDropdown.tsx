// Libraries
import React, {FC} from 'react'
import classnames from 'classnames'

// Components
import {
  SquareButton,
  IconFont,
  ComponentStatus,
  Dropdown,
} from '@influxdata/clockface'

// Constants
import autoRefreshOptions, {
  AutoRefreshOption,
  AutoRefreshOptionType,
} from 'src/shared/data/autoRefreshes'

// Types
import {AutoRefresh, AutoRefreshStatus} from 'src/types'

const DROPDOWN_WIDTH_COLLAPSED = 50
const DROPDOWN_WIDTH_FULL = 84

interface Props {
  selected: AutoRefresh
  onChoose: (milliseconds: number) => void
  onManualRefresh?: () => void
  showAutoRefresh?: boolean
  customRefreshIntervals?: AutoRefreshOption[]
  customClass?: string
}

const AutoRefreshDropdown: FC<Props> = ({
  selected = {
    interval: 0,
    status: 'paused',
  },
  onChoose,
  onManualRefresh,
  showAutoRefresh = true,
  customRefreshIntervals = [],
  customClass,
}) => {
  const isPausedOrDisabled =
    selected.status === AutoRefreshStatus.Paused ||
    selected.status === AutoRefreshStatus.Disabled

  const setClassName = () => {
    return classnames('autorefresh-dropdown', {
      paused: isPausedOrDisabled,
    })
  }

  const refreshIntervals = [
    ...autoRefreshOptions,
    ...(customRefreshIntervals ?? []),
  ]

  const handleDropdownChange = (autoRefreshOption: AutoRefreshOption): void => {
    onChoose(autoRefreshOption.milliseconds)
  }

  if (!showAutoRefresh) {
    return (
      <div className={setClassName()}>
        <SquareButton
          icon={IconFont.Refresh}
          onClick={onManualRefresh}
          className={`autorefresh-dropdown--pause ${customClass}`}
          testID="autorefresh-dropdown-refresh"
        />
      </div>
    )
  }
  const getDropdownIcon = (): IconFont => {
    if (isPausedOrDisabled) {
      return IconFont.Pause
    }

    return IconFont.Refresh
  }

  const dropdownWidthPixels = (): number => {
    if (isPausedOrDisabled) {
      return DROPDOWN_WIDTH_COLLAPSED
    }

    return DROPDOWN_WIDTH_FULL
  }

  return (
    <div className={setClassName()}>
      <Dropdown
        style={{width: `${dropdownWidthPixels()}px`}}
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            status={
              selected.status === AutoRefreshStatus.Disabled
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
            icon={getDropdownIcon()}
            testID="autorefresh-dropdown--button"
          >
            {
              refreshIntervals.find(
                option => option.milliseconds === selected.interval
              ).label
            }
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu
            onCollapse={onCollapse}
            style={{width: `${DROPDOWN_WIDTH_FULL}px`}}
          >
            {refreshIntervals.map(option => {
              if (option.type === AutoRefreshOptionType.Header) {
                return (
                  <Dropdown.Divider
                    key={option.id}
                    id={option.id}
                    text={option.label}
                  />
                )
              }

              return (
                <Dropdown.Item
                  key={option.id}
                  id={option.id}
                  testID={option.id}
                  value={option}
                  selected={
                    option.id ===
                    refreshIntervals.find(
                      option => option.milliseconds === selected.interval
                    ).id
                  }
                  onClick={handleDropdownChange}
                >
                  {option.label}
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        )}
      />
      {onManualRefresh && (
        <SquareButton
          icon={IconFont.Refresh}
          onClick={onManualRefresh}
          className="autorefresh-dropdown--pause"
          testID="autorefresh-dropdown-refresh"
        />
      )}
    </div>
  )
}
export default AutoRefreshDropdown
