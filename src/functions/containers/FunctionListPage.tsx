// Libraries
import React, {FC, useState} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import FunctionCreateButton from 'src/functions/components/FunctionCreateButton'
import FunctionCards from 'src/functions/components/FunctionCards'

// ContextStuff
import FunctionListProvider from 'src/functions/context/function.list'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

const FunctionListPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  return (
    <FunctionListProvider>
      <Page titleTag={pageTitleSuffixer(['Functions'])}>
        <Page.Header fullWidth={false} testID="functions-list-page--header">
          <Page.Title title="Functions List" />
        </Page.Header>
        <Page.ControlBar fullWidth={false}>
          <Page.ControlBarLeft>
            <SearchWidget
              placeholderText="Filter functions..."
              onSearch={setSearchTerm}
              searchTerm={searchTerm}
            />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <FunctionCreateButton />
          </Page.ControlBarRight>
        </Page.ControlBar>
        <Page.Contents fullWidth={false} scrollable={true}>
          <FunctionCards searchTerm={searchTerm} />
        </Page.Contents>
      </Page>
    </FunctionListProvider>
  )
}

export default FunctionListPage
