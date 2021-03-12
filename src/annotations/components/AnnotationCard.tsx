// Libraries
import React, {FC} from 'react'

// Components
import {
  Bullet,
  ComponentSize,
  IconFont,
  InfluxColors,
  ResourceCard,
} from '@influxdata/clockface'

// Types
import {AnnotationStream} from 'src/types'

interface Props {
  annotationStream: AnnotationStream
}

export const AnnotationCard: FC<Props> = ({annotationStream}) => {
  return (
    <ResourceCard
      testID="resource-card annotation-stream"
      contextMenuInteraction="alwaysVisible"
    >
      <ResourceCard.Name
        name={annotationStream.stream}
        testID={`annotation-stream-card--name ${annotationStream.stream}`}
      />
      <ResourceCard.Description
        description={
          annotationStream.description ??
          'Add a description to your stream to see it here'
        }
      />
      <ResourceCard.Meta>
        <>
          <Bullet
            glyph={IconFont.Annotate}
            size={ComponentSize.ExtraSmall}
            color={InfluxColors.Castle}
            backgroundColor={annotationStream.color}
            style={{marginRight: '4px'}}
          />
        </>
        <>Created at {annotationStream.createdAt}</>
        <>Last modified {annotationStream.updatedAt}</>
      </ResourceCard.Meta>
    </ResourceCard>
  )
}
