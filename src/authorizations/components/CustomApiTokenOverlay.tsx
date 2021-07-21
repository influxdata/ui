import React, {FC} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

interface OwnProps {
  onClose: () => void
}

export const CustomApiTokenOverlay: FC<OwnProps> = props => {
  const handleDismiss = () => {
    props.onClose()
  }
  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Generate a Personal Api Token"
        onDismiss={handleDismiss}
      />
    </Overlay.Container>
  )
}
