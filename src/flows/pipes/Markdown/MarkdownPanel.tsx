// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types
import {MarkdownMode} from './'

// Components
import MarkdownModeToggle from './MarkdownModeToggle'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {ClickOutside} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {PipeProp} from 'src/types/flows'

const MarkdownMonacoEditor = lazy(() =>
  import('src/shared/components/MarkdownMonacoEditor')
)

const MarkdownPanel: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const handleToggleMode = (mode: MarkdownMode): void => {
    update({mode})
  }

  const handleClickOutside = (): void => {
    update({mode: 'preview'})
  }

  const handlePreviewClick = (): void => {
    update({mode: 'edit'})
  }

  const controls = (
    <MarkdownModeToggle mode={data.mode} onToggleMode={handleToggleMode} />
  )

  const handleChange = (text: string): void => {
    update({text})
  }

  let panelContents = (
    <ClickOutside onClickOutside={handleClickOutside}>
      <Suspense
        fallback={
          <SpinnerContainer
            loading={RemoteDataState.Loading}
            spinnerComponent={<TechnoSpinner />}
          />
        }
      >
        <MarkdownMonacoEditor
          script={data.text}
          onChangeScript={handleChange}
          autogrow
        />
      </Suspense>
    </ClickOutside>
  )

  if (data.mode === 'preview') {
    panelContents = (
      <div
        className="flow-panel--markdown markdown-format"
        onClick={handlePreviewClick}
      >
        <MarkdownRenderer text={data.text} />
      </div>
    )
  }

  return <Context controls={controls}>{panelContents}</Context>
}

export default MarkdownPanel
