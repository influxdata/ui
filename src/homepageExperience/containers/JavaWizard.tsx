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

import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/java/InstallDependenciesSql'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {InitializeClientSql} from 'src/homepageExperience/components/steps/java/InitializeClientSql'
import {WriteDataSql} from 'src/homepageExperience/components/steps/java/WriteDataSql'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/java/ExecuteQuerySql'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
// Utils
import {event, normalizeEventName} from 'src/cloud/utils/reporting'

import {JavaIcon} from 'src/homepageExperience/components/HomepageIcons'

import {
  HOMEPAGE_NAVIGATION_STEPS,
  HOMEPAGE_NAVIGATION_STEPS_SQL,
  scrollNextPageIntoView,
} from 'src/homepageExperience/utils'
import {isFlagEnabled} from '../../shared/utils/featureFlag'
import {InitializeClient} from '../components/steps/java/InitializeClient'
import {WriteData} from '../components/steps/java/WriteData'
import {ExecuteQuery} from '../components/steps/java/ExecuteQuery'
import {ExecuteAggregateQuery} from '../components/steps/java/ExecuteAggregateQuery'
import {InstallDependencies} from '../components/steps/java/InstallDependencies'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

export class JavaWizard extends PureComponent<null, State> {
  state = {
    currentStep: 1,
    selectedBucket: 'my-bucket',
    finishStepCompleted: false,
    tokenValue: null,
    finalFeedback: null,
  }

  subwayNavSteps = isFlagEnabled('ioxOnboarding')
    ? HOMEPAGE_NAVIGATION_STEPS_SQL
    : HOMEPAGE_NAVIGATION_STEPS

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
          this.subwayNavSteps.length
        ),
      },
      () => {
        event(
          'firstMile.javaWizard.next.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              this.subwayNavSteps[this.state.currentStep - 2].name
            ),
            currentStep: normalizeEventName(
              this.subwayNavSteps[this.state.currentStep - 1].name
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
          'firstMile.javaWizard.previous.clicked',
          {},
          {
            clickedButtonAtStep: normalizeEventName(
              this.subwayNavSteps[this.state.currentStep].name
            ),
            currentStep: normalizeEventName(
              this.subwayNavSteps[this.state.currentStep - 1].name
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
      'firstMile.javaWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          this.subwayNavSteps[clickedStep - 1].name
        ),
      }
    )
    scrollNextPageIntoView()
  }

  renderSqlStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="javaWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="javaWizard"
            setTokenValue={this.setTokenValue}
            tokenValue={this.state.tokenValue}
          />
        )
      }
      case 4: {
        return <InitializeClientSql />
      }
      case 5: {
        return <WriteDataSql onSelectBucket={this.handleSelectBucket} />
      }
      case 6: {
        return <ExecuteQuerySql bucket={this.state.selectedBucket} />
      }
      case 7: {
        return (
          <Finish
            wizardEventName="javaSqlWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="javaWizard" />
      }
    }
  }

  renderFluxStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="javaWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="javaWizard"
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
            wizardEventName="javaSqlWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="javaWizard" />
      }
    }
  }

  render() {
    const {currentStep} = this.state

    return (
      <Page>
        <Page.Header fullWidth={false} />
        <Page.Contents scrollable={true}>
          <div className="homepage-wizard-container">
            <aside className="homepage-wizard-container--subway">
              <div
                className="homepage-wizard-container--subway-inner"
                data-testid="subway-nav"
              >
                <SubwayNav
                  currentStep={this.state.currentStep}
                  onStepClick={this.handleNavClick}
                  navigationSteps={this.subwayNavSteps}
                  settingUpIcon={JavaIcon}
                  settingUpText="Java"
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
                      this.state.currentStep === this.subwayNavSteps.length,
                  }
                )}
              >
                <WriteDataDetailsContextProvider>
                  {isFlagEnabled('ioxOnboarding')
                    ? this.renderSqlStep()
                    : this.renderFluxStep()}
                </WriteDataDetailsContextProvider>
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
                  testID="java-prev-button"
                />
                <Button
                  onClick={this.handleNextClick}
                  text="Next"
                  size={ComponentSize.Large}
                  color={ComponentColor.Primary}
                  status={
                    currentStep < this.subwayNavSteps.length
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID="java-next-button"
                />
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }
}
