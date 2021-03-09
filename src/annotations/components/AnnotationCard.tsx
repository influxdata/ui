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
import {AnnotationStream} from 'src/types'

interface Props {
  annotationStream: AnnotationStream
}

export const AnnotationCard: FC<Props> = ({annotationStream}) => {
  const org = useSelector(getOrg)
  const history = useHistory()

  const handleNameClick = (): void => {
    history.push(
      `/orgs/${org.id}/settings/annotations/${annotationStream.stream}/edit`
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
            backgroundColor="#9078E4"
            style={{marginRight: '4px'}}
          />
        </>
        <>Created at {annotationStream.createdAt ?? null}</>
        <>Last modified {annotationStream?.updatedAt ?? null}</>
      </ResourceCard.Meta>
      {/* Labels go here */}
    </ResourceCard>
  )
}
