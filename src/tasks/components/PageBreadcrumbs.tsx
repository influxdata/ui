import React, {FC} from 'react'

// Components
import {FlexBox, FlexDirection} from '@influxdata/clockface'

type PageInfo = {
  text: string
  onClick?: () => void
}

type Props = {
  pages: Array<PageInfo>
}

const PageBreadcrumbs: FC<Props> = ({pages}) => {
  const getCrumb = (page: PageInfo, isItTheLastPage: boolean) => {
    const text = `${page.text}${!isItTheLastPage ? ' >' : ''}`

    const styles = {marginRight: 10}

    return !page.onClick ? (
      <h1 style={styles}>{text}</h1>
    ) : (
      <h1 style={styles} onClick={page.onClick}>
        {text}
      </h1>
    )
  }

  return (
    <FlexBox direction={FlexDirection.Row}>
      {pages.map((page: PageInfo, index: number) => {
        const isItTheLastPage: boolean = index + 1 === pages.length

        return <div key={page.text}>{getCrumb(page, isItTheLastPage)}</div>
      })}
    </FlexBox>
  )
}

export default PageBreadcrumbs
