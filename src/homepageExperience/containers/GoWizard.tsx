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

import {InstallDependencies} from 'src/homepageExperience/components/steps/go/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {InitializeClient} from 'src/homepageExperience/components/steps/go/InitializeClient'
import {WriteData} from 'src/homepageExperience/components/steps/go/WriteData'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/go/ExecuteQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/go/ExecuteAggregateQuery'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import {normalizeEventName} from 'src/cloud/utils/reporting'

import {GoIcon} from 'src/homepageExperience/components/HomepageIcons'

// Utils
import {event} from 'src/cloud/utils/reporting'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  scrollNextPageIntoView,
  HOMEPAGE_NAVIGATION_STEPS,
} from 'src/homepageExperience/utils'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

export class GoWizard extends PureComponent<null, State> {
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
          'firstMile.goWizard.next.clicked',
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
        scrollNextPageIntoView()
      }
    )
  }

  handlePreviousClick = () => {
    this.setState(
      {currentStep: Math.max(this.state.currentStep - 1, 1)},
      () => {
        event(
          'firstMile.goWizard.previous.clicked',
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
        scrollNextPageIntoView()
      }
    )
  }

  handleNavClick = (clickedStep: number) => {
    this.setState({currentStep: clickedStep})
    event(
      'firstMile.goWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS[clickedStep - 1].name
        ),
      }
    )
    scrollNextPageIntoView()
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="goWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="goWizard"
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
            wizardEventName="goWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="goWizard" />
      }
    }
  }

  render() {
    return (
      <Page>
        <Page.Header fullWidth={false}>
          {/* Need an empty div so the upgrade button aligns to the right. (Because clockface uses space-between to justifyContent)*/}
          <div />
          {!isFlagEnabled('multiOrg') && (
            <RateLimitAlert location="firstMile.homepage" />
          )}
        </Page.Header>
        <Page.Contents scrollable={true}>
          <div className="homepage-wizard-container">
            <aside className="homepage-wizard-container--subway">
              <div className="homepage-wizard-container--subway-inner">
                <SubwayNav
                  currentStep={this.state.currentStep}
                  onStepClick={this.handleNavClick}
                  navigationSteps={HOMEPAGE_NAVIGATION_STEPS}
                  settingUpIcon={GoIcon}
                  settingUpText="Go"
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
                </WriteDataDetailsContextProvider>{' '}
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
