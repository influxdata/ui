// Libraries
import React, {FC, useEffect, useState} from 'react'

// Components
import {Dropdown} from '@influxdata/clockface'

interface Props {
  formField: string
  setForm: (any) => void
}

const TypeDropdown: FC<Props> = ({formField}) => {
  const stringType = 'String'
  const numberType = 'Number'
  const dataTypeList = [stringType, numberType]
  const [dataType, setDataType] = useState(stringType)
  return (
    <Dropdown
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          testID="variable-type-dropdown--button"
        >
          {dataType}
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse}>
          {dataTypeList.map((d, key) => (
            <Dropdown.Item
              key={key}
              id={d}
              value={d}
              onClick={() => {
                setDataType(d)
                formField = d
              }}
              selected={dataType === d}
              testID={`variable-type-dropdown-${1}`}
            >
              {d}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    />
  )
}

export default TypeDropdown
