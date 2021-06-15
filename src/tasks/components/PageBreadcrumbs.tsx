import React, {FC} from 'react'

// Components
import {FlexBox, FlexDirection} from '@influxdata/clockface'

type PageInfo = {
  text: string
  onClick?: () => void 
}

type Props = {
  pages: PageInfo[]
}

const PageBreadcrumbs: FC<Props> = ({pages}) => {
  const getCrumb = (page: PageInfo, isItTheLastPage: boolean) => {
    
    const text = `${page.text}${!isItTheLastPage ? ' >' : ''}`

     if(!page.onClick) {
        return <h1 className="bread-crumb-title">{text}</h1>
     } else {
        return (
          <h1 id="bread-crumb-title" onClick={page.onClick}>{text}</h1>
        )
     }
  }

  return (
    <FlexBox direction={FlexDirection.Row}>
      {pages.map((page: PageInfo, index: number) => {
        const isItTheLastPage: boolean = index + 1 === pages.length

        return <div key={page.text} className="pointer">{getCrumb(page, isItTheLastPage)}</div>
      })}
    </FlexBox>
  )
}

export default PageBreadcrumbs
