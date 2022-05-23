import React, {FC, useEffect, useRef} from 'react'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'

type Props = {
  wizard: string
}

export const Overview: FC<Props> = ({wizard}) => {
  const videoFrame = useRef<null | HTMLIFrameElement>(null)

  // onClick (and related events) are unavailable for media embedded in iframes because they represented a nested browsing context. This solution, which infers a click from an onBlur event where the iframe is the active element on the DOM, is adapted from https://github.com/springload/react-iframe-click

  useEffect(() => {
    const checkVidClick = () => {
      if (
        document.activeElement &&
        document.activeElement.nodeName.toLowerCase() === 'iframe' &&
        videoFrame.current &&
        videoFrame.current === document.activeElement
      ) {
        event(`firstMile.${wizard}Video.clicked`)
      }
    }
    window.addEventListener('blur', checkVidClick)
  }, [])

  return (
    <div>
      <h1>Hello, Time-Series World!</h1>
      <article>
        <p>Welcome and thanks for checking out InfluxData!</p>

        <p>
          In the next 5 minutes, you will set up InfluxData on your machine and
          write and execute some basic queries.
        </p>
        <iframe
          ref={videoFrame}
          width="560"
          height="315"
          src="https://www.youtube.com/embed/KZwr1xBDbBQ"
          title="InfluxData - What is Time Series"
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
