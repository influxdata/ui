import React, {PureComponent} from 'react'

import {IconFont} from '@influxdata/clockface'

import {ClockIcon} from 'src/clockface/components/SubwayNavigationIcons'
import {SubwayNavigationStep} from 'src/clockface/components/SubwayNavigationStep'

import './SubwayNavigation.scss'

export type SubwayNavigationModel = {
  glyph: IconFont
  name: string
}

interface OwnProps {
  currentStep: number
  navigationSteps: SubwayNavigationModel[]
  onStepClick: (number) => void
  settingUpIcon: JSX.Element
  settingUpText: string
  setupTime?: string
}

export class SubwayNavigation extends PureComponent<OwnProps> {
  private handleClick = (step: number) => {
    this.props.onStepClick(step)
  }

  render() {
    return (
      <div className="subway-navigation-container">
        <div className="subway-navigation-flex-wrapper">
          <div className="subway-navigation-title">
            <span className="subway-navigation-title-icon">
              {this.props.settingUpIcon}
            </span>
            <div className="subway-navigation-title-text">
              <h3>Setting Up</h3>
              <h6>{this.props.settingUpText}</h6>
            </div>
          </div>
          {this.props.setupTime && (
            <div className="subway-navigation-time-to-complete">
              {ClockIcon}
              <h5>{this.props.setupTime}</h5>
            </div>
          )}
          {this.props.navigationSteps.map((value, index) => (
            <SubwayNavigationStep
              glyph={value.glyph}
              key={value.name}
              onClick={() => {
                this.handleClick(index + 1)
              }}
              stepIsActive={index === this.props.currentStep - 1}
              stepIsComplete={index < this.props.currentStep - 1}
              text={value.name}
            />
          ))}
        </div>
      </div>
    )
  }
}
