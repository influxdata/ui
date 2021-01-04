// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  ResourceCard,
  ComponentSize,
  ComponentColor,
  ConfirmationButton,
  ButtonShape,
  IconFont,
  Bullet,
  InfluxColors,
} from '@influxdata/clockface'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Mocks
import {AnnotationStream} from 'src/annotations/constants/mocks'

interface Props {
  annotationStream: AnnotationStream
}

export const AnnotationCard: FC<Props> = ({annotationStream}) => {
  const org = useSelector(getOrg)
  const history = useHistory()

  const handleNameClick = (): void => {
    history.push(
      `/orgs/${org.id}/settings/annotations/${annotationStream.id}/edit`
    )
  }

  const handleDelete = (): void => {
    // Placeholder
  }

  return (
    <ResourceCard
      testID="resource-card annotation-stream"
      contextMenuInteraction="alwaysVisible"
      contextMenu={
        <ConfirmationButton
          shape={ButtonShape.Square}
          icon={IconFont.Trash}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Danger}
          confirmationButtonText="Delete"
          confirmationLabel="Are you sure?"
          onConfirm={handleDelete}
        />
      }
    >
      <ResourceCard.Name
        onClick={handleNameClick}
        name={annotationStream.name}
        testID={`annotation-stream-card--name ${annotationStream.name}`}
      />
      <ResourceCard.Description description={annotationStream.description} />
      <ResourceCard.Meta>
        <>
          <Bullet
            glyph={IconFont.Annotate}
            size={ComponentSize.ExtraSmall}
            color={InfluxColors.Castle}
            backgroundColor={annotationStream.display.color}
            style={{marginRight: '4px'}}
          />
          Streaming from {annotationStream.query.bucketName}
        </>
        <>Created at {annotationStream.meta.createdAt}</>
        <>Last modified {annotationStream.meta.updatedAt}</>
      </ResourceCard.Meta>
      {/* Labels go here */}
    </ResourceCard>
  )
}
