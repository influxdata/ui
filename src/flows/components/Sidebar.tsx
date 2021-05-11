import React, {FC, useContext, useState} from 'react'
import {List, Button} from '@influxdata/clockface'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {Context as SidebarContext} from 'src/flows/context/sidebar'
import {PIPE_DEFINITIONS} from 'src/flows'
import {ControlSection, ControlAction, Submenu} from 'src/types/flows'
import ClientList from 'src/flows/components/ClientList'

import {event} from 'src/cloud/utils/reporting'

const Sidebar: FC = () => {
  const {flow, add} = useContext(FlowContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {id, show, hide, menu} = useContext(SidebarContext)
  const [submenu, setSubmenu]: [Submenu['menu'], (_?:Submenu['menu']) => void] = useState()

  if (!id || flow.readOnly) {
    return null
  }

  const sections = ([
    {
      title: 'Panel',
      actions: [
        {
          title: 'Convert to |> Flux',
          disable: () => {
            if (flow.data.indexOf(id) === -1) {
              return true
            }

            const {type} = flow.data.get(id)

            if (type === 'rawFluxEditor') {
              return true
            }

            return false
          },
          action: () => {
            const {type} = flow.data.get(id)
            const {title} = flow.meta.get(id)

            event('Convert Cell To Flux', {from: type})

            const {source} = getPanelQueries(id, true)

            const init = JSON.parse(JSON.stringify(PIPE_DEFINITIONS['rawFluxEditor'].initial))
            init.queries[0].text = source
            init.title = title
            init.type = 'rawFluxEditor'

            const _id = add(init, flow.data.indexOf(id))
            show(_id)

            flow.data.remove(id)
            flow.meta.remove(id)
          },
        }, {
          title: 'Delete',
          action: () => {
            event('notebook_delete_cell')

            hide()

            flow.data.remove(id)
            flow.meta.remove(id)
          },
        },
        {
          title: 'Duplicate',
          disable: true,
          action: () => {
            console.log('just wait')
            // clone(focused)
          },
        },
        {
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
          },
        },
        {
          title: 'Copy as',
          menu: <ClientList />
        }
      ],
    }, {
    }
  ] as ControlSection[])
    .concat(menu)
    .map(section => {
      const links = section.actions
      .filter(action => typeof action.disable === 'function' ? !action.disable() : !action.disable)
      .map(action => {
        let title

        if (typeof action.title === 'function') {
          title = action.title()
        } else {
          title = action.title
        }

        if (action.hasOwnProperty('menu')) {
          return (
          <List.Item
            onClick={() => {
              setSubmenu((action as Submenu).menu)
            }}
            wrapText={false}
            title={title}
            id={title}
            key={title}
          >
            {title}
          </List.Item>
          )
        }

        return (
          <List.Item
            onClick={() => {
              (action as ControlAction).action()
            }}
            wrapText={false}
            title={title}
            id={title}
            key={title}
          >
            {title}
          </List.Item>
        )
      })

      const sectionTitle = typeof section.title === 'function' ? section.title() : section.title
      return (
        <div key={sectionTitle}>
          <List.Divider text={`${sectionTitle}:`} />
          {links}
        </div>
      )
    })

    if (submenu) {
  return (
    <div className="flow-sidebar">
      <Button text="Back" onClick={()=>{setSubmenu(null)}}>Back</Button>
      <div className="flow-sidebar--submenu">{submenu}</div>
    </div>
  )
    }
  return (
    <div className="flow-sidebar">
      <List>{sections}</List>
    </div>
  )
}

export default Sidebar
