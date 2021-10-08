// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {Page} from '@influxdata/clockface'
import {DapperScrollbars} from '@influxdata/clockface'

// Contexts
import CurrentFlowProvider from 'src/flows/context/flow.current'
import {RunModeProvider} from 'src/flows/context/runMode'
import QueryProvider from 'src/shared/contexts/query'
import {FlowQueryProvider} from 'src/flows/context/flow.query'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsProvider} from 'src/flows/context/results'
import {SidebarProvider} from 'src/flows/context/sidebar'

// Components
import PipeList from 'src/flows/components/PipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import FlowHeader from 'src/flows/components/header'
import FlowKeyboardPreview from 'src/flows/components/FlowKeyboardPreview'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'

import 'src/flows/style.scss'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import * as Y from 'yjs'
// import {WebsocketProvider} from 'y-websocket'
import {WebrtcProvider} from 'y-webrtc'
import {getMe} from 'src/me/selectors'

const FlowFromRoute = () => {
  const {id} = useParams<{id: string}>()
  const {change, flows, currentID} = useContext(FlowListContext)

  useEffect(() => {
    change(id)
  }, [id, change])

  document.title = pageTitleSuffixer([
    flows[currentID]?.name,
    PROJECT_NAME_PLURAL,
  ])

  return null
}

export const FlowPage: FC = () => {
  const me = useSelector(getMe)
  const {currentID} = useContext(FlowListContext)

  /**
   * Depending on how we intergrate this, this awareness can be a useful indicator of who is
   * currently online and actively using a flow.
   */
  const [awareness, setAwareness] = React.useState({})

  // TODO(ariel): the currentID is initialized to null, do we want to handle this here
  // or would we rather handle this in the flow page, and not the list?
  /**
   * TODO(ariel): the currentID is initialized to null, do we want to handle this here
   * or would we rather handle this in the flow page, and not the list?
   * Also, did we want to add an awareness as part of the WebsocketProvider params?
   * https://github.com/yjs/y-websocket#api
   * https://github.com/yjs/y-protocols
   */
  const yDoc = React.useMemo(() => new Y.Doc({guid: currentID}), [currentID])
  // const wsProvider = React.useMemo(
  //   () =>
  //     new WebsocketProvider(
  //       'ws://localhost:1234',
  //       currentID, // todo: fix the names here since it's returning API errors
  //       yDoc
  //     ),
  //   [currentID, yDoc]
  // )
  const provider = React.useRef<WebrtcProvider>()

  // const destroyConnectedWebsocket = React.useCallback(() => {
  //   if (wsProvider.wsconnecting) {
  //     wsProvider.destroy()
  //   }
  // }, [wsProvider])

  const connectWebSocket = React.useCallback(() => {
    // if (!wsProvider.wsconnected && !wsProvider.wsconnecting) {
    //   wsProvider.connect()
    // }
    // todo: fix the names here since it's causing API conflicts
    provider.current = new WebrtcProvider(currentID, yDoc)
    const user = {id: me.id, name: me.name}
    provider.current.awareness.setLocalStateField('user', user)
    setAwareness(prev => ({
      ...prev,
      ...user,
    }))

    provider.current.awareness.on('change', params => {
      console.log({params})
      /**
       * This onChange event can be useful to notify the other user that a change event
       * has occurred in the "awareness", meaning that another user is accessing notebooks
       *
       * This is NOT refined to an individual flow or panel
       */
      const states = provider.current?.awareness.getStates().entries()
      if (states) {
        const a = {}
        const copy = [...states]
        copy
          .filter(([, v]) => v.user != null)
          .forEach(([k, v]) => {
            a[k] = v
          })
        setAwareness(a)
      }
    })
  }, [currentID, me, yDoc])

  useEffect(() => {
    connectWebSocket()

    //   return () => {
    //     destroyConnectedWebsocket()
    //   }
  }, [connectWebSocket])

  console.log({awareness})

  return (
    <RunModeProvider>
      <ResultsProvider>
        <FlowQueryProvider>
          <FlowKeyboardPreview />
          <SidebarProvider>
            <Page>
              <FlowHeader />
              <Page.Contents
                fullWidth={true}
                scrollable={false}
                className="flow-page"
              >
                <PopupProvider>
                  <DapperScrollbars
                    noScrollX
                    thumbStartColor="gray"
                    thumbStopColor="gray"
                  >
                    <PipeList />
                  </DapperScrollbars>
                  <SubSideBar />
                  <PopupDrawer />
                </PopupProvider>
              </Page.Contents>
            </Page>
          </SidebarProvider>
        </FlowQueryProvider>
      </ResultsProvider>
    </RunModeProvider>
  )
}

export default () => (
  <QueryProvider>
    <CurrentFlowProvider>
      <FlowFromRoute />
      <FlowPage />
    </CurrentFlowProvider>
  </QueryProvider>
)
