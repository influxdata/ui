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

export const AnnotationStreamOverlay: FC<Props> = ({children, title}) => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={940}>
      <Overlay.Header title={title} onDismiss={onClose} />
      {/* TODO: wrap children in GetResources with ResourceType.AnnotationStreams */}
      {children}
    </Overlay.Container>
  )
}
