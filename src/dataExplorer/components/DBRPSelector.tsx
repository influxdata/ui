// Libraries
import React, {ChangeEvent, FC, useContext, useState} from 'react'

// Contexts
import {BucketContext} from 'src/shared/contexts/buckets'
import {DBRPContext} from 'src/shared/contexts/dbrps'
import {ScriptQueryBuilderContext} from 'src/dataExplorer/context/scriptQueryBuilder'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Types
import {RemoteDataState} from 'src/types'
import {DBRP} from 'src/client'
import {LanguageType} from 'src/dataExplorer/components/resources'

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

const DBRP_TOOLTIP = `InfluxQL requires a database and retention policy \
(DBRP) combination in order to query data. In InfluxDB Cloud, databases \
and retention policies have been combined and replaced by InfluxDB buckets. \
To query InfluxDB Cloud with InfluxQL, the specified DBRP combination \
must be mapped to a bucket.`

export const DBRPSelector: FC = () => {
  const {loading, dbrps} = useContext(DBRPContext)
  const {buckets} = useContext(BucketContext)
  const {selectedDBRP, selectDBRP} = useContext(ScriptQueryBuilderContext)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const {resource} = useContext(PersistanceContext)

  if (resource?.language !== LanguageType.INFLUXQL) {
    return null
  }

  const _dbrps: DBRP[] = dbrps.filter(d =>
    `${d.database}`.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  )

  const handleSelectDBRP = (dbrp: DBRP) => {
    // grab bucket object
    const bucket = buckets.find(b => b.id === dbrp.bucketID)
    if (!bucket) {
      // this should never be happening
      console.error(
        `No matching bucket found for ${dbrp.database}/${dbrp.retention_policy}, \
        suggest to create a DBRP mapping \
        https://docs.influxdata.com/influxdb/cloud/query-data/influxql/dbrp/`
      )
    } else {
      selectDBRP(dbrp, bucket)
    }
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  let buttonText = 'Loading DBRPs...'
  if (loading === RemoteDataState.Done && !selectedDBRP?.database) {
    buttonText = 'Select DBRP...'
  } else if (loading === RemoteDataState.Done && selectedDBRP?.database) {
    buttonText = `${selectedDBRP.database}/${selectedDBRP.retention_policy}`
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
      _dbrps.map((d: DBRP) => {
        const dbrpMapping = `${d.database}/${d.retention_policy}`
        return (
          <Dropdown.Item
            key={dbrpMapping}
            value={d}
            onClick={handleSelectDBRP}
            // bucketID is unique for each DBRP pair
            selected={selectedDBRP?.bucketID === d.bucketID}
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
            scrollToSelected={true}
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
