import {EditorType} from 'src/types'

export function submit(editor: EditorType, submitFn: () => any) {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    submitFn()
  })
}
