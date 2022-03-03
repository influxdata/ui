import React, {PureComponent} from 'react'

export class Overview extends PureComponent {
  render() {
    return (
      <>
        <h1>Hello, Time-Series World!</h1>
        <p>
          Welcome and thanks for checking out InfluxData!
          <br /> <br />
          In the next 5 minutes, you will set up InfluxData on your machine and
          write and execute some basic queries.
          <br /> <br />
          If you ever stray away from this set up process, worry not! You can
          always refer to the “Help & Support” item in the side navigation menu
          to return here.
          <br /> <br />
          Without further ado, let’s get started.
          <br /> <br /> <br /> <br /> <br /> <br />
          Want to just look at code? Check out the code snippets involved in
          this guide on <a href="https://github.com/influxdata/ui">Github</a>.
        </p>
      </>
    )
  }
}
