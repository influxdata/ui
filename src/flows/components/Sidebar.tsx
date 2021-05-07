import React, {FC, useContext} from 'react'
import {List} from '@influxdata/clockface'
import {FlowContext} from 'src/flows/context/flow.current'
import {Context as SidebarContext} from 'src/flows/context/sidebar'

import {event} from 'src/cloud/utils/reporting'

const Sidebar: FC = () => {
  const {flow} = useContext(FlowContext)
  const {id, controls} = useContext(SidebarContext)

  if (!id || flow.readOnly) {
    return null
  }

  const sections = [{
    title: 'Panel',
    actions: [{
      title: 'Convert to |> Flux',
      action: () => {
        const data = flow.data.get(id)

        event('Convert Cell To Flux', {from: data.type})

      },
      title: 'Delete',
      action: () => {
        event('notebook_delete_cell')

        flow.data.remove(id)
        flow.meta.remove(id)
      }
    }, {
      title: 'Duplicate',
      action: () => {
        // clone(focused)
      }
    }, {
      title: () => {
        if (flow.meta.indexOf(id) === -1) {
          return 'Hide'
        }

        if (flow.meta.get(id).visible) {
          return 'Hide'
        }
        return 'Visible'
      },
      action: () => {
        event('Panel Visibility Toggled', {
          state: !flow.meta.get(id).visible ? 'true' : 'false',
        })

        flow.meta.update(id, {
          visible: !flow.meta.get(id).visible,
        })
      }
    }]
  }]
  .concat(controls)
  .map(section => {
    const links = section.actions.map(action => {
      let title = action.title
      if (typeof action.title === 'function') {
        title = action.title()
      }

      return (
        <List.Item onClick={() => { action.action() }}
          wrapText={false}
          title={title}
          id={title}
          key={title}>
          {title}
        </List.Item>
      )
    })
    return (
      <div key={section.title}>
        <List.Divider text={`${section.title}:`} />
      {links}
      </div>
    )
  })

  return (
    <div className="flow-sidebar">
      <List>
        {sections}
      </List>
    </div>
  )
}

export default Sidebar
