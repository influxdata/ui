import React, {FC} from 'react'
import OverlayProvider from 'src/operator/context/overlay'
import {OrgOverlay} from 'src/operator/OrgOverlay'

const OrgOverlayWrapper: FC = () => (
  <OverlayProvider>
    <OrgOverlay />
  </OverlayProvider>
)

export default OrgOverlayWrapper
