// Libraries
import React, {FC, useContext, ReactNode} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface Props {
  children: ReactNode
  title: string
}

const AnnotationOverlay: FC<Props> = ({children, title}) => {
  const {onClose} = useContext(OverlayContext)

  // TODO: Wrap children with getResources ResourceType.AnnotationStream
  // in case this overlay is accessed via URL and streams aren't in redux yet

  return (
    <Overlay.Container maxWidth={560}>
      <Overlay.Header title={title} onDismiss={onClose} />
      {children}
    </Overlay.Container>
  )
}

export default AnnotationOverlay
