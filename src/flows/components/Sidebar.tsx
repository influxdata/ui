import React, {FC, useContext} from 'react'
import {List, Button, DapperScrollbars} from '@influxdata/clockface'
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
  const {id, show, hide, menu, submenu, showSub, hideSub} = useContext(
    SidebarContext
  )

  if (!id || flow.readOnly) {
    return null
  }

  if (submenu) {
    return (
      <div className="flow-sidebar">
        <Button
          text="Back"
          onClick={() => {
            event('Closing Submenu')
            hideSub()
          }}
        >
          Back
        </Button>
        <div className="flow-sidebar--submenu">
          <DapperScrollbars noScrollX={true}>{submenu}</DapperScrollbars>
        </div>
      </div>
    )
  }

  const sections = ([
    {
      title: 'Panel',
      actions: [
        {
          title: 'Delete',
          action: () => {
            const {type} = flow.data.get(id)
            event('notebook_delete_cell', {notebooksCellType: type})

            hide()

            flow.data.remove(id)
            flow.meta.remove(id)
          },
        },
        {
          title: 'Duplicate',
          action: () => {
            const data = flow.data.get(id)
            const meta = flow.meta.get(id)

            data.title = meta.title

            event('Notebook Panel Cloned', {notebooksCellType: data.type})

            add(data, flow.data.indexOf(id))
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

            const init = JSON.parse(
              JSON.stringify(PIPE_DEFINITIONS['rawFluxEditor'].initial)
            )
            init.queries[0].text = source
            init.title = title
            init.type = 'rawFluxEditor'

            const _id = add(init, flow.data.indexOf(id))

            flow.data.remove(id)
            flow.meta.remove(id)

            show(_id)
          },
        },
        {
          title: 'Copy As',
          menu: <ClientList />,
        },
      ],
    },
  ] as ControlSection[])
    .concat(menu)
    .map(section => {
      const links = section.actions
        .filter(action =>
          typeof action.disable === 'function'
            ? !action.disable()
            : !action.disable
        )
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
                  const title =
                    typeof action.title === 'function'
                      ? action.title()
                      : action.title
                  event('Notebook Nav: Opened Submenu', {menu: title})
                  showSub((action as Submenu).menu)
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
                const title =
                  typeof action.title === 'function'
                    ? action.title()
                    : action.title
                event('Notebook Nav: Called Action', {menu: title})
                ;(action as ControlAction).action()
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

      const sectionTitle =
        typeof section.title === 'function' ? section.title() : section.title
      return (
        <div key={sectionTitle}>
          <List.Divider text={`${sectionTitle}:`} />
          {links}
        </div>
      )
    })

  return (
    <div className="flow-sidebar">
      <List>{sections}</List>
    </div>
  )
}

export default Sidebar
