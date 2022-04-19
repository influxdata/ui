import React, {PureComponent} from 'react'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export class Overview extends PureComponent {
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

          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/KZwr1xBDbBQ"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{marginBottom: '20px'}}
          />

          <p>
            Join our{' '}
            <SafeBlankLink href="https://www.influxdata.com/slack">
              community slack{' '}
            </SafeBlankLink>{' '}
            to ask any questions you have along the way!
          </p>
        </article>
      </div>
    )
  }
}
