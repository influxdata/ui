import React, {PureComponent} from 'react'

export class Overview extends PureComponent {
  render() {
    return (
      <div>
        <h1 data-testID="overview-page-header">Hello, Time-Series World!</h1>
        <article>
          <p>Welcome and thanks for checking out InfluxData!</p>

          <p>
            In the next 5 minutes, you will set up InfluxData on your machine
            and write and execute some basic queries.
          </p>

          <p>Without further ado, let’s get started.</p>
        </article>
      </div>
    )
  }
}
