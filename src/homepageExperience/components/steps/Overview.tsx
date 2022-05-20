import React, {FC, useEffect, useRef} from 'react'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'

type Props = {
  wizard: string
}

export const Overview: FC<Props> = ({wizard}) => {
  const videoFrame = useRef<null | HTMLIFrameElement>(null)

  // Can't use an onClick for events because the iframe targets another site.
  // Can use this workaround. For more info see https://github.com/springload/react-iframe-click

  useEffect(() => {
    console.log('loaded')
    const checkVidClick = () => {
      console.log(document.activeElement)
      if (
        document.activeElement &&
        document.activeElement.nodeName.toLowerCase() === 'iframe' &&
        videoFrame.current &&
        videoFrame.current === document.activeElement
      ) {
        console.log(wizard)
        event(`firstMile.${wizard}Video.clicked`)
      }
      // If we don't want this to happen for subsequent clicks on the video, remove during cleanup
      /*
      return () => {
        window.removeEventListener('blur', checkVidClick)
      }
      */
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
