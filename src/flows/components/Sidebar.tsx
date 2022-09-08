import React, {FC, useEffect, useContext, useRef} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  Button,
  ComponentColor,
  IconFont,
  DapperScrollbars,
  Dropdown,
} from '@influxdata/clockface'
import {ControlSection, ControlAction, Submenu} from 'src/types/flows'
import ClientList from 'src/flows/components/ClientList'

// Context
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'

// Utils & Actions
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'

// Constants
import {
  panelCopyLinkSuccess,
  panelCopyLinkFail,
} from 'src/shared/copy/notifications'
import {PIPE_DEFINITIONS} from 'src/flows'

import './Sidebar.scss'

export const SubSideBar: FC = () => {
  const {flow} = useContext(FlowContext)
  const {submenu, hideSub} = useContext(SidebarContext)

  if (!submenu || flow.readOnly) {
    return null
  }

  return (
    <div className="flow-sidebar">
      <div className="flow-sidebar--buttons">
        <button
          className="cf-overlay--dismiss"
          type="button"
          onClick={() => {
            event('Closing Submenu')
            hideSub()
          }}
        ></button>
      </div>
      <div className="flow-sidebar--submenu">
        <div className="flow-sidebar--submenu-wrapper">{submenu}</div>
      </div>
    </div>
  )
}

interface ButtonProps {
  id: string
}

export const MenuButton: FC<ButtonProps> = ({id}) => {
  const {id: focused, show, hide, submenu} = useContext(SidebarContext)
  const ref = useRef<HTMLDivElement>()

  const toggleSidebar = evt => {
    evt.preventDefault()
    if (id !== focused) {
      event('Sidebar Toggle Clicked', {state: 'opening'})

      show(id)
    } else {
      event('Sidebar Toggle Clicked', {state: 'hidding'})
      hide()
    }
  }

  useEffect(() => {
    if (!focused || id !== focused) {
      return
    }

    const clickoutside = evt => {
      if (submenu || (ref.current && ref.current.contains(evt.target))) {
        return
      }

      hide()
    }

    document.addEventListener('mousedown', clickoutside)

    return () => {
      document.removeEventListener('mousedown', clickoutside)
    }
  }, [focused, submenu])

  let dropdown

  if (id === focused && !submenu) {
    dropdown = <Sidebar />
  }

  return (
    <div ref={ref} style={{position: 'relative'}}>
      <Button
        icon={IconFont.More}
        onClick={toggleSidebar}
        color={
          id === focused ? ComponentColor.Secondary : ComponentColor.Default
        }
        className="flow-config-panel-button"
        testID="sidebar-button"
      />
      {dropdown}
    </div>
  )
}

const Sidebar: FC = () => {
  const {flow, updateMeta, add, remove} = useContext(FlowContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {id, hide, menu, showSub} = useContext(SidebarContext)
  const dispatch = useDispatch()
  const {source, visual} = getPanelQueries(id)

  const sections = (
    [
      {
        title: '',
        actions: [
          {
            title: 'Delete',
            action: () => {
              const {type} = flow.data.byID[id]
              event('notebook_delete_cell', {notebooksCellType: type})

              remove(id)
            },
          },
          {
            title: 'Duplicate',
            action: () => {
              const data = flow.data.byID[id]
              const meta = flow.meta.byID[id]

              data.title = meta.title

              event('Notebook Panel Cloned', {notebooksCellType: data.type})

              add(data, flow.data.allIDs.indexOf(id))
            },
          },
          {
            title: () => {
              if (!flow.meta.allIDs.includes(id)) {
                return 'Hide Panel'
              }

              if (flow.meta.byID[id].visible) {
                return 'Hide Panel'
              }
              return 'Show Panel'
            },
            action: () => {
              event('Panel Visibility Toggled', {
                state: !flow.meta.byID[id].visible ? 'true' : 'false',
              })

              updateMeta(id, {
                visible: !flow.meta.byID[id].visible,
              })
            },
          },
          {
            title: 'Convert to |> Flux',
            disable: () => {
              return !source
            },
            hidden: () => {
              if (!flow.data.allIDs.includes(id)) {
                return true
              }

              const {type} = flow.data.byID[id]

              if (type === 'rawFluxEditor') {
                return true
              }

              if (
                !/^(inputs|transform)$/.test(PIPE_DEFINITIONS[type]?.family)
              ) {
                return true
              }

              return false
            },
            action: () => {
              const {type} = flow.data.byID[id]
              const {title} = flow.meta.byID[id]

              event('Convert Cell To Flux', {from: type})

              const init = JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['rawFluxEditor'].initial)
              )
              init.queries[0].text =
                type === 'visualization' && visual ? visual : source
              init.title = title
              init.type = 'rawFluxEditor'

              add(init, flow.data.allIDs.indexOf(id))
              remove(id)
            },
          },
          {
            title: 'Export to Client Library',
            menu: (
              <DapperScrollbars>
                <ClientList />
              </DapperScrollbars>
            ),
            disable: () => {
              return !source
            },
            hidden: () => {
              if (!flow.data.allIDs.includes(id)) {
                return true
              }

              const {type} = flow.data.byID[id]

              if (!/^(inputs)$/.test(PIPE_DEFINITIONS[type]?.family)) {
                return true
              }

              return false
            },
          },
          {
            title: 'Link to Panel',
            action: () => {
              const {type} = flow.data.byID[id]
              event('notebook_share_panel', {notebooksCellType: type})
              const url = new URL(
                `${window.location.origin}${window.location.pathname}?panel=${id}`
              ).toString()
              try {
                navigator.clipboard.writeText(url)
                event('panel_share_success', {notebooksCellType: type})
                dispatch(notify(panelCopyLinkSuccess()))
              } catch {
                event('panel_share_failure', {notebooksCellType: type})
                dispatch(notify(panelCopyLinkFail()))
              }
            },
          },
          {
            title: 'Link to Source',
            disable: () => {
              return !source
            },
            hidden: () => {
              if (!flow.data.allIDs.includes(id)) {
                return true
              }
              const {type} = flow.data.byID[id]

              if (
                !/^(inputs|transform)$/.test(PIPE_DEFINITIONS[type]?.family)
              ) {
                return true
              }

              return false
            },
            action: () => {
              const {type} = flow.data.byID[id]
              event('notebook source link', {notebooksCellType: type})
              const url = new URL(
                `${window.location.origin}/api/v2private/notebooks/${flow.id}/query/${id}`
              ).toString()
              try {
                navigator.clipboard.writeText(url)
                dispatch(notify(panelCopyLinkSuccess()))
              } catch {
                dispatch(notify(panelCopyLinkFail()))
              }
            },
          },
          {
            title: 'Link to Results',
            disable: () => {
              return !source
            },
            hidden: () => {
              if (!flow.data.allIDs.includes(id)) {
                return true
              }

              const {type} = flow.data.byID[id]

              if (
                !/^(inputs|transform)$/.test(PIPE_DEFINITIONS[type]?.family)
              ) {
                return true
              }

              return false
            },
            action: () => {
              const {type} = flow.data.byID[id]
              event('notebook result link', {notebooksCellType: type})
              const url = new URL(
                `${window.location.origin}/api/v2private/notebooks/${flow.id}/run/${id}`
              ).toString()
              try {
                navigator.clipboard.writeText(url)
                dispatch(notify(panelCopyLinkSuccess()))
              } catch {
                dispatch(notify(panelCopyLinkFail()))
              }
            },
          },
        ],
      },
    ] as ControlSection[]
  )
    .concat(menu)
    .map(section => {
      const links = section.actions
        .filter(action =>
          typeof action.hidden === 'function'
            ? !action.hidden()
            : !action.hidden
        )
        .map(action => {
          let title

          const active =
            typeof action.disable === 'function'
              ? !action.disable()
              : !action.disable

          if (typeof action.title === 'function') {
            title = action.title()
          } else {
            title = action.title
          }

          if (!active) {
            return (
              <Dropdown.Item
                title={title}
                id={title}
                key={title}
                testID={`${title}--list-item`}
                disabled
              >
                {title}
              </Dropdown.Item>
            )
          }

          if (action.hasOwnProperty('menu')) {
            return (
              <Dropdown.Item
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
              </Dropdown.Item>
            )
          }

          return (
            <Dropdown.Item
              onClick={() => {
                const title =
                  typeof action.title === 'function'
                    ? action.title()
                    : action.title
                event('Notebook Nav: Called Action', {menu: title})
                // eslint-disable-next-line no-extra-semi
                ;(action as ControlAction).action()

                hide()
              }}
              wrapText={false}
              title={title}
              id={title}
              key={title}
              testID={`${title}--list-item`}
            >
              {title}
            </Dropdown.Item>
          )
        })

      const sectionTitle =
        typeof section.title === 'function' ? section.title() : section.title
      return (
        <div
          key={sectionTitle}
          className="flow-sidebar--dropdownmenu-container"
        >
          {links}
        </div>
      )
    })

  return (
    <Dropdown.Menu
      className="flow-sidebar--dropdownmenu"
      style={{width: '200px'}}
    >
      {sections}
    </Dropdown.Menu>
  )
}

export default Sidebar
