// Libraries
import React, {FC} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import {AnnotationCard} from 'src/annotations/components/AnnotationCard'

// Types
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

// Mocks
import {AnnotationStream} from 'src/annotations/constants/mocks'

interface Props {
  annotationStreams: AnnotationStream[]
  emptyState: JSX.Element
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

export const AnnotationsList: FC<Props> = ({
  annotationStreams,
  emptyState,
  sortKey,
  sortDirection,
  sortType,
}) => {
  // TODO: use memoizeone to be consistent with other resource lists
  const sortedAnnotationStreams = getSortedResources<AnnotationStream>(
    annotationStreams,
    sortKey,
    sortDirection,
    sortType
  )

  return (
    <ResourceList>
      <ResourceList.Body emptyState={emptyState}>
        {sortedAnnotationStreams.map(stream => (
          <AnnotationCard key={stream.id} annotationStream={stream} />
        ))}
      </ResourceList.Body>
    </ResourceList>
  )
}
