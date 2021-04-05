// Libraries
import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

interface Props {
  title: string
}

const AppPageHeader: FC<Props> = ({title, children}) => {
  return (
    <Page.Header fullWidth={false}>
      <Page.Title title={title} />
      {children}
    </Page.Header>
  )
}

export default AppPageHeader
