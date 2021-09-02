// Libraries
import React, {FC} from 'react'
import {AppWrapper, Page} from '@influxdata/clockface'
import {DapperScrollbars} from '@influxdata/clockface'

// Contexts
import {FlowProvider} from 'src/flows/context/shared'
import {FlowQueryProvider} from 'src/flows/context/flow.query'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsProvider} from 'src/flows/context/results'
import {SidebarProvider} from 'src/flows/context/sidebar'

// Components
import ReadOnlyPipeList from 'src/flows/components/ReadOnlyPipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import ReadOnlyHeader from 'src/flows/components/ReadOnlyHeader'

import 'src/flows/style.scss'
import 'src/flows/shared/Resizer.scss'
import '@influxdata/clockface/dist/index.css'

const FlowContainer: FC = () => (
  <AppWrapper>
    <FlowProvider>
      <ResultsProvider>
        <FlowQueryProvider>
          <SidebarProvider>
            <Page>
              <ReadOnlyHeader />
              <Page.Contents
                fullWidth={true}
                scrollable={false}
                className="flow-page"
              >
                <PopupProvider>
                  <DapperScrollbars
                    noScrollX
                    thumbStartColor="gray"
                    thumbStopColor="gray"
                  >
                    <ReadOnlyPipeList />
                  </DapperScrollbars>
                  <SubSideBar />
                  <PopupDrawer />
                </PopupProvider>
              </Page.Contents>
            </Page>
          </SidebarProvider>
        </FlowQueryProvider>
      </ResultsProvider>
    </FlowProvider>
  </AppWrapper>
)

export default FlowContainer
