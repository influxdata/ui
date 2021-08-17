// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Constants
import {GIT_SHA} from 'src/shared/constants'

// Thunks
import {fetchVersionInfo} from 'src/shared/thunks/app'

// Selectors
import {getVersionInfo} from 'src/shared/selectors/app'

const VersionInfoOSS: FC = () => {
  const dispatch = useDispatch()

  const versionInfo = useSelector(getVersionInfo)

  useEffect(() => {
    dispatch(fetchVersionInfo())
  }, [dispatch])

  return (
    <>
      InfluxDB {versionInfo.version}
      <br />
      Server:{' '}
      <code>
        <a
          href={`https://github.com/influxdata/influxdb/tree/${versionInfo.commit}`}
        >
          {versionInfo.commit && versionInfo.commit.slice(0, 7)}
        </a>
      </code>
      <br />
      Frontend:{' '}
      <code>
        <a
          href={`https://github.com/influxdata/ui/tree/${GIT_SHA.slice(0, 7)}`}
        >
          {GIT_SHA.slice(0, 7)}
        </a>
      </code>
    </>
  )
}

export default VersionInfoOSS
