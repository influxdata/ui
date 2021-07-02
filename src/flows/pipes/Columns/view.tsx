import React, {FC, useCallback, useContext, useEffect} from 'react'
import {PipeContext} from 'src/flows/context/pipe'
import './styles.scss'
import {PipeProp} from 'src/types/flows'
import {ResourceCard} from '@influxdata/clockface'

const View: FC<PipeProp> = ({Context}) => {
  const {id, update, data, results} = useContext(PipeContext)

  useEffect(() => {
    if (results?.parsed?.table) {
      update({
        table: results.parsed.table,
      })
    }
  }, [results?.parsed?.table])
  const handleUpdateName = useCallback(
    (newName: any, oldName: string) => {
      if (oldName === newName) {
        return
      }

      const newColValues = data.table.columns[oldName]
      const {...newTable} = data.table
      delete newTable.columns[oldName]
      newTable.columns[newName] = newColValues
      update({
        table: {
          ...data.table,
          columnKeys: [
            ...data.table.columnKeys.filter(t => t !== oldName),
            newName,
          ],
          columns: newTable.columns,
        },
      })
    },
    [update, data.table]
  )

  if (!data?.table?.columnKeys?.length) {
    return <h1>No Columns To Show. Preview To See Results.</h1>
  }

  console.log(data)
  return (
    <Context>
      <div className="columns-panel--grid">
        {data.table.columnKeys.map(k => (
          <ResourceCard key={k}>
            <ResourceCard.EditableName
              name={k}
              onClick={() => {}}
              onUpdate={e => handleUpdateName(e, k)}
              testID={`column-card--name ${k}`}
              inputTestID="column-card--input"
              buttonTestID="column-card--name-button"
              noNameString="Column name"
            />
          </ResourceCard>
        ))}
      </div>
    </Context>
  )
}
export default View
