// Libraries
import React, {CSSProperties, FC, useContext} from 'react'

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
import {BucketContext} from 'src/flows/context/buckets'

// Types
import {Bucket} from 'src/types'

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
  const {buckets, loading} = useContext(BucketContext)
  let buttonText = 'Loading buckets...'

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (loading === RemoteDataState.Done && buckets.length) {
    menuItems = (
      <>
        <CreateBucketDropdownItem
          onUpdateBucket={onSelect}
          testID={`${testID}--create`}
        />
        <Dropdown.Divider />
        {buckets.map(bucket => (
          <Dropdown.Item
            key={bucket.name}
            value={bucket}
            onClick={onSelect}
            selected={bucket.name === selected?.name}
            title={bucket.name}
            wrapText={true}
            testID={`${testID}--${bucket.name}`}
          >
            {bucket.name}
          </Dropdown.Item>
        ))}
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
