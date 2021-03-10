// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Selectors
import {
  getAnnotationStreams,
  getVisibleAnnotationStreams,
} from 'src/annotations/selectors'

// Components
import {AnnotationPill} from 'src/annotations/components/controlBar/AnnotationPill'

// Styles
import 'src/annotations/components/controlBar/AnnotationPills.scss'

export const AnnotationPills: FC = () => {
  const visibleStreams = useSelector(getVisibleAnnotationStreams)
  const allStreams = useSelector(getAnnotationStreams)
  const toDisplayStreams = allStreams.filter(stream =>
    visibleStreams.includes(stream.stream)
  )
  return (
    <div className="annotation-pills" data-testid="annotation-pills">
      {toDisplayStreams.map(stream => (
        <AnnotationPill
          key={stream.stream}
          id={stream.stream}
          name={stream.stream}
          description={stream.description}
          color="#9078E4"
        />
      ))}
    </div>
  )
}
