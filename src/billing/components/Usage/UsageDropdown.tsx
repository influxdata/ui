import React, {Component} from 'react'

import {SelectDropdown, ComponentColor} from '@influxdata/clockface'
import {GRAPH_INFO} from 'js/components/Usage/Constants'

class UsageDropdown extends Component {
  constructor(props) {
    super(props)

    this.options = GRAPH_INFO.usage_stats
      .filter(stat => stat.pricingVersions.includes(props.pricingVersion))
      .map(stat => stat.title)
  }

  render() {
    const {selectedUsage} = this.props

    return (
      <SelectDropdown
        titleText="Usage"
        selectedOption={selectedUsage}
        options={this.options}
        onSelect={this.handleSelect}
        buttonColor={ComponentColor.Default}
        style={{width: '200px'}}
      />
    )
  }

  handleSelect = v => {
    const {onSelect} = this.props

    this.setState({selectedUsage: v}, () => {
      if (onSelect) {
        onSelect(v)
      }
    })
  }
}

export default UsageDropdown
