import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'

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

  const updateUrl = evt => {
    updater('url', evt.target.value)
  }

  const updateKey = evt => {
    updater('key', evt.target.value)
  }

  const defaultEndpoint = `${window.location.origin}/org/${org.id}/alert-history`

  return (
    <FlexBox className="http-endpoint--flex" direction={FlexDirection.Column}>
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
          type={InputType.Password}
          value={data.endpointData.key}
          onChange={updateKey}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </FlexBox>
  )
}

export default PagerDuty
