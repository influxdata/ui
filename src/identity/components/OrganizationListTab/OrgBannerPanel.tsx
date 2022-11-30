// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {BannerPanel, FlexBox, Gradients, IconFont} from '@influxdata/clockface'

// Styles
import './OrgBannerPanel.scss'

// Types
import {availableUpgrade} from 'src/client/unityRoutes'

// Utils
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

interface OrgAllowance {
  availableUpgrade: availableUpgrade
  isAtOrgLimit: boolean
}

export const OrgBannerPanel: FC<OrgAllowance> = ({
  availableUpgrade,
  isAtOrgLimit,
}) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleUpgradeAccount = () => {
    if (availableUpgrade === 'pay_as_you_go') {
      history.push(`/checkout`)
    } else {
      dispatch(
        showOverlay('upgrade-to-contract-overlay', null, () =>
          dispatch(dismissOverlay())
        )
      )
    }
  }

  return (
    <BannerPanel
      className="account-settings-page-org-tab--upgrade-banner"
      gradient={Gradients.PolarExpress}
      hideMobileIcon={true}
      icon={IconFont.Info_New}
    >
      <FlexBox className="account-settings-page-org-tab--upgrade-banner-text">
        {isAtOrgLimit && (
          <>You've reached the organization quota for this account. &nbsp;</>
        )}
        {isAtOrgLimit && availableUpgrade !== 'none' && (
          <>
            <a
              onClick={handleUpgradeAccount}
              className="account-settings-page-org-tab--quota-limit-link"
              style={{cursor: 'pointer'}}
            >
              Upgrade
            </a>
            &nbsp;to add more organizations
          </>
        )}
      </FlexBox>
    </BannerPanel>
  )
}
