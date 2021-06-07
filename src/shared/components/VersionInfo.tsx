// Libraries
import React, {PureComponent} from 'react'

// Components
import VersionInfoOSS from 'src/shared/components/VersionInfoOSS'

// Constants
import {VERSION, GIT_SHA, CLOUD} from 'src/shared/constants'

interface Props {
  widthPixels?: number
}

class VersionInfo extends PureComponent<Props> {
  public render() {
    return (
      <div
        className="version-info"
        style={this.style}
        data-testid="version-info"
      >
        <p>
          {CLOUD ? (
            <>
              Version {VERSION}{' '}
              {GIT_SHA && <code>({GIT_SHA.slice(0, 7)})</code>}
            </>
          ) : (
            <VersionInfoOSS />
          )}
        </p>
      </div>
    )
  }

  private get style() {
    if (this.props.widthPixels) {
      return {width: `${this.props.widthPixels}px`}
    }
  }
}

export default VersionInfo
