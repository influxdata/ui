import React, {PureComponent} from 'react'
import classnames from 'classnames'

import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  SubwayNav,
} from '@influxdata/clockface'

import {InstallDependencies} from 'src/homepageExperience/components/steps/python/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {CreateToken} from 'src/homepageExperience/components/steps/CreateToken'
import {InitalizeClient} from 'src/homepageExperience/components/steps/python/InitalizeClient'
import {WriteData} from 'src/homepageExperience/components/steps/python/WriteData'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/python/ExecuteQuery'
import {Finish} from 'src/homepageExperience/components/steps/python/Finish'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/python/ExecuteAggregateQuery'

import {PythonIcon} from 'src/homepageExperience/components/HomepageIcons'

import {HOMEPAGE_NAVIGATION_STEPS} from 'src/homepageExperience/utils'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface State {
  currentStep: number
  selectedBucket: string
}

export class PythonWizard extends PureComponent<null, State> {
  state = {
    currentStep: 1,
    selectedBucket: 'my-bucket',
  }

  private handleSelectBucket = (bucketName: string) => {
    this.setState({selectedBucket: bucketName})
  }

  handleNextClick = () => {
    this.setState(
      {
        currentStep: Math.min(
          this.state.currentStep + 1,
          HOMEPAGE_NAVIGATION_STEPS.length
        ),
      },
      () => {
        event('firstMile.pythonWizard.next.clicked')
      }
    )
  }

  handlePreviousClick = () => {
    this.setState(
      {currentStep: Math.max(this.state.currentStep - 1, 1)},
      () => {
        event('firstMile.pythonWizard.previous.clicked')
      }
    )
  }

  handleNavClick = (clickedStep: number) => {
    this.setState({currentStep: clickedStep})
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
      case 5: {
        return <WriteData onSelectBucket={this.handleSelectBucket} />
      }
      case 6: {
        return <ExecuteQuery bucket={this.state.selectedBucket} />
      }
      case 7: {
        return <ExecuteAggregateQuery bucket={this.state.selectedBucket} />
      }
      case 8: {
        return <Finish />
      }
      default: {
        return <Overview />
      }
    }
  }

  render() {
    const {currentStep} = this.state

    return (
      <div className="homepage-wizard-container">
        <aside className="homepage-wizard-container--subway">
          <div style={{width: '100%'}}>
            <SubwayNav
              currentStep={this.state.currentStep}
              onStepClick={this.handleNavClick}
              navigationSteps={HOMEPAGE_NAVIGATION_STEPS}
              settingUpIcon={PythonIcon}
              settingUpText="Python"
              setupTime="5 minutes"
            />
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
              status={
                currentStep > 1
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
            />
            <Button
              onClick={this.handleNextClick}
              text="Next"
              size={ComponentSize.Large}
              color={ComponentColor.Primary}
              status={
                currentStep < 8
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
            />
          </div>
        </div>
      </div>
    )
  }
}
