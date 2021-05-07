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

  const handlePreviewClick = (): void => {
    update({mode: 'edit'})
  }

  const controls = [
    {
      title: 'Edit',
      actions: [
        {
          title: 'Edit',
          action: () => {
            update({mode: 'edit'})
          },
        },
        {
          title: 'Preview',
          action: () => {
            update({mode: 'preview'})
          },
        },
      ],
    },
  ]

  const handleChange = (text: string): void => {
    update({text})
  }

  let panelContents = (
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
