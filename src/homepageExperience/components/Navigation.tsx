import React, {PureComponent} from 'react'
import {
  AlertIcon,
  ClockIcon,
  ExecuteQueryIcon,
  FinishIcon,
  InitializeClientIcon,
  InstallDependenciesIcon,
  OverviewIcon,
  PythonIcon,
  TokenIcon,
  WriteDataIcon,
} from 'src/homepageExperience/components/HomepageIcons'
import Step from './steps/Step'

interface OwnProps {
  currentStep: number
}

const steps = [
  {
    name: 'Overview',
    icon: OverviewIcon,
  },
  {
    name: 'Install \n Dependencies',
    icon: InstallDependenciesIcon,
  },
  {
    name: 'Create a \n Token',
    icon: TokenIcon,
  },
  {
    name: 'Initialize \n Client',
    icon: InitializeClientIcon,
  },
  {
    name: 'Write \n Data',
    icon: WriteDataIcon,
  },
  {
    name: 'Execute a \n Simple Query',
    icon: ExecuteQueryIcon,
  },
  {
    name: 'Execute an \n Aggregate Query',
    icon: ExecuteQueryIcon,
  },
  {
    name: '(Optional) \n Set up Alerts',
    icon: AlertIcon,
  },
  {
    name: 'Finish',
    icon: FinishIcon,
  },
]

export class Navigation extends PureComponent<OwnProps> {
  render() {
    return (
      <div className="subway-navigation-container">
        <div className="subway-navigation-flex-wrapper">
          <div className="subway-navigation-title">
            <span className="subway-navigation-title-icon">{PythonIcon}</span>
            <div className="subway-navigation-title-text">
              <h3>Setting Up</h3>
              <h6>Python</h6>
            </div>
          </div>
          <div className={'subway-navigation-time-to-complete'}>
            {ClockIcon}
            <h5> 5 minutes</h5>
          </div>
          {steps.map((value, index) => (
            <Step
              stepIsActive={index === this.props.currentStep - 1}
              stepIsComplete={index < this.props.currentStep - 1}
              icon={value.icon}
              text={value.name}
              key={index}
            />
          ))}
        </div>
      </div>
    )
  }
}
