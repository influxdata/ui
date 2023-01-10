export interface LspRange {
  start: LspPosition
  end: LspPosition
}

export interface LspPosition {
  column: number
  line: number
}
