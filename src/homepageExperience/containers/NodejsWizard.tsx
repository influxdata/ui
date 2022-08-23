import React, {PureComponent} from 'react'
import classnames from 'classnames'

import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Page,
  SubwayNav,
} from '@influxdata/clockface'

import {InstallDependencies} from 'src/homepageExperience/components/steps/nodejs/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {InitializeClient} from 'src/homepageExperience/components/steps/nodejs/InitializeClient'
import {WriteData} from 'src/homepageExperience/components/steps/nodejs/WriteData'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/nodejs/ExecuteQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/nodejs/ExecuteAggregateQuery'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import {normalizeEventName} from 'src/cloud/utils/reporting'

import {NodejsIcon} from 'src/homepageExperience/components/HomepageIcons'

import {HOMEPAGE_NAVIGATION_STEPS} from 'src/homepageExperience/utils'

// Utils
import {event} from 'src/cloud/utils/reporting'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

export class NodejsWizard extends PureComponent<null, State> {
  state = {
    currentStep: 1,
    selectedBucket: 'my-bucket',
    finishStepCompleted: false,
    tokenValue: null,
    finalFeedback: null,
  }

  private handleSelectBucket = (bucketName: string) => {
    this.setState({selectedBucket: bucketName})
  }

  private handleMarkStepAsCompleted = () => {
    this.setState({finishStepCompleted: true})
  }

  private setTokenValue = (tokenValue: string) => {
    this.setState({tokenValue})
  }

  private setFinalFeedback = (feedbackValue: number) => {
    this.setState({finalFeedback: feedbackValue})
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
        event(
          'firstMile.nodejsWizard.next.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS[this.state.currentStep - 2].name
            ),
            currentStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS[this.state.currentStep - 1].name
            ),
          }
        )
      }
    )
  }

  handlePreviousClick = () => {
    this.setState(
      {currentStep: Math.max(this.state.currentStep - 1, 1)},
      () => {
        event(
          'firstMile.nodejsWizard.previous.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS[this.state.currentStep].name
            ),
            currentStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS[this.state.currentStep - 1].name
            ),
          }
        )
      }
    )
  }

  handleNavClick = (clickedStep: number) => {
    this.setState({currentStep: clickedStep})
    event(
      'firstMile.nodejsWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS[clickedStep - 1].name
        ),
      }
    )
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="nodejsWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="nodejsWizard"
            setTokenValue={this.setTokenValue}
            tokenValue={this.state.tokenValue}
          />
        )
      }
      case 4: {
        return <InitializeClient />
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
        return (
          <Finish
            wizardEventName="nodejsWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="nodejsWizard" />
      }
    }
  }

  render() {
    return (
      <Page>
        <Page.Header fullWidth={false}>
          {/* Need an empty div so the upgrade button aligns to the right. (Because clockface uses space-between to justifyContent)*/}
          <div />
          <RateLimitAlert location="firstMile.homepage" />
        </Page.Header>

        <Page.Contents scrollable={true}>
          <div className="homepage-wizard-container">
            <aside className="homepage-wizard-container--subway">
              <div style={{width: '100%'}}>
                <SubwayNav
                  currentStep={this.state.currentStep}
                  onStepClick={this.handleNavClick}
                  navigationSteps={HOMEPAGE_NAVIGATION_STEPS}
                  settingUpIcon={NodejsIcon}
                  settingUpText="Nodejs"
                  setupTime="5 minutes"
                />
              </div>
            </aside>
            <div className="homepage-wizard-container--main">
              <div
                className={classnames(
                  'homepage-wizard-container--main-wrapper',
                  {
                    verticallyCentered:
                      this.state.currentStep === 1 ||
                      this.state.currentStep ===
                        HOMEPAGE_NAVIGATION_STEPS.length,
                  }
                )}
              >
                <WriteDataDetailsContextProvider>
                  {this.renderStep()}
                </WriteDataDetailsContextProvider>
              </div>

              <div className="homepage-wizard-container-footer">
                <Button
                  onClick={this.handlePreviousClick}
                  text="Previous"
                  size={ComponentSize.Large}
                  color={ComponentColor.Tertiary}
                  status={
                    this.state.currentStep > 1
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
                    this.state.currentStep < HOMEPAGE_NAVIGATION_STEPS.length
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                />
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }
}
