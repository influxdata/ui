import React, {PureComponent} from 'react'

// Components
import {FlexBox, FlexDirection} from '@influxdata/clockface'

type PageInfo = {
  text: string
  onClick?: () => void
}

type Props = {
  pages: Array<PageInfo>
}

export default class PageBreadcrumbs extends PureComponent<Props> {
  constructor(props) {
    super(props)
  }

  private getCrumb(page: PageInfo, isItTheLastPage: boolean) {
    let text: string = page.text

    if (!isItTheLastPage) {
      text += ' > '
    }

    const styles = {marginRight: 10}

    return !page.onClick ? (
      <h1 style={styles}>{text}</h1>
    ) : (
      <h1 style={styles} onClick={page.onClick}>
        {text}
      </h1>
    )
  }

  public render() {
    return (
      <FlexBox direction={FlexDirection.Row}>
        {this.props.pages.map((page: PageInfo, index: number) => {
          const isItTheLastPage: boolean = index + 1 === this.props.pages.length

          return (
            <div key={page.text}>{this.getCrumb(page, isItTheLastPage)}</div>
          )
        })}
      </FlexBox>
    )
  }
}
