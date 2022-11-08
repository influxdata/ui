import React, {FC, useState, useEffect} from 'react'
// import {isEmpty} from 'lodash'
import {DapperScrollbars, Form, Input} from '@influxdata/clockface'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface Props {
  scriptParams: any
  selectedScript: any
}

export const ScriptForm: FC<Props> = ({scriptParams, selectedScript}) => {
  const [parameters, setParameters] = useState([])

  useEffect(() => {
    // initialize state the moment scriptParams is initialized
    setParameters(scriptParams)
  }, [scriptParams])

  const UpdateParamValue = (event, paramName) => {
    let updateparams = [...parameters]

    updateparams = updateparams.map(param => {
      if (param.name === paramName) {
        param.value = event.target.value
        return param
      } else {
        return param
      }
    })
    setParameters(updateparams)
  }

  const paramList = (
    <>
      {parameters.map(param => (
        <Form.Element
          label={`param.${param.name}`}
          required={true}
          key={param.name}
        >
          <Input
            name="name"
            onChange={event => UpdateParamValue(event, param.name)}
            value={param.value}
            testID="script-param-value"
          />
        </Form.Element>
      ))}
    </>
  )

  return (
    <>
      <div className="create-task-titles script-name">
        {selectedScript.name}
      </div>
      <div className="script-description">
        <div>Description</div>
        <p>{selectedScript.description}</p>
      </div>
      {parameters && (
        <div className="script-params">
          <div className="create-task-titles">Set Param Values</div>
          <p>
            Params are InfluxDB objects that define runtime variables. You must
            provide values for params when you invoke a script.{' '}
            <SafeBlankLink href="">Learn More.</SafeBlankLink>
          </p>
          {/* TODO: scrollbar should only show when list is too long */}
          <DapperScrollbars
            autoHide={false}
            autoSize
            style={{width: '100%', maxWidth: '500px', maxHeight: '500px'}}
          >
            <div className="script-params-list">{paramList}</div>
          </DapperScrollbars>
        </div>
      )}
    </>
  )
}
