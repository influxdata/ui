import React, {FC} from 'react'

import {Panel} from '@influxdata/clockface'

const SubscriptionManagerPanel: FC = ({children}) => (
  <Panel
    style={{
      backgroundImage:
        'linear-gradient(47deg,rgba(19,0,45,0) 65%,rgba(191,47,229,0.4) 100%)',
      backgroundColor: '#13002d',
    }}
  >
    {children}
  </Panel>
)

export default SubscriptionManagerPanel
