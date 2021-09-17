import React, {FC, useContext} from 'react'

import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'
import {REGIONS} from './view'

import {
  Dropdown,
  ComponentColor,
  ComponentStatus,
  ComponentSize,
  Form,
  FlexBox,
  Input,
  InputType,
} from '@influxdata/clockface'

import './style.scss'

const Source: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  const regionLabel = REGIONS.filter(region => region.value === data.region)[0]
    .label

  return (
    <Context>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child
          basis={234}
          grow={0}
          shrink={0}
          className="flow-panel-region--header"
        >
          <h5>Query another InfluxDB instance</h5>
          <p>All following panels will use this source</p>
        </FlexBox.Child>
        <FlexBox.Child
          grow={0}
          shrink={0}
          basis={250}
          style={{alignSelf: 'start'}}
        >
          <Form.Element label="Region" required={true}>
            <Dropdown
              testID="region-panel--dropdown"
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  status={ComponentStatus.Disabled}
                  onClick={onClick}
                  color={ComponentColor.Primary}
                  testID="region-panel--dropdown-button"
                >
                  {regionLabel}
                </Dropdown.Button>
              )}
              menu={onCollapse => <Dropdown.Menu onCollapse={onCollapse} />}
            />
          </Form.Element>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="URL" required={true}>
            <Input
              placeholder="data source url"
              type={InputType.Text}
              value={data.region}
              size={ComponentSize.Medium}
              status={ComponentStatus.Disabled}
            />
          </Form.Element>
        </FlexBox.Child>
        {data.region !== window.location.origin && (
          <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
            <Form.Element label="Token" required={true}>
              <Input
                placeholder="authorization token"
                type={InputType.Password}
                value={data.token}
                size={ComponentSize.Medium}
                status={ComponentStatus.Disabled}
              />
            </Form.Element>
          </FlexBox.Child>
        )}
      </FlexBox>
    </Context>
  )
}

export default Source
