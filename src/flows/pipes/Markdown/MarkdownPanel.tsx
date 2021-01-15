// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import classnames from 'classnames'

// Types
import {MarkdownMode} from './'

// Components
import MarkdownModeToggle from './MarkdownModeToggle'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {ClickOutside} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {PipeProp} from 'src/types/flows'

import {
  MARKDOWN_PIPE_PLACEHOLDER,
  MARKDOWN_PIPE_INITIAL,
} from 'src/flows/pipes/Markdown/index'

const MarkdownMonacoEditor = lazy(() =>
  import('src/shared/components/MarkdownMonacoEditor')
)

const MarkdownPanel: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)

  const showPlaceholder = (): void => {
    if (data.text === MARKDOWN_PIPE_INITIAL) {
      update({text: MARKDOWN_PIPE_PLACEHOLDER})
    }
  }

  const hidePlaceholder = (): void => {
    if (data.text === MARKDOWN_PIPE_PLACEHOLDER) {
      update({text: MARKDOWN_PIPE_INITIAL})
    }
  }

  const handleToggleMode = (mode: MarkdownMode): void => {
    if (mode === 'preview') {
      showPlaceholder()
    } else if (mode === 'edit') {
      hidePlaceholder()
    }

    update({mode})
  }

  const handleClickOutside = (): void => {
    handleToggleMode('preview')
  }

  const handlePreviewClick = (): void => {
    handleToggleMode('edit')
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
    const markdownClassname = classnames(
      'flow-panel--markdown markdown-format',
      {
        'flow-panel--markdown__placeholder':
          data.text === MARKDOWN_PIPE_PLACEHOLDER,
      }
    )
    panelContents = (
      <div className={markdownClassname} onClick={handlePreviewClick}>
        <MarkdownRenderer text={data.text} />
      </div>
    )
  }

  return <Context controls={controls}>{panelContents}</Context>
}

export default MarkdownPanel
