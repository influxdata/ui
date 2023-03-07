// Libraries
import React, {ChangeEvent, FC, useContext, useState} from 'react'

// Contexts
import {DBRPContext} from 'src/shared/contexts/dbrps'

// Types
import {RemoteDataState} from 'src/types'
import {DBRP} from 'src/client'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {
  ComponentSize,
  Dropdown,
  DropdownMenuTheme,
  IconFont,
  Input,
  TechnoSpinner,
} from '@influxdata/clockface'

const DBRP_TOOLTIP = `TODO: test`

export const DBRPSelector: FC = () => {
  const {loading, dbrps} = useContext(DBRPContext)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const _dbrps: DBRP[] = dbrps.filter(d =>
    `${d.database}`.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  )

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  let buttonText = 'Loading DBRPs...'
  if (loading === RemoteDataState.Done) {
    buttonText = 'Select...' // TDOD: add selectedDBRP
  }

  const button = (active: boolean, onClick: any) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      testID="dbrp-selector--dropdown-button"
    >
      {buttonText}
    </Dropdown.Button>
  )

  if (loading !== RemoteDataState.Done) {
    return (
      <div>
        <SelectorTitle label="DBRP" tooltipContents={DBRP_TOOLTIP} />
        <Dropdown
          button={button}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              <Dropdown.ItemEmpty>
                <TechnoSpinner
                  strokeWidth={ComponentSize.Small}
                  diameterPixels={32}
                />
              </Dropdown.ItemEmpty>
            </Dropdown.Menu>
          )}
        />
      </div>
    )
  }

  const body: JSX.Element | JSX.Element[] =
    _dbrps.length === 0 ? (
      <Dropdown.ItemEmpty>No DBRPs Found</Dropdown.ItemEmpty>
    ) : (
      _dbrps.map(d => {
        const dbrpMapping = `${d.database}/${d.retention_policy}`
        return (
          <Dropdown.Item
            key={dbrpMapping}
            value={d}
            onClick={() => {}} // TODO:
            // TODO: selected
            title={dbrpMapping}
            wrapText={true}
            testID={`dbrp-selector--dropdown--${dbrpMapping}`}
          >
            {dbrpMapping}
          </Dropdown.Item>
        )
      })
    )

  return (
    <div>
      <SelectorTitle label="DBRP" tooltipContents={DBRP_TOOLTIP} />
      <Dropdown
        button={button}
        menu={onCollapse => (
          <Dropdown.Menu
            onCollapse={() => {
              if (isSearchActive === false) {
                onCollapse()
              }
            }}
            theme={DropdownMenuTheme.Onyx}
          >
            <div className="searchable-dropdown--input-container">
              <Input
                icon={IconFont.Search_New}
                onFocus={() => setIsSearchActive(true)}
                onChange={handleSearchChange}
                onBlur={() => setIsSearchActive(false)}
                value={searchTerm}
                placeholder="Search DBRPs"
                size={ComponentSize.Small}
                autoFocus={true}
                testID="dbrp-selector--search-bar"
              />
            </div>
            {body}
          </Dropdown.Menu>
        )}
      />
    </div>
  )
}
