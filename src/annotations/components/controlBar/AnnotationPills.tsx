// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Selectors
import {getVisibleAnnotationStreams} from 'src/annotations/selectors'

// Components
import {AnnotationPill} from 'src/annotations/components/controlBar/AnnotationPill'

// Styles
import 'src/annotations/components/controlBar/AnnotationPills.scss'

export const AnnotationPills: FC = () => {
  const visibleStreams = useSelector(getVisibleAnnotationStreams)

  return (
    <div className="annotation-pills" data-testid="annotation-pills">
      {visibleStreams.map(stream => (
        <AnnotationPill
          key={stream.id}
          id={stream.id}
          name={stream.name}
          description={stream.description}
          color={stream.display.color}
        />
      ))}
    </div>
  )
}
