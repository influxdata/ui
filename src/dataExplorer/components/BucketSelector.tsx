import React, {FC, Fragment, ChangeEvent, useContext, useState} from 'react'
import {
  TechnoSpinner,
  ComponentSize,
  Dropdown,
  DropdownMenuTheme,
  IconFont,
  Input,
} from '@influxdata/clockface'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Contexts
import {FluxQueryBuilderContext} from 'src/dataExplorer/context/fluxQueryBuilder'
import {BucketContext} from 'src/shared/contexts/buckets'
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState, Bucket} from 'src/types'

const BUCKET_TOOLTIP = `A bucket is a named location where time series data \
is stored. You can think of a bucket like you would a database in SQL systems.`

const REMAP_BUCKET_TYPES = {
  user: 'My Data',
  system: 'System Data',
  sample: 'Sample Data',
}

const BucketSelector: FC = () => {
  const {selectedBucket, selectBucket} = useContext(FluxQueryBuilderContext)
  const {loading, buckets} = useContext(BucketContext)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const _buckets = buckets.filter(b =>
    `${b.name}`.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  )

  const handleSelectBucket = (buck: Bucket) => {
    event('bucketSelected', {search: searchTerm.length})
    selectBucket(buck)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  let buttonText = 'Loading buckets...'
  if (loading === RemoteDataState.Done && !selectedBucket?.name) {
    buttonText = 'Select bucket...'
  } else if (loading === RemoteDataState.Done && selectedBucket?.name) {
    buttonText = selectedBucket.name
  }

  const button = (active, onClick) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      testID="bucket-selector--dropdown-button"
    >
      {buttonText}
    </Dropdown.Button>
  )

  if (loading !== RemoteDataState.Done) {
    return (
      <div>
        <SelectorTitle title="Bucket" info={BUCKET_TOOLTIP} />
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

  let body: JSX.Element | JSX.Element[] = (
    <Dropdown.ItemEmpty>No Buckets Found</Dropdown.ItemEmpty>
  )

  if (_buckets.length) {
    body = Object.entries(
      _buckets.reduce((acc, curr) => {
        if (!acc[curr.type]) {
          acc[curr.type] = []
        }

        acc[curr.type].push(curr)
        return acc
      }, {}) as Record<string, Bucket[]>
    ).map(([k, v]) => {
      const items = v.map(bucket => (
        <Dropdown.Item
          key={bucket.name}
          value={bucket}
          onClick={handleSelectBucket}
          selected={bucket.name === selectedBucket?.name}
          title={bucket.name}
          wrapText={true}
          testID={`bucket-selector--dropdown--${bucket.name}`}
        >
          {bucket.name}
        </Dropdown.Item>
      ))

      let name = k

      if (REMAP_BUCKET_TYPES.hasOwnProperty(k)) {
        name = REMAP_BUCKET_TYPES[k]
      }

      return (
        <Fragment key={name}>
          <Dropdown.Divider text={name} />
          {items}
        </Fragment>
      )
    })
  }

  return (
    <div>
      <SelectorTitle title="Bucket" info={BUCKET_TOOLTIP} />
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
                onChange={handleChange}
                onBlur={() => setIsSearchActive(false)}
                value={searchTerm}
                placeholder="Search buckets"
                size={ComponentSize.Small}
                autoFocus={true}
                testID="bucket-selector--search-bar"
              />
            </div>
            {body}
          </Dropdown.Menu>
        )}
      />
    </div>
  )
}

export default BucketSelector
