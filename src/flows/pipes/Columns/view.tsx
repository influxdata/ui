import React, {FC, useContext, useEffect, useState} from 'react'
import {PipeContext} from 'src/flows/context/pipe'
import './styles.scss'
import {PipeProp} from 'src/types/flows'
import {
  ResourceCard,
  SlideToggle,
  FlexBox,
  InputLabel,
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
    // const updatedKeys = Object.entries(tableColumnKeys).reduce((a, [k, v]) => {
    //   if (v.name === k) {
    //     return a
    //   } else {
    //     return {...a, [k]: {...v}}
    //   }
    // }, {})

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

  const handleUpdateVisible = (oldName: string, newVisibleStatus: boolean) => {
    if (tableColumnKeys[oldName].visible === newVisibleStatus) {
      return
    }

    setTableColumnKeys(prev => ({
      ...prev,
      [oldName]: {
        ...tableColumnKeys[oldName],
        visible: newVisibleStatus,
      },
    }))
  }

  if (!Object.values(tableColumnKeys)) {
    return <h1>No Columns To Show. Preview To See Results.</h1>
  }

  return (
    <Context>
      <div className="columns-panel--grid">
        {Object.entries(tableColumnKeys).map(
          ([k, v]: [string, TableColumnKey]) => (
            <ResourceCard key={k}>
              <ResourceCard.EditableName
                name={v.name}
                onClick={() => {}}
                onUpdate={e => handleUpdateName(e, k)}
                testID={`column-card--name ${k}`}
                inputTestID="column-card--input"
                buttonTestID="column-card--name-button"
                noNameString="Column name"
              />
              <ResourceCard.Meta>
                {[
                  <React.Fragment key={v.name + Math.random()}>
                    <FlexBox
                      direction={FlexDirection.Row}
                      alignItems={AlignItems.Center}
                      margin={ComponentSize.Medium}
                      stretchToFitWidth={true}
                    >
                      <SlideToggle
                        onChange={() => handleUpdateVisible(k, !v.visible)}
                        active={v.visible}
                      />
                      <InputLabel active={v.visible}>Visible</InputLabel>
                    </FlexBox>
                  </React.Fragment>,
                ]}
              </ResourceCard.Meta>
            </ResourceCard>
          )
        )}
      </div>
    </Context>
  )
}
export default View
