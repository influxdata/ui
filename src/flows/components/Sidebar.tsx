import React, {FC, useContext} from 'react'
import {
  Button,
  DapperScrollbars,
  DropdownMenu,
  DropdownItem,
} from '@influxdata/clockface'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PIPE_DEFINITIONS} from 'src/flows'
import {ControlSection, ControlAction, Submenu} from 'src/types/flows'
import ClientList from 'src/flows/components/ClientList'
import './Sidebar.scss'
import {event} from 'src/cloud/utils/reporting'
export const SubSideBar: FC = () => {
  const {flow} = useContext(FlowContext)
  const {id, submenu, hideSub} = useContext(SidebarContext)
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
          <DapperScrollbars
            noScrollX={true}
            thumbStopColor="gray"
            thumbStartColor="gray"
          >
            {submenu}
          </DapperScrollbars>
        </div>
      </div>
    )
  } else {
    return null
  }
}

const Sidebar: FC = () => {
  const {flow, add} = useContext(FlowContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {id, show, hide, menu, showSub} = useContext(SidebarContext)

  const sections = ([
    {
      title: '',
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
              <DropdownItem
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
                testID={`${title}--list-item`}
              >
                {title}
              </DropdownItem>
            )
          }

          return (
            <DropdownItem
              onClick={() => {
                const title =
                  typeof action.title === 'function'
                    ? action.title()
                    : action.title
                event('Notebook Nav: Called Action', {menu: title})
                // eslint-disable-next-line no-extra-semi
                ;(action as ControlAction).action()
              }}
              wrapText={false}
              title={title}
              id={title}
              key={title}
              testID={`${title}--list-item`}
            >
              {title}
            </DropdownItem>
          )
        })

      const sectionTitle =
        typeof section.title === 'function' ? section.title() : section.title
      return <div key={sectionTitle}>{links}</div>
    })

  return (
    <DropdownMenu className="flows-sidebar--dropdownmenu">
      {sections}
    </DropdownMenu>
  )
}

export default Sidebar
