// Libraries
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  createElement,
} from 'react'
import {Button, ComponentColor} from '@influxdata/clockface'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PipeProvider} from 'src/flows/context/pipe'
import Pipe from 'src/flows/components/Pipe'

// Components
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import ClientList from 'src/flows/components/ClientList'

import {Props} from 'src/flows/components/panel/FlowPanel'
import {FlowPipeProps} from 'src/flows/components/FlowPipe'
import {PipeContextProps} from 'src/types/flows'
import {PIPE_DEFINITIONS} from 'src/flows'

interface ButtonProps {
  id: string
}

const ExportButton: FC<ButtonProps> = ({id}) => {
  const {flow} = useContext(FlowContext)
  const {id: focused, show, hideSub, submenu, showSub} = useContext(
    SidebarContext
  )
  const ref = useRef<HTMLDivElement>()

  const toggleSidebar = evt => {
    evt.preventDefault()

    if (id !== focused) {
      show(id)
      showSub(<ClientList />)
    } else {
      hideSub()
    }
  }

  useEffect(() => {
    if (!focused || id !== focused) {
      return
    }

    const clickoutside = evt => {
      if (ref.current && ref.current.contains(evt.target)) {
        return
      }

      // TODO: wish we had a better way of canceling these events
      if (evt.target.closest('.flow-sidebar')) {
        return
      }

      if (evt.target.closest('.cf-overlay--container')) {
        return
      }

      hideSub()
    }

    document.addEventListener('mousedown', clickoutside)

    return () => {
      document.removeEventListener('mousedown', clickoutside)
    }
  }, [focused, submenu])

  if (!PIPE_DEFINITIONS[flow.data.byID[id].type]?.source) {
    return null
  }

  return (
    <div ref={ref}>
      <Button
        text="Export"
        onClick={toggleSidebar}
        color={
          id === focused ? ComponentColor.Secondary : ComponentColor.Default
        }
        className="flow-config-panel-button"
        testID="square-button"
      />
    </div>
  )
}

const FlowPanel: FC<Props> = ({id, children}) => {
  const {flow} = useContext(FlowContext)
  const {id: focused} = useContext(SidebarContext)

  const isVisible = flow.meta.byID[id].visible

  const panelClassName = [
    ['flow-panel', true],
    ['flow-panel__readonly', true],
    [`flow-panel__${isVisible ? 'visible' : 'hidden'}`, true],
    ['flow-panel__focus', focused === id],
  ]
    .filter(c => !!c[1])
    .map(c => c[0])
    .join(' ')

  if (
    flow.readOnly &&
    !/^(visualization|markdown)$/.test(flow.data.byID[id].type)
  ) {
    return null
  }

  return (
    <div className={panelClassName} style={{marginBottom: '16px'}}>
      <div className="flow-panel--header">
        <div className="flow-panel--title">{flow.meta.byID[id].title}</div>
        {!flow.readOnly && (
          <div className="flow-panel--persistent-control">
            <ExportButton id={id} />
          </div>
        )}
      </div>
      {isVisible && <div className="flow-panel--body">{children}</div>}
      <div className="flow-panel--footer">
        <div></div>
      </div>
    </div>
  )
}

const FlowPipe: FC<FlowPipeProps> = ({id}) => {
  const panel: FC<PipeContextProps> = useMemo(
    () => props => {
      const _props = {
        ...props,
        id,
      }

      return createElement(FlowPanel, _props)
    },
    [id]
  )

  return (
    <PipeProvider id={id}>
      <Pipe Context={panel} readOnly />
    </PipeProvider>
  )
}

const ReadOnlyPipeList: FC = () => {
  const {flow} = useContext(FlowContext)

  if (!flow.data || !flow.data.allIDs.length) {
    return <EmptyPipeList />
  }

  const _pipes = flow.data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return <div className="flow">{_pipes}</div>
}

export default ReadOnlyPipeList
