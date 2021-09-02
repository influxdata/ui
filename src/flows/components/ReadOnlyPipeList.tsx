// Libraries
import React, {FC, useContext, useEffect, useMemo, createElement} from 'react'
import classnames from 'classnames'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {SidebarContext} from 'src/flows/context/sidebar'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PipeProvider} from 'src/flows/context/pipe'
import Pipe from 'src/flows/components/Pipe'

// Components
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import {MenuButton} from 'src/flows/components/Sidebar'

import {Props} from 'src/flows/components/panel/FlowPanel'
import {FlowPipeProps} from 'src/flows/components/FlowPipe'
import {PipeContextProps} from 'src/types/flows'

const FlowPanel: FC<Props> = ({id, children}) => {
  const {flow} = useContext(FlowContext)
  const {id: focused} = useContext(SidebarContext)

  const isVisible = flow.meta.byID(id).visible

  const panelClassName = classnames('flow-panel', {
    'flow-panel__readonly': true,
    [`flow-panel__${isVisible ? 'visible' : 'hidden'}`]: true,
    'flow-panel__focus': focused === id,
  })

  if (
    flow.readOnly &&
    !/^(visualization|markdown)$/.test(flow.data.byID(id).type)
  ) {
    return null
  }

  return (
    <div className={panelClassName} style={{marginBottom: '16px'}}>
      <div className="flow-panel--header">
        <div className="flow-panel--title">{flow.meta.byID(id).title}</div>
        {!flow.readOnly && (
          <div className="flow-panel--persistent-control">
            <MenuButton id={id} />
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
      <Pipe Context={panel} />
    </PipeProvider>
  )
}

const ReadOnlyPipeList: FC = () => {
  const {flow} = useContext(FlowContext)
  const {queryAll} = useContext(FlowQueryContext)

  useEffect(() => {
    queryAll()
  }, [])

  if (!flow.data || !flow.data.allIDs.length) {
    return <EmptyPipeList />
  }

  const _pipes = flow.data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return <div className="flow">{_pipes}</div>
}

export default ReadOnlyPipeList
