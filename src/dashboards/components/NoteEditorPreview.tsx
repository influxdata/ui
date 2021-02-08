import React, {SFC} from 'react'

import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {DapperScrollbars} from '@influxdata/clockface'

interface Props {
  note: string
}

const NoteEditorPreview: SFC<Props> = props => {
  return (
    <div className="note-editor--preview" data-testid="note-editor--preview">
      <DapperScrollbars className="note-editor--preview-scroll">
        <div className="note-editor--markdown-container">
          <MarkdownRenderer text={props.note} className="markdown-format" />
        </div>
      </DapperScrollbars>
    </div>
  )
}

export default NoteEditorPreview
