// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

// Components
import {
  Panel,
  ComponentSize,
  Heading,
  HeadingElement,
  Gradients,
  JustifyContent,
  Icon,
  IconFont,
} from '@influxdata/clockface'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'

// Constants
import {shouldShowUpgradeButton} from 'src/me/selectors'

const CloudUpgradeNavBanner: FC = () => {
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  return (
    <>
      {showUpgradeButton && (
        <CloudOnly>
          <Panel
            gradient={Gradients.HotelBreakfast}
            className="cloud-upgrade-banner"
          >
            <Panel.Header
              size={ComponentSize.ExtraSmall}
              justifyContent={JustifyContent.Center}
            >
              <Heading element={HeadingElement.H5}>
                Need more wiggle room?
              </Heading>
            </Panel.Header>
            <Panel.Footer size={ComponentSize.ExtraSmall}>
              <Link
                className="cf-button cf-button-md cf-button-primary cf-button-stretch cloud-upgrade-banner--button upgrade-payg--button__nav"
                to="/checkout"
              >
                Upgrade Now
              </Link>
            </Panel.Footer>
          </Panel>
          <Link className="cloud-upgrade-banner__collapsed" to="/checkout">
            <Icon glyph={IconFont.CrownSolid_New} />
            <Heading element={HeadingElement.H5}>Upgrade Now</Heading>
          </Link>
        </CloudOnly>
      )}
    </>
  )
}

export default CloudUpgradeNavBanner
