import React, {PureComponent} from 'react'
import {event} from 'src/cloud/utils/reporting'

export class Overview extends PureComponent {
  private logDocsOpened = () => {
    event('firstMile.pythonWizard.overview.docs.opened')
  }
  render() {
    return (
      <div>
        <h1>Hello, Time-Series World!</h1>
        <article>
          <p>Welcome and thanks for checking out InfluxData!</p>

          <p>
            In the next 5 minutes, you will set up InfluxData on your machine
            and write and execute some basic queries.
          </p>

          <p>
            If you ever stray away from this set up process, worry not! You can
            always refer to the “Help & Support” item in the side navigation
            menu to return here.
          </p>

          <p>Without further ado, let’s get started.</p>

          <p style={{marginTop: '150px'}}>
            Want to just look at code? Check out the code snippets involved in
            this guide on{' '}
            <a
              href="https://github.com/influxdata/ui"
              onClick={this.logDocsOpened}
            >
              Github
            </a>
            .
          </p>
        </article>
      </div>
    )
  }
}
