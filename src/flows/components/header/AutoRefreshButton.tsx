import React, {FC, useCallback, useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, ComponentColor} from '@influxdata/clockface'
import {PROJECT_NAME} from 'src/flows'
import {AppState, AutoRefreshStatus} from 'src/types'
import {resetAutoRefresh} from 'src/shared/actions/autoRefresh'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {GlobalAutoRefresher} from 'src/utils/AutoRefresher'
import {notify} from 'src/shared/actions/notifications'
import {autoRefreshTimeoutSuccess} from 'src/shared/copy/notifications'
import {event} from 'src/cloud/utils/reporting'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const AutoRefreshButton: FC = () => {
  const {flow} = useContext(FlowContext)
  const {queryAll} = useContext(FlowQueryContext)
  const dispatch = useDispatch()

  const autoRefresh = useSelector(
    (state: AppState) =>
      state.autoRefresh?.[`${PROJECT_NAME}-${flow?.id}`] ?? AUTOREFRESH_DEFAULT
  )

  const timeoutFunction = useCallback(() => {
    if (isFlagEnabled('flowAutoRefresh')) {
      dispatch(resetAutoRefresh(`${PROJECT_NAME}-${flow?.id}`))
      dispatch(notify(autoRefreshTimeoutSuccess()))
      GlobalAutoRefresher.onDisconnect()
      event('flow inactivitytimeout', {
        timeout: autoRefresh.inactivityTimeout,
      })
    }
  }, [autoRefresh.inactivityTimeout, flow?.id, dispatch])

  const startTimeout = useCallback(() => {
    if (isFlagEnabled('flowAutoRefresh')) {
      GlobalAutoRefresher.startTimeout(
        timeoutFunction,
        autoRefresh.inactivityTimeout
      )
    }
  }, [autoRefresh.inactivityTimeout, timeoutFunction])

  const stopFunc = useCallback(() => {
    if (isFlagEnabled('flowAutoRefresh')) {
      if (
        !autoRefresh.infiniteDuration &&
        new Date(autoRefresh?.duration?.upper).getTime() <= new Date().getTime()
      ) {
        GlobalAutoRefresher.stopPolling()
        dispatch(resetAutoRefresh(`${PROJECT_NAME}-${flow?.id}`))
      }
    }
  }, [
    flow?.id,
    dispatch,
    autoRefresh?.duration?.upper,
    autoRefresh.infiniteDuration,
  ])

  useEffect(() => {
    if (isFlagEnabled('flowAutoRefresh')) {
      if (autoRefresh?.status === AutoRefreshStatus.Active) {
        GlobalAutoRefresher.poll(autoRefresh, stopFunc)
        if (autoRefresh.inactivityTimeout > 0) {
          GlobalAutoRefresher.onDisconnect()
          startTimeout()
          GlobalAutoRefresher.onConnect()
        }
      } else {
        GlobalAutoRefresher.onDisconnect()
      }
    }

    return () => {
      if (isFlagEnabled('flowAutoRefresh')) {
        GlobalAutoRefresher.onDisconnect()
        GlobalAutoRefresher.stopPolling()
      }
    }
  }, [
    autoRefresh.interval,
    autoRefresh?.status,
    autoRefresh.inactivityTimeout,
    stopFunc,
    startTimeout,
  ])

  useEffect(() => {
    GlobalAutoRefresher.subscribe(queryAll)

    return () => GlobalAutoRefresher.unsubscribe(queryAll)
  }, [queryAll])

  const isActive = autoRefresh?.status === AutoRefreshStatus.Active

  return (
    <Button
      text={
        isActive ? `Refreshing Every ${autoRefresh?.label}` : 'Set Auto Refresh'
      }
      color={isActive ? ComponentColor.Secondary : ComponentColor.Default}
      onClick={
        isActive
          ? () => dispatch(resetAutoRefresh(`${PROJECT_NAME}-${flow?.id}`))
          : () =>
              dispatch(
                showOverlay(
                  'toggle-auto-refresh',
                  {id: `${PROJECT_NAME}-${flow?.id}`},
                  () => dispatch(dismissOverlay())
                )
              )
      }
      testID="enable-auto-refresh-button"
    />
  )
}

export default AutoRefreshButton
