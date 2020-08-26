// Libraries
import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import NotebookHeader from 'src/notebooks/components/header'
import PipeList from 'src/notebooks/components/PipeList'
import MiniMap from 'src/notebooks/components/minimap/MiniMap'

// Contexts
import {ResultsProvider} from 'src/notebooks/context/results'
import {RefProvider} from 'src/notebooks/context/refs'
import CurrentNotebook from 'src/notebooks/context/notebook.current'
import {ScrollProvider} from 'src/notebooks/context/scroll'

// NOTE: uncommon, but using this to scope the project
// within the page and not bleed it's dependancies outside
// of the feature flag
import 'src/notebooks/style.scss'

const NotebookPage: FC = () => {
  return (
    <CurrentNotebook>
      <ResultsProvider>
        <RefProvider>
          <ScrollProvider>
            <Page titleTag="Flows">
              <NotebookHeader />
              <Page.Contents
                fullWidth={true}
                scrollable={false}
                className="notebook-page"
              >
                <div className="notebook">
                  <MiniMap />
                  <PipeList />
                </div>
              </Page.Contents>
            </Page>
          </ScrollProvider>
        </RefProvider>
      </ResultsProvider>
    </CurrentNotebook>
  )
}

export default NotebookPage
