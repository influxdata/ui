import React, {PureComponent} from 'react'
import classnames from 'classnames'

import {InfluxColors} from '@influxdata/clockface'

import {OverviewIcon} from 'src/homepageExperience/components/HomepageIcons'

interface OwnProps {
  currentStep: number
}

const defaultFillColor = InfluxColors.Grey95
const activeFillColor = '#0098f0'

export class Navigation extends PureComponent<OwnProps> {
  render() {
    return (
      <div className="subway-navigation-container">
        <div className="subway-navigation-flex-wrapper">
          <h2>Setting Up</h2>
          <h3>5 minutes</h3>
          <div
            className={classnames('subway-navigation-step', {
              active: this.props.currentStep === 1,
            })}
          >
            <span className="subway-navigation-step-icon-container">
              <OverviewIcon
                fill={
                  this.props.currentStep === 1
                    ? activeFillColor
                    : defaultFillColor
                }
              />
            </span>
            Overview
          </div>
          <div
            className={classnames('subway-navigation-step', {
              active: this.props.currentStep === 2,
            })}
          >
            <span>icon</span>
            <p>Install Dependencies</p>
          </div>
        </div>
      </div>
    )
  }
}
