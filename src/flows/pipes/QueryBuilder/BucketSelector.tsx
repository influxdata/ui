// Libraries
import React, {FC, useState, useContext} from 'react'

// Components
import {Input, ComponentSize, List, Gradients} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import {BucketContext} from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'

const BucketSelector: FC = () => {
  const {data, update} = useContext(PipeContext)
  const {loading, buckets} = useContext(BucketContext)

  const [search, setSearch] = useState('')

  const selectBucket = (item: string): void => {
    data.buckets = [item]
    update(data)
  }

  if (loading === RemoteDataState.Done && !buckets.length) {
    return (
      <BuilderCard testID="bucket-selector">
        <BuilderCard.Header title="From" />
        <BuilderCard.Empty>No buckets found</BuilderCard.Empty>
      </BuilderCard>
    )
  }

  const filteredBuckets = buckets
    .map(bucket => bucket.name)
    .filter(
      bucket =>
        !search.length ||
        bucket.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    )

  if (!filteredBuckets.length) {
    return (
      <BuilderCard testID="bucket-selector">
        <BuilderCard.Header title="From" />
        <BuilderCard.Menu>
          <Input
            value={search}
            placeholder="Search for a bucket"
            className="tag-selector--search"
            onChange={e => setSearch(e.target.value)}
          />
        </BuilderCard.Menu>
        <BuilderCard.Empty>No buckets matched your search</BuilderCard.Empty>
      </BuilderCard>
    )
  }

  return (
    <BuilderCard testID="bucket-selector">
      <BuilderCard.Header title="From" />
      <BuilderCard.Menu>
        <Input
          value={search}
          placeholder="Search for a bucket"
          className="tag-selector--search"
          onChange={e => setSearch(e.target.value)}
        />
      </BuilderCard.Menu>
      <List
        autoHideScrollbars={true}
        testID="buckets-list"
        style={{flex: '1 0 0'}}
      >
        {filteredBuckets.map(item => {
          const selected = data.buckets.includes(item)

          const title = selected
            ? 'Click to remove this filter'
            : `Click to filter by ${item}`

          return (
            <List.Item
              className="selector-list--item"
              testID={`selector-list ${item}`}
              key={item}
              value={item}
              onClick={selectBucket}
              title={title}
              selected={selected}
              size={ComponentSize.ExtraSmall}
              gradient={Gradients.GundamPilot}
              wrapText={false}
            >
              {item}
            </List.Item>
          )
        })}
      </List>
    </BuilderCard>
  )
}

export default BucketSelector
