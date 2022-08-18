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
import {CLIIcon} from 'src/homepageExperience/components/HomepageIcons'

// Steps
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/cli/ExecuteAggregateQuery'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/cli/ExecuteQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from 'src/homepageExperience/components/steps/cli/InitializeClient'
import {InstallDependencies} from 'src/homepageExperience/components/steps/cli/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {WriteData} from 'src/homepageExperience/components/steps/cli/WriteData'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {HOMEPAGE_NAVIGATION_STEPS_SHORT} from 'src/homepageExperience/utils'
import {normalizeEventName} from 'src/cloud/utils/reporting'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

export class CliWizard extends PureComponent<{}, State> {
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
        HOMEPAGE_NAVIGATION_STEPS_SHORT.length
      ),
    })

    event(
      'firstMile.cliWizard.next.clicked',
      {},
      {
        clickedButtonAtStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_SHORT[this.state.currentStep - 1].name
        ),
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_SHORT[this.state.currentStep].name
        ),
      }
    )
  }

  handlePreviousClick = () => {
    this.setState({currentStep: Math.max(this.state.currentStep - 1, 1)})
    event(
      'firstMile.cliWizard.previous.clicked',
      {},
      {
        clickedButtonAtStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_SHORT[this.state.currentStep + 1].name
        ),
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_SHORT[this.state.currentStep].name
        ),
      }
    )
  }

  handleNavClick = (clickedStep: number) => {
    this.setState({currentStep: clickedStep})
    event(
      'firstMile.cliWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          HOMEPAGE_NAVIGATION_STEPS_SHORT[clickedStep - 1].name
        ),
      }
    )
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="cliWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <InitializeClient
            setTokenValue={this.setTokenValue}
            tokenValue={this.state.tokenValue}
            onSelectBucket={this.handleSelectBucket}
          />
        )
      }
      case 4: {
        return <WriteData bucket={this.state.selectedBucket} />
      }
      case 5: {
        return <ExecuteQuery bucket={this.state.selectedBucket} />
      }
      case 6: {
        return <ExecuteAggregateQuery bucket={this.state.selectedBucket} />
      }
      case 7: {
        return (
          <Finish
            wizardEventName="cliWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="cliWizard" />
      }
    }
  }

  render() {
    return (
      <Page>
        <Page.Header fullWidth={false}>
          {/* Need an empty div so the upgrade button aligns to the right. (Because clockface uses space-between to justifyContent)*/}
          <div />
          <RateLimitAlert location="firstMile.cliWizard" />
        </Page.Header>
        <Page.Contents scrollable={true}>
          <div className="homepage-wizard-container">
            <aside className="homepage-wizard-container--subway">
              <div style={{width: '100%'}} data-testid="subway-nav">
                <SubwayNav
                  currentStep={this.state.currentStep}
                  onStepClick={this.handleNavClick}
                  navigationSteps={HOMEPAGE_NAVIGATION_STEPS_SHORT}
                  settingUpIcon={CLIIcon}
                  settingUpText="InfluxDB CLI"
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
                        HOMEPAGE_NAVIGATION_STEPS_SHORT.length,
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
                  testID="cli-prev-button"
                />
                <Button
                  onClick={this.handleNextClick}
                  text="Next"
                  size={ComponentSize.Large}
                  color={ComponentColor.Primary}
                  status={
                    this.state.currentStep <
                    HOMEPAGE_NAVIGATION_STEPS_SHORT.length
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID="cli-next-button"
                />
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }
}
