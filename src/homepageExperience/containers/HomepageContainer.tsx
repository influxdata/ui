import React, {PureComponent} from 'react'

import {Button} from '@influxdata/clockface'

import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Navigation} from 'src/homepageExperience/components/Navigation'

import '../components/homepageExperience.scss'

export default class HomepageContainer extends PureComponent {
  state = {
    currentStep: 1
  }

  handleNextClick = () => {
    this.setState({currentStep: this.state.currentStep + 1})
  }

  renderStep = () => {
    console.log('current step', this.state.currentStep)
    switch (this.state.currentStep) {
      case 1: {
        return (<Overview />)
      }
      default: {
        return (<Overview />)
      }
    }
  }

  render() {
    return (
      <div className="homepage-container">
        <aside className="homepage-container--subway">
          <div style={{width: '100%'}}>
            <Navigation />
          </div>
        </aside>
        <main className="homepage-container--main">
          <div className="homepage-container--main-wrapper">
            {this.renderStep()}
          </div>
          <Button onClick={this.handleNextClick} text="Next" />
        </main>
      </div>
    )
  }
}
