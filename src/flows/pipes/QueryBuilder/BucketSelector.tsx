// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'

// Components
import {Input, ComponentSize, List, Gradients} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import {BucketContext} from 'src/flows/context/bucket.scoped'
import {PipeContext} from 'src/flows/context/pipe'

const BucketSelector: FC = () => {
  const {data, update} = useContext(PipeContext)
  const {loading, buckets} = useContext(BucketContext)

  const [search, setSearch] = useState('')

  const selectBucket = (item?: string): void => {
    if (!item) {
      data.buckets = []
    } else {
      data.buckets = [item]
    }

    data.tags = []

    update(data)
  }

  useEffect(() => {
    if (loading !== RemoteDataState.Done) {
      return
    }

    if (!data.buckets.length) {
      return
    }

    const bucks = buckets.reduce((acc, curr) => {
      acc[curr.name] = true
      return acc
    }, {})
    const filtered = data.buckets.filter(b => bucks.hasOwnProperty(b))

    if (data.buckets.length == filtered.length) {
      return
    }

    selectBucket()
  }, [buckets])

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
