// Libraries
import {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {updateReportingContext} from 'src/cloud/utils/reporting'
import {getQuartzMe} from 'src/me/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

interface Props {
  children: React.ReactElement<any>
}

const OrgSettings: FC<Props> = ({children}) => {
  const quartzMe = useSelector(getQuartzMe)
  const isRegionBeta = quartzMe?.isRegionBeta ?? false
  const accountType = quartzMe?.accountType ?? 'free'

  useEffect(() => {
    if (CLOUD) {
      updateReportingContext({
        'org (hide_upgrade_cta)': `${accountType === 'free' && !isRegionBeta}`,
        'org (account_type)': accountType,
      })
    }
  }, [accountType, isRegionBeta])

  return children
}

export default OrgSettings
