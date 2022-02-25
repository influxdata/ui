import React, {PureComponent} from 'react'

export class Navigation extends PureComponent {
  render() {
    return (
      <div className="subway-navigation-container">
        <div className="subway-navigation-flex-wrapper">
          <h2>Setting Up</h2>
          <h3>5 minutes</h3>
          <div className="subway-navigation-step">
            <span>icon</span>
            <p>Overview</p>
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
