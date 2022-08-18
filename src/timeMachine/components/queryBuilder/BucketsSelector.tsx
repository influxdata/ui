// Libraries
import React, {FunctionComponent, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import WaitingText from 'src/shared/components/WaitingText'
import SelectorList from 'src/timeMachine/components/SelectorList'
import SelectorListCreateBucket from 'src/timeMachine/components/SelectorListCreateBucket'
import {Input} from '@influxdata/clockface'

// Actions
import {selectBucket} from 'src/timeMachine/actions/queryBuilderThunks'

// Utils
import {getActiveQuery} from 'src/timeMachine/selectors'
import {getStatus} from 'src/resources/selectors'
import {getSortedBuckets} from 'src/buckets/selectors/index'
import {event} from 'src/cloud/utils/reporting'

// Types
import {AppState, ResourceType} from 'src/types'
import {RemoteDataState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const fb = term => bucket =>
  bucket.toLocaleLowerCase().includes(term.toLocaleLowerCase())

const BucketSelector: FunctionComponent<Props> = ({
  selectedBucket,
  sortedBucketNames,
  bucketsStatus,
  onSelectBucket,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const list = sortedBucketNames.filter(fb(searchTerm))

  const onSelect = (bucket: string) => {
    event('selected bucket in old query builder')
    onSelectBucket(bucket, true)
  }

  if (bucketsStatus === RemoteDataState.Error) {
    return <BuilderCard.Empty>Failed to load buckets</BuilderCard.Empty>
  }

  if (bucketsStatus === RemoteDataState.Loading) {
    return (
      <BuilderCard.Empty>
        <WaitingText text="Loading buckets" />
      </BuilderCard.Empty>
    )
  }

  if (bucketsStatus === RemoteDataState.Done && !sortedBucketNames.length) {
    return <BuilderCard.Empty>No buckets found</BuilderCard.Empty>
  }

  return (
    <>
      <BuilderCard.Menu>
        <Input
          value={searchTerm}
          placeholder="Search buckets"
          className="tag-selector--search"
          onChange={e => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
        />
      </BuilderCard.Menu>
      <Selector list={list} selected={selectedBucket} onSelect={onSelect} />
    </>
  )
}

interface SelectorProps {
  list: string[]
  selected: string
  onSelect: (bucket: string) => void
}

const Selector: FunctionComponent<SelectorProps> = ({
  list,
  selected,
  onSelect,
}) => {
  if (!list.length) {
    return <BuilderCard.Empty>No buckets matched your search</BuilderCard.Empty>
  }

  return (
    <SelectorList
      items={list}
      selectedItems={[selected]}
      onSelectItem={onSelect}
      multiSelect={false}
      testID="buckets-list"
    >
      <SelectorListCreateBucket />
    </SelectorList>
  )
}

const mstp = (state: AppState) => {
  const sortedBucketNames = getSortedBuckets(state).map(
    bucket => bucket.name || ''
  )
  const bucketsStatus = getStatus(state, ResourceType.Buckets)
  const selectedBucket =
    getActiveQuery(state).builderConfig.buckets[0] || sortedBucketNames[0]

  return {selectedBucket, sortedBucketNames, bucketsStatus}
}

const mdtp = {
  onSelectBucket: selectBucket,
}

const connector = connect(mstp, mdtp)

export default connector(BucketSelector)
