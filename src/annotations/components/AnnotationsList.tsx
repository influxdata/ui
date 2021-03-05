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

// Types
import {AnnotationStreamDetail} from 'src/types'

interface Props {
  emptyState: JSX.Element
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  annotationStreams: AnnotationStreamDetail[]
}

export const AnnotationsList: FC<Props> = ({
  emptyState,
  sortKey,
  sortDirection,
  sortType,
  annotationStreams,
}) => {
  const sortedAnnotationStreams = getSortedResources<AnnotationStreamDetail>(
    annotationStreams,
    sortKey,
    sortDirection,
    sortType
  )

  return (
    <ResourceList>
      <ResourceList.Body emptyState={emptyState}>
        {sortedAnnotationStreams.map(stream => (
          <AnnotationCard
            key={JSON.stringify(stream)}
            annotationStream={stream}
          />
        ))}
      </ResourceList.Body>
    </ResourceList>
  )
}
