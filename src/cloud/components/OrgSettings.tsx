// Libraries
import {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Utils
import {updateReportingContext} from 'src/cloud/utils/reporting'
import {getCurrentOrgDetailsThunk} from 'src/identity/actions/thunks'
import {getQuartzMe} from 'src/me/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface Props {
  children: React.ReactElement<any>
}

const OrgSettings: FC<Props> = ({children}) => {
  const dispatch = useDispatch()

  const quartzMe = useSelector(getQuartzMe)
  const isRegionBeta = quartzMe?.isRegionBeta ?? false
  const accountType = quartzMe?.accountType ?? 'free'

  useEffect(() => {
    if (CLOUD && isFlagEnabled('quartzIdentity') && !quartzMe?.isRegionBeta) {
      dispatch(getCurrentOrgDetailsThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
