import React, {PureComponent} from 'react'
import classnames from 'classnames'

import {Button, ComponentColor, ComponentSize} from '@influxdata/clockface'

import {InstallDependencies} from 'src/homepageExperience/components/steps/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Navigation} from 'src/homepageExperience/components/Navigation'
import {CreateToken} from 'src/homepageExperience/components/steps/CreateToken'
import {InitalizeClient} from 'src/homepageExperience/components/steps/InitalizeClient'

import {HOMEPAGE_NAVIGATION_STEPS} from 'src/homepageExperience/utils'

interface State {
  currentStep: number
}

export class HomepagePythonWizard extends PureComponent<null, State> {
  state = {
    currentStep: 1,
  }

  handleNextClick = () => {
    this.setState({
      currentStep: Math.min(
        this.state.currentStep + 1,
        HOMEPAGE_NAVIGATION_STEPS.length
      ),
    })
  }

  handlePreviousClick = () => {
    this.setState({currentStep: Math.max(this.state.currentStep - 1, 1)})
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return <CreateToken />
      }
      case 4: {
        return <InitalizeClient />
      }
      default: {
        return <Overview />
      }
    }
  }

  render() {
    return (
      <div className="homepage-wizard-container">
        <aside className="homepage-wizard-container--subway">
          <div style={{width: '100%'}}>
            <Navigation currentStep={this.state.currentStep} />
          </div>
        </aside>
        <div className="homepage-wizard-container--main">
          <div
            className={classnames('homepage-wizard-container--main-wrapper', {
              overviewSection: this.state.currentStep === 1,
            })}
          >
            {this.renderStep()}
          </div>

          <div className="homepage-wizard-container-footer">
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
