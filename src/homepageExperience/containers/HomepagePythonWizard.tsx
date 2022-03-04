import React, {PureComponent} from 'react'

import {Button, ComponentColor, ComponentSize} from '@influxdata/clockface'

import {InstallDependencies} from 'src/homepageExperience/components/steps/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Navigation} from 'src/homepageExperience/components/Navigation'
import classnames from 'classnames'

interface State {
  currentStep: number
}

export default class HomepagePythonWizard extends PureComponent<null, State> {
  state = {
    currentStep: 1,
  }

  handleNextClick = () => {
    this.setState({currentStep: this.state.currentStep + 1})
  }

  handlePreviousClick = () => {
    this.setState({currentStep: this.state.currentStep - 1})
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview />
      }
      case 2: {
        return <InstallDependencies />
      }
      default: {
        return <Overview />
      }
    }
  }

  render() {
    return (
      <div className="homepage-container">
        <aside className="homepage-container--subway">
          <div style={{width: '100%'}}>
            <Navigation currentStep={this.state.currentStep} />
          </div>
        </aside>
        <div className="homepage-container--main">
          <div
            className={classnames('homepage-container--main-wrapper', {
              overviewSection: this.state.currentStep === 1,
            })}
          >
            {this.renderStep()}
          </div>

          <div className="homepage-container-footer">
            <Button
              onClick={this.handlePreviousClick}
              text="Previous"
              size={ComponentSize.Large}
              color={ComponentColor.Tertiary}
            />
            <Button
              onClick={this.handleNextClick}
              text="Next"
              size={ComponentSize.Large}
              color={ComponentColor.Primary}
            />
          </div>
        </div>
      </div>
    )
  }
}
