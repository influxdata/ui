import React, {FC, useContext, useEffect, useState} from 'react'
import {PipeContext} from 'src/flows/context/pipe'
import './styles.scss'
import {PipeProp} from 'src/types/flows'
import {
  ResourceCard,
  SlideToggle,
  FlexBox,
  FlexDirection,
  AlignItems,
  ComponentSize,
} from '@influxdata/clockface'

export interface TableColumnKey {
  name: string
  visible: boolean
}
const View: FC<PipeProp> = ({Context}) => {
  const [tableColumnKeys, setTableColumnKeys] = useState<{
    [_: string]: TableColumnKey
  }>({})

  const {update, data, results} = useContext(PipeContext)

  useEffect(() => {
    if (results?.parsed?.table) {
      setTableColumnKeys(
        results.parsed.table.columnKeys.reduce((a, b) => {
          if (!data.updatedTableKeys[b]) {
            a[b] = {name: b, visible: true}
          } else {
            a[b] = data.updatedTableKeys[b]
          }
          return a
        }, {})
      )
    }
  }, [results?.parsed?.table])

  useEffect(() => {
    update({
      updatedTableKeys: tableColumnKeys,
    })
  }, [tableColumnKeys])

  const handleUpdateName = (newName: any, oldName: string) => {
    if (tableColumnKeys[oldName].name === newName) {
      return
    }
    setTableColumnKeys(prev => ({
      ...prev,
      [oldName]: {
        ...tableColumnKeys[oldName],
        name: newName,
      },
    }))
  }

  const handleUpdateVisible = (oldName: string) => {
    setTableColumnKeys(prev => ({
      ...prev,
      [oldName]: {
        ...tableColumnKeys[oldName],
        visible: !tableColumnKeys[oldName].visible,
      },
    }))
  }

  if (!Object.values(tableColumnKeys)?.length) {
    return (
      <Context>
        <div className="columns-panel--grid">
          <div className="panel-resizer--empty">
            No Columns To Show. Preview To See Results.
          </div>
        </div>
      </Context>
    )
  }

  return (
    <Context>
      <div className="columns-panel--grid">
        {Object.entries(tableColumnKeys).map(
          ([k, v]: [string, TableColumnKey]) => (
            <ResourceCard key={k} className="column-card--content">
              <ResourceCard.Meta className="column-card--vistoggle">
                {[
                  <React.Fragment key={v.name + Math.random()}>
                    <FlexBox
                      direction={FlexDirection.Row}
                      alignItems={AlignItems.Center}
                      margin={ComponentSize.Medium}
                      stretchToFitWidth={true}
                    >
                      <SlideToggle
                        onChange={() => handleUpdateVisible(k)}
                        active={v.visible}
                      />
                    </FlexBox>
                  </React.Fragment>,
                ]}
              </ResourceCard.Meta>
              <ResourceCard.EditableName
                name={v.name}
                onClick={() => {}}
                onUpdate={e => handleUpdateName(e, k)}
                testID={`column-card--name ${k}`}
                inputTestID="column-card--input"
                buttonTestID="column-card--name-button"
                noNameString="Column name"
                className="column-card--name"
              />
            </ResourceCard>
          )
        )}
      </div>
    </Context>
  )
}
export default View
