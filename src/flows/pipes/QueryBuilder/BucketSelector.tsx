// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'

// Components
import {Input, ComponentSize, List, Gradients} from '@influxdata/clockface'
import {Bucket, RemoteDataState} from 'src/types'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import {BucketContext} from 'src/flows/context/bucket.scoped'
import {PipeContext} from 'src/flows/context/pipe'

// this is used by notebooks
const BucketSelector: FC = () => {
  const {data, update} = useContext(PipeContext)
  const {loading, buckets, addBucket} = useContext(BucketContext)

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const bucks = data.buckets.filter(b => !!b)
    if (!selected && bucks.length) {
      setSelected(bucks[0].name)
    }
  }, [selected, data.buckets])

  useEffect(() => {
    const allBuckets = new Set(buckets.map(b => b.name))
    data.buckets
      .filter(b => !allBuckets.has(b.name))
      .forEach(b => {
        addBucket({
          name: b.name,
          type: b.type,
        } as Bucket)
      })
  }, [buckets, data.buckets])

  const selectBucket = (item?: string): void => {
    let bucket
    if (!item) {
      data.buckets = []
    } else if (item !== selected) {
      data.buckets = [buckets.find(b => b.name === item)]
      bucket = item
    } else {
      data.buckets = []
      bucket = null
    }

    data.tags = []
    update(data)
    if (item) {
      setSelected(bucket)
    }
  }

  if (loading === RemoteDataState.Done && !buckets.length) {
    return (
      <BuilderCard testID="bucket-selector">
        <BuilderCard.Header title="From" />
        <BuilderCard.Empty>No buckets found</BuilderCard.Empty>
      </BuilderCard>
    )
  }

  const filteredBuckets = buckets.filter(
    bucket =>
      !search.length ||
      bucket.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
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

  const sections = filteredBuckets.reduce(
    (acc, curr) => {
      acc[curr.type].push(curr)
      return acc
    },
    {user: [], system: [], sample: []}
  )

  const renderListItem = item => {
    const isSelected = selected === item.name
    const title = isSelected
      ? 'Click to remove this filter'
      : `Click to filter by ${item.name}`

    return (
      <List.Item
        className="selector-list--item"
        testID={`selector-list ${item.name}`}
        key={item.name}
        value={item.name}
        onClick={selectBucket}
        title={title}
        selected={isSelected}
        size={ComponentSize.ExtraSmall}
        gradient={Gradients.GundamPilot}
        wrapText={false}
      >
        {item.name}
      </List.Item>
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
          onClear={() => setSearch('')}
        />
      </BuilderCard.Menu>
      <List
        autoHideScrollbars={true}
        testID="buckets-list"
        style={{flex: '1 0 0'}}
        scrollToSelected={true}
      >
        {sections.user.length && (
          <List.Divider
            key="userHeader"
            text="user"
            size={ComponentSize.ExtraSmall}
          />
        )}
        {sections.user.map(renderListItem)}
        {sections.system.length && (
          <List.Divider
            key="systemHeader"
            text="system"
            size={ComponentSize.ExtraSmall}
          />
        )}
        {sections.system.map(renderListItem)}
        {sections.sample.length && (
          <List.Divider
            key="sampleHeader"
            text="sample"
            size={ComponentSize.ExtraSmall}
          />
        )}
        {sections.sample.map(renderListItem)}
      </List>
    </BuilderCard>
  )
}

export default BucketSelector
