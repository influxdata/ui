import React, {Component} from 'react'

import {Form, Dropdown, ComponentColor} from '@influxdata/clockface'

class TimeRangeDropdown extends Component {
  constructor(props) {
    super(props)

    this.csrf_token = document.querySelector('meta[name=csrf]').content
  }

  render() {
    const {selectedTimeRange} = this.props

    return (
      <form ref={r => (this.timeRangeForm = r)} action="/usage" method="POST">
        <Form.Element label="Time Range">
          <Dropdown
            testID="timerange-dropdown"
            style={{width: '200px'}}
            button={(active, onClick) => (
              <Dropdown.Button
                active={active}
                onClick={onClick}
                color={ComponentColor.Primary}
              >
                {selectedTimeRange}
              </Dropdown.Button>
            )}
            menu={() => <Dropdown.Menu>{this.dropdownOptions()}</Dropdown.Menu>}
          />
        </Form.Element>
        <input
          ref={r => (this.timeInput = r)}
          type="hidden"
          name="time_range"
          id="time_range"
          value={selectedTimeRange}
        />
        <input name="_csrf_token" type="hidden" value={this.csrf_token} />
      </form>
    )
  }

  submitTimeRange = range => {
    this.timeInput.value = range
    this.timeRangeForm.submit()
  }

  dropdownOptions() {
    const {dropdownOptions} = this.props
    return Object.keys(dropdownOptions).map(opt => (
      <Dropdown.Item
        testID={`timerange-dropdown--${opt}`}
        id={`timerange-dropdown--${opt}`}
        key={`timerange-dropdown--${opt}`}
        value={opt}
        onClick={this.submitTimeRange}
      >
        {dropdownOptions[opt]}
      </Dropdown.Item>
    ))
  }
}

export default TimeRangeDropdown
