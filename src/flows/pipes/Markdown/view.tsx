// Libraries
import React, {FC, lazy, Suspense, useContext, useEffect} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import classnames from 'classnames'

// Components
import MarkdownModeToggle from './MarkdownModeToggle'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {PipeContext} from 'src/flows/context/pipe'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PipeProp} from 'src/types/flows'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const MarkdownMonacoEditor = lazy(() =>
  import('src/shared/components/MarkdownMonacoEditor')
)

const MarkdownPanel: FC<PipeProp> = ({Context}) => {
  const {id, data, update} = useContext(PipeContext)
  const {register} = useContext(SidebarContext)

  const handlePreviewClick = (): void => {
    update({mode: 'edit'})
  }

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'Markdown',
        actions: [
          {
            title: () => (data.mode === 'edit' ? 'Preview' : 'Edit'),
            action: () => {
              update({mode: data.mode === 'edit' ? 'preview' : 'edit'})
            },
          },
        ],
      },
    ])
  }, [id, update, data])

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
    const markdownClassname = classnames('flow-panel--markdown markdown-format')
    panelContents = (
      <div className={markdownClassname} onClick={handlePreviewClick}>
        <MarkdownRenderer text={data.text} />
      </div>
    )
  }

  const controls = isFlagEnabled('flow-sidebar') ? null : <MarkdownModeToggle />
  return (
    <Context controls={controls} resizes>
      {panelContents}
    </Context>
  )
}

export default MarkdownPanel
