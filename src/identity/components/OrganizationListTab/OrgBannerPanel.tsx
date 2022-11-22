// Libraries
import React, {FC} from 'react'
import {BannerPanel, FlexBox, Gradients, IconFont} from '@influxdata/clockface'

// Styles
import './OrgBannerPanel.scss'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Types
interface OrgAllowance {
  availableUpgrade: string
  isAtOrgLimit: boolean
}

export const OrgBannerPanel: FC<OrgAllowance> = ({
  availableUpgrade,
  isAtOrgLimit,
}) => {
  let upgradePage = '/'

  if (availableUpgrade === 'pay_as_you_go') {
    upgradePage = `${CLOUD_URL}/checkout`
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
              href={upgradePage}
              className="account-settings-page-org-tab--quota-limit-link"
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
