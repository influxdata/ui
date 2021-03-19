// Libraries
import React, {SFC} from 'react'

interface Props {
  children: any
}

const WizardFullScreen: SFC<Props> = (props: Props) => {
  return (
    <>
      <div className="wizard--full-screen">
        {props.children}
        <div className="wizard--credits" data-testid="credits">
          Powered by <span className="icon cubo-uniform" />{' '}
          <a
            href="https://www.influxdata.com/"
            target="_blank"
            rel="noreferrer"
          >
            InfluxData
          </a>
        </div>
      </div>
      <div className="auth-image" />
    </>
  )
}

export default WizardFullScreen
