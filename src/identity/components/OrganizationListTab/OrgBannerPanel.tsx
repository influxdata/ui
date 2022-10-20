import React, {FC} from 'react'
import {BannerPanel, FlexBox, Gradients, IconFont} from '@influxdata/clockface'
import './OrgBannerPanel.scss'

interface Props {
  isAtOrgLimit: boolean
  canUpgrade: boolean
}

export const OrgBannerPanel: FC<Props> = (isAtOrgLimit, canUpgrade) => {
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
        {isAtOrgLimit && canUpgrade && (
          <>
            <a
              href="/"
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
