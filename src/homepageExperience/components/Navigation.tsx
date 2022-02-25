import React, {PureComponent} from 'react'

import overviewLogo from 'assets/images/homepageExperience/overview.svg'

export class Navigation extends PureComponent {
  render() {
    return (
      <div className="subway-navigation-container">
        <div className="subway-navigation-flex-wrapper">
          <h2>Setting Up</h2>
          <h3>5 minutes</h3>
          <div className="subway-navigation-step">
            <span className="subway-navigation-step-icon-container">
              <img className="subway-navigation-step-icon" src={overviewLogo} />
            </span>
            Overview
          </div>
          <div className="subway-navigation-step">
            <span>icon</span>
            <p>Install Dependencies</p>
          </div>
        </div>
      </div>
    )
  }
}
