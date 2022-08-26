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
import {MQTTIcon} from 'src/homepageExperience/components/HomepageIcons'

// Steps
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {ConnectToBroker} from 'src/homepageExperience/components/steps/MQTT/ConnectToBroker'
import {SubscribeToTopic} from 'src/homepageExperience/components/steps/MQTT/SubscribeToTopic'
import {DefineData} from 'src/homepageExperience/components/steps/MQTT/DefineData'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {HOMEPAGE_NAVIGATION_STEPS_MQTT} from 'src/homepageExperience/utils'
import {normalizeEventName} from 'src/cloud/utils/reporting'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

export class MQTTWizard extends PureComponent<{}, State> {
  state = {
    currentStep: 1,
    selectedBucket: 'sample-bucket',
    finishStepCompleted: false,
    tokenValue: null,
    finalFeedback: null,
  }

  private handleMarkStepAsCompleted = () => {
    this.setState({finishStepCompleted: true})
  }

  private setFinalFeedback = (feedbackValue: number) => {
    this.setState({finalFeedback: feedbackValue})
  }

  handleNextClick = () => {
    this.setState(
      {
        currentStep: Math.min(
          this.state.currentStep + 1,
          HOMEPAGE_NAVIGATION_STEPS_MQTT.length
        ),
      },
      () => {
        event(
          'firstMile.MQTTWizard.next.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS_MQTT[this.state.currentStep - 2].name
            ),
            currentStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS_MQTT[this.state.currentStep - 1].name
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
          'firstMile.MQTTWizard.previous.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS_MQTT[this.state.currentStep].name
            ),
            currentStep: normalizeEventName(
              HOMEPAGE_NAVIGATION_STEPS_MQTT[this.state.currentStep - 1].name
            ),
          }
        )
      }
    )
  }

  handleNavClick = (clickedStep: number) => {
    this.setState({currentStep: clickedStep})
    event(
      'firstMile.MQTTWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_MQTT[clickedStep - 1].name
        ),
      }
    )
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="MQTTWizard" />
      }
      case 2: {
        return <ConnectToBroker />
      }
      case 3: {
        return <SubscribeToTopic />
      }
      case 4: {
        return <DefineData />
      }
      case 5: {
        return (
          <Finish
            wizardEventName="MQTTWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="MQTTWizard" />
      }
    }
  }

  render() {
    return (
      <Page>
        <Page.Header fullWidth={false}>
          {/* Need an empty div so the upgrade button aligns to the right. (Because clockface uses space-between to justifyContent)*/}
          <div />
          <RateLimitAlert location="firstMile.MQTTWizard" />
        </Page.Header>
        <Page.Contents scrollable={true}>
          <div className="homepage-wizard-container">
            <aside className="homepage-wizard-container--subway">
              <div style={{width: '100%'}} data-testid="subway-nav">
                <SubwayNav
                  currentStep={this.state.currentStep}
                  onStepClick={this.handleNavClick}
                  navigationSteps={HOMEPAGE_NAVIGATION_STEPS_MQTT}
                  settingUpIcon={MQTTIcon}
                  settingUpText="Native MQTT"
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
                        HOMEPAGE_NAVIGATION_STEPS_MQTT.length,
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
                  testID="MQTT-prev-button"
                />
                <Button
                  onClick={this.handleNextClick}
                  text="Next"
                  size={ComponentSize.Large}
                  color={ComponentColor.Primary}
                  status={
                    this.state.currentStep <
                    HOMEPAGE_NAVIGATION_STEPS_MQTT.length
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID="MQTT-next-button"
                />
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }
}
