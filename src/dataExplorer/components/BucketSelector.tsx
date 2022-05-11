import React, {FC} from 'react'

import {Dropdown} from '@influxdata/clockface'

const BucketSelector: FC = () => {
  const buckets = [
    {name: 'Air Sensor Data'},
    {name: 'Coinbase Bitcoin Price'},
    {name: 'NOAA National Buoy Data'},
    {name: 'USGS Earthquakes'},
  ]
  let menuItems = <Dropdown.ItemEmpty>empty</Dropdown.ItemEmpty>

  if (buckets.length) {
    menuItems = (
      <>
        <Dropdown.Item>[ Search Bar ]</Dropdown.Item>
        {buckets.map(bucket => (
          <Dropdown.Item key={bucket.name} value={bucket}>
            {bucket.name}
          </Dropdown.Item>
        ))}
      </>
    )
  }
  const button = (active, onClick) => (
    <Dropdown.Button active={active} onClick={onClick}>
      Select bucket...
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )
  return <Dropdown button={button} menu={menu} />
}

export default BucketSelector
