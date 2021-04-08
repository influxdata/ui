import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {Form, Input, InputType, ComponentSize} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'
import {getOrg} from 'src/organizations/selectors'

const PagerDuty: FC = () => {
  const {data, update} = useContext(PipeContext)
  const org = useSelector(getOrg)

  const updater = (field, value) => {
    update({
      endpointData: {
        ...data.endpointData,
        [field]: value,
      },
    })
  }

  const updateUrl = text => {
    updater('url', text)
  }

  const updateKey = key => {
    updater('key', key)
  }

  const defaultEndpoint = `${window.location.origin}/org/${org.id}/alert-history`

  return (
    <>
      <Form.Element label="Client URL">
        <Input
          name="url"
          type={InputType.Text}
          placeholder={defaultEndpoint}
          value={data.endpointData.url}
          onChange={updateUrl}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Routing Key">
        <Input
          name="key"
          type={InputType.Text}
          value={data.endpointData.key}
          onChange={updateKey}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </>
  )
}

export default PagerDuty
