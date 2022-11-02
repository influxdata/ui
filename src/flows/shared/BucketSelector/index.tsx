// Libraries
import React, {CSSProperties, FC, useContext, useEffect} from 'react'

// Components
import {
  TechnoSpinner,
  ComponentSize,
  RemoteDataState,
  Dropdown,
  IconFont,
} from '@influxdata/clockface'
import CreateBucketDropdownItem from 'src/flows/shared/BucketSelector/CreateBucketDropdownItem'

// Contexts
import {BucketContext} from 'src/shared/contexts/buckets'

// Types
import {Bucket} from 'src/types'

const REMAP_BUCKET_TYPES = {
  user: 'My Data',
  system: 'System Data',
  sample: 'Sample Data',
}

interface Props {
  selected: Bucket
  onSelect: (bucket: Bucket) => void
  testID?: string
  style?: CSSProperties
}

const BucketSelector: FC<Props> = ({
  selected,
  onSelect,
  testID = 'flow-bucket-selector',
  style = {},
}) => {
  const {buckets, loading, refresh} = useContext(BucketContext)
  let buttonText = 'Loading buckets...'

  useEffect(() => {
    if (loading !== RemoteDataState.Done) {
      return
    }

    if (!selected || buckets.find(bucket => bucket.name === selected.name)) {
      return
    }

    onSelect(null)
  }, [buckets, onSelect])

  const addBucket = (bucket: Bucket) => {
    refresh()
    onSelect(bucket)
  }

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (loading === RemoteDataState.Done && buckets.length) {
    const body = Object.entries(
      buckets.reduce((acc, curr) => {
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
          onClick={onSelect}
          selected={bucket.name === selected?.name}
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
        <React.Fragment key={name}>
          <Dropdown.Divider text={name} />
          {items}
        </React.Fragment>
      )
    })

    menuItems = (
      <>
        <CreateBucketDropdownItem
          onUpdateBucket={addBucket}
          testID={`${testID}--create`}
        />
        <Dropdown.Divider />
        {body}
      </>
    )
  }

  if (loading === RemoteDataState.Done && !selected?.name) {
    buttonText = 'Choose a bucket'
  } else if (loading === RemoteDataState.Done && selected?.name) {
    buttonText = selected.name
  }

  const button = (active, onClick) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      icon={IconFont.BucketSolid}
      testID={testID}
    >
      {buttonText}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return <Dropdown button={button} menu={menu} style={style} />
}

export default BucketSelector
