// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
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
import {PipeProp} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'

const MarkdownMonacoEditor = lazy(
  () => import('src/shared/components/MarkdownMonacoEditor')
)

const MarkdownPanel: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const {flow} = useContext(FlowContext)

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

  if (flow.readOnly || data.mode === 'preview') {
    const markdownClassname = classnames('flow-panel--markdown markdown-format')
    panelContents = (
      <div className={markdownClassname}>
        <MarkdownRenderer text={data.text} />
      </div>
    )
  }

  const controls = <MarkdownModeToggle />
  return <Context controls={controls}>{panelContents}</Context>
}

export default MarkdownPanel
