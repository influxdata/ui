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

import {InstallDependencies} from 'src/homepageExperience/components/steps/python/InstallDependencies'
import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/python/InstallDependenciesSql'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {InitializeClient} from 'src/homepageExperience/components/steps/python/InitializeClient'
import {InitializeClientSql} from 'src/homepageExperience/components/steps/python/InitializeClientSql'
import {WriteData} from 'src/homepageExperience/components/steps/python/WriteData'
import {WriteDataSql} from 'src/homepageExperience/components/steps/python/WriteDataSql'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/python/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/python/ExecuteQuerySql'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/python/ExecuteAggregateQuery'
import {ExecuteAggregateQuerySql} from 'src/homepageExperience/components/steps/python/ExecuteAggregateQuerySql'

import {normalizeEventName} from 'src/cloud/utils/reporting'

import {PythonIcon} from 'src/homepageExperience/components/HomepageIcons'

// Utils
import {event} from 'src/cloud/utils/reporting'

import {
  scrollNextPageIntoView,
  HOMEPAGE_NAVIGATION_STEPS,
} from 'src/homepageExperience/utils'
import {isOrgIOx} from 'src/organizations/selectors'
import {AppState} from 'src/types'
import {connect} from 'react-redux'

interface State {
  currentStep: number
  selectedBucket: string
  finishStepCompleted: boolean
  tokenValue: string
  finalFeedback: number
}

interface Props {
  isOrgIOx: boolean
}

export class PythonWizard extends PureComponent<Props, State> {
  state = {
    currentStep: 1,
    selectedBucket: 'my-bucket',
    finishStepCompleted: false,
    tokenValue: null,
    finalFeedback: null,
  }

  subwayNavSteps = HOMEPAGE_NAVIGATION_STEPS

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
          'firstMile.pythonWizard.next.clicked',
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
          'firstMile.pythonWizard.previous.clicked',
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
      'firstMile.pythonWizard.subNav.clicked',
      {},
      {
        currentStep: normalizeEventName(
          this.subwayNavSteps[clickedStep - 1].name
        ),
      }
    )
    scrollNextPageIntoView()
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="pythonWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="pythonWizard"
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
            wizardEventName="pythonWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="pythonWizard" />
      }
    }
  }

  renderSqlStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return <Overview wizard="pythonWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="pythonWizard"
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
        return <ExecuteAggregateQuerySql bucket={this.state.selectedBucket} />
      }
      case 8: {
        return (
          <Finish
            wizardEventName="pythonSqlWizard"
            markStepAsCompleted={this.handleMarkStepAsCompleted}
            finishStepCompleted={this.state.finishStepCompleted}
            finalFeedback={this.state.finalFeedback}
            setFinalFeedback={this.setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="pythonWizard" />
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
                  settingUpIcon={PythonIcon}
                  settingUpText="Python"
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
                  {this.props.isOrgIOx
                    ? this.renderSqlStep()
                    : this.renderStep()}
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
                  testID="python-prev-button"
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
                  testID="python-next-button"
                />
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    isIOx: isOrgIOx(state),
  }
}

export default connect(mapStateToProps)(PythonWizard)
