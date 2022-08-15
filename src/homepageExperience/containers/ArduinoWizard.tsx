// Libraries
import React, {PureComponent} from 'react'
import classnames from 'classnames'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Page,
  SubwayNav,
} from '@influxdata/clockface'
import {ArduinoIcon} from 'src/homepageExperience/components/HomepageIcons'

// Steps
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/arduino/ExecuteAggregateQuery'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/arduino/ExecuteQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from 'src/homepageExperience/components/steps/arduino/InitializeClient'
import {InstallDependencies} from 'src/homepageExperience/components/steps/arduino/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {PrepareIde} from 'src/homepageExperience/components/steps/arduino/PrepareIde'
import {WriteData} from 'src/homepageExperience/components/steps/arduino/WriteData'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {HOMEPAGE_NAVIGATION_STEPS_ARDUINO} from 'src/homepageExperience/utils'
import {normalizeEventName} from 'src/cloud/utils/reporting'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

export class ArduinoWizard extends PureComponent<{}, State> {
  state = {
    currentStep: 1,
    selectedBucket: 'sample-bucket',
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
    this.setState({tokenValue: tokenValue})
  }

  private setFinalFeedback = (feedbackValue: number) => {
    this.setState({finalFeedback: feedbackValue})
  }

  handleNextClick = () => {
    this.setState({
      currentStep: Math.min(
        this.state.currentStep + 1,
        HOMEPAGE_NAVIGATION_STEPS_ARDUINO.length
      ),
    })
    event(
      'firstMile.arduinoWizard.next.clicked',
      {},
      {
        clickedButtonAtStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_ARDUINO[this.state.currentStep - 1].name
        ),
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_ARDUINO[this.state.currentStep].name
        ),
      }
    )
  }

  handlePreviousClick = () => {
    this.setState(
      {currentStep: Math.max(this.state.currentStep - 1, 1)},
      () => {
        event(
          'firstMile.arduinoWizard.previous.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS_ARDUINO[this.state.currentStep - 1].name
            ),
            currentStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS_ARDUINO[this.state.currentStep].name
            ),
          }
        )
      }
    )
  }

  handleNavClick = (clickedStep: number) => {
    this.setState({currentStep: clickedStep})
    event(
      'firstMile.arduinoWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_ARDUINO[clickedStep - 1].name
        ),
      }
    )
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="arduinoWizard" />
      }
      case 2: {
        return <PrepareIde />
      }
      case 3: {
        return <InstallDependencies />
      }
      case 4: {
        return (
          <InitializeClient
            setTokenValue={this.setTokenValue}
            tokenValue={this.state.tokenValue}
            onSelectBucket={this.handleSelectBucket}
          />
        )
      }
      case 5: {
        return <WriteData bucket={this.state.selectedBucket} />
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
            wizardEventName="arduinoWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="arduinoWizard" />
      }
    }
  }

  render() {
    return (
      <Page>
        <Page.Header fullWidth={false}>
          {/* Need an empty div so the upgrade button aligns to the right. (Because clockface uses space-between to justifyContent)*/}
          <div />
          <RateLimitAlert location="firstMile.arduinoWizard" />
        </Page.Header>
        <Page.Contents scrollable={true}>
          <div className="homepage-wizard-container">
            <aside className="homepage-wizard-container--subway">
              <div style={{width: '100%'}} data-testid="subway-nav">
                <SubwayNav
                  currentStep={this.state.currentStep}
                  onStepClick={this.handleNavClick}
                  navigationSteps={HOMEPAGE_NAVIGATION_STEPS_ARDUINO}
                  settingUpIcon={ArduinoIcon}
                  settingUpText="Arduino"
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
                        HOMEPAGE_NAVIGATION_STEPS_ARDUINO.length,
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
                  testID="arduino-prev-button"
                />
                <Button
                  onClick={this.handleNextClick}
                  text="Next"
                  size={ComponentSize.Large}
                  color={ComponentColor.Primary}
                  status={
                    this.state.currentStep < 8
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID="arduino-next-button"
                />
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }
}
