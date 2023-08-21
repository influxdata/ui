// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import VersionInfoOSS from 'src/shared/components/VersionInfoOSS'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Constants
import {GIT_SHA, CLOUD} from 'src/shared/constants'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'

const VersionInfo: FC = () => {
  const isIOxOrg = useSelector(isOrgIOx)

  const versionNumber = isIOxOrg ? '3' : '2'
  const cloudEngine = isIOxOrg
    ? 'InfluxDB Cloud Serverless'
    : 'InfluxDB Cloud powered by TSM'
  const engineLink = isIOxOrg
    ? 'https://docs.influxdata.com/influxdb/cloud-serverless/'
    : 'https://docs.influxdata.com/influxdb/latest/reference/internals/storage-engine/#time-structured-merge-tree-tsm'

  return (
    <div className="version-info" data-testid="version-info">
      {CLOUD ? (
        <div>
          <SafeBlankLink href={engineLink}>{cloudEngine}</SafeBlankLink>
          <br />
          Storage Engine Version {versionNumber}{' '}
          {!isIOxOrg && GIT_SHA && <code>({GIT_SHA.slice(0, 7)})</code>}
        </div>
      ) : (
        <VersionInfoOSS />
      )}
    </div>
  )
}

export default VersionInfo
