import React, {SFC, MouseEvent} from 'react'

import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {DapperScrollbars} from '@influxdata/clockface'

interface Props {
  note: string
  scrollTop: number
  onScroll: (e: MouseEvent) => void
}

const NoteEditorPreview: SFC<Props> = props => {
  return (
    <div className="note-editor--preview" data-testid="note-editor--preview">
      <DapperScrollbars
        className="note-editor--preview-scroll"
        scrollTop={props.scrollTop}
        onScroll={props.onScroll}
      >
        <div className="note-editor--markdown-container">
          <MarkdownRenderer text={props.note} className="markdown-format" />
        </div>
      </DapperScrollbars>
    </div>
  )
}

export default NoteEditorPreview
