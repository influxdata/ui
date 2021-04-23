import React, {FC, useMemo, useCallback, useContext} from 'react'
import {default as StatelessAutoRefreshDropdown} from 'src/shared/components/dropdown_auto_refresh/AutoRefreshDropdown'
import {FlowContext} from 'src/flows/context/flow.current'
import {AutoRefreshStatus} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'

const AutoRefreshDropdown: FC = () => {
  const {update, flow} = useContext(FlowContext)

  const updateRefresh = useCallback(
    (interval: number) => {
      const status =
        interval === 0 ? AutoRefreshStatus.Paused : AutoRefreshStatus.Active

      event('Auto Refresh Updated', {
        interval: '' + interval,
      })

      update({
        refresh: {
          status,
          interval,
          infiniteDuration: false,
        },
      })
    },
    [update]
  )

  return useMemo(() => {
    return (
      <StatelessAutoRefreshDropdown
        selected={flow.refresh}
        onChoose={updateRefresh}
      />
    )
  }, [flow, updateRefresh])
}

export default AutoRefreshDropdown
