// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'

// Components
import {Input, ComponentSize, List, Gradients} from '@influxdata/clockface'
import CreateBucket from 'src/flows/pipes/QueryBuilder/CreateBucket'
import {Bucket, RemoteDataState} from 'src/types'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import {QueryBuilderContext} from 'src/flows/pipes/QueryBuilder/context'
import {BucketContext} from 'src/shared/contexts/buckets'
import {PipeContext} from 'src/flows/context/pipe'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

// this is used by notebooks
const BucketSelector: FC = () => {
  const {data} = useContext(PipeContext)
  const {loading, buckets, addBucket} = useContext(BucketContext)
  const {selectBucket} = useContext(QueryBuilderContext)

  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading !== RemoteDataState.Done) {
      return
    }
    const allBuckets = new Set(buckets.map(b => b.name))
    const missingBuckets = data.buckets.filter(b => !allBuckets.has(b.name))
    missingBuckets.forEach(b => {
      addBucket(b as Bucket)
    })
  }, [loading, buckets, data.buckets])

  if (loading === RemoteDataState.Done && !buckets.length) {
    return (
      <BuilderCard testID="bucket-selector">
        <BuilderCard.Header title="From" />
        <BuilderCard.Empty>No buckets found</BuilderCard.Empty>
      </BuilderCard>
    )
  }
  const _selectBucket = (bucket?: string) => {
    if (bucket) {
      event('Query Builder Bucket Selected', {
        usedSearch: !!search.length ? 'yus' : 'nah',
      })
    }
    selectBucket(bucket)
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
            placeholder="Search buckets"
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

  const selected = data?.buckets[0]?.name
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
        onClick={_selectBucket}
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
          placeholder="Search buckets"
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
        <List.Divider
          key="userHeader"
          text="user"
          size={ComponentSize.ExtraSmall}
        />
        {sections.user.map(renderListItem)}
        {isFlagEnabled('sharedBucketCreator') && <CreateBucket />}
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
