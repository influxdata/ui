// Libraries
import React, {FC, lazy, Suspense} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Utils
import {humanizeNote} from 'src/dashboards/utils/notes'

const MarkdownMonacoEditor = lazy(() =>
  import('src/shared/components/MarkdownMonacoEditor')
)

interface Props {
  note: string
  onChangeNote: (value: string) => void
}

const NoteEditorText: FC<Props> = ({note, onChangeNote}) => (
  <div className="note-editor--editor">
    <Suspense
      fallback={
        <SpinnerContainer
          loading={RemoteDataState.Loading}
          spinnerComponent={<TechnoSpinner />}
        />
      }
    >
      <MarkdownMonacoEditor
        script={humanizeNote(note)}
        onChangeScript={onChangeNote}
      />
    </Suspense>
  </div>
)

export default NoteEditorText
