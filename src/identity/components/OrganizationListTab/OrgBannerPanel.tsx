// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {BannerPanel, FlexBox, Gradients, IconFont} from '@influxdata/clockface'

// Styles
import './OrgBannerPanel.scss'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Selectors
import {selectOrgId} from 'src/identity/selectors'

// Types
import {OrgAllowanceResponse} from 'src/identity/apis/org'

interface Props {
  isAtOrgLimit: OrgAllowanceResponse['allowed']
  availableUpgrade: OrgAllowanceResponse['availableUpgrade']
}

export const OrgBannerPanel: FC<Props> = (isAtOrgLimit, availableUpgrade) => {
  const orgId = useSelector(selectOrgId)

  let upgradePage: string

  if (availableUpgrade === 'pay_as_you_go') {
    upgradePage = `${CLOUD_URL}/orgs/${orgId}`
  } else {
    // If availableUpgrade is contract, need to use marketo form once complete. See https://github.com/influxdata/ui/issues/6206.
    upgradePage = '/'
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
