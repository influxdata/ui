// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Selectors
import {getVisibleAnnotationStreams} from 'src/annotations/selectors'

// Components
import AnnotationPill from 'src/annotations/components/controlBar/AnnotationPill'

const AnnotationPills: FC = () => {
  const visibleStreams = useSelector(getVisibleAnnotationStreams)

  return (
    <>
      {visibleStreams.map(stream => (
        <AnnotationPill
          key={stream.id}
          id={stream.id}
          name={stream.name}
          description={stream.description}
          color={stream.display.color}
        />
      ))}
    </>
  )
}

export default AnnotationPills
