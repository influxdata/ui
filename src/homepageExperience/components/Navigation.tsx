import React, {PureComponent} from 'react'
import {
  AlertIcon,
  ExecuteQueryIcon,
  FinishIcon,
  InitializeClientIcon,
  InstallDependenciesIcon,
  OverviewIcon,
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
          <h2>Setting Up</h2>
          <h3>5 minutes</h3>
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
