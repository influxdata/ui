export const extractTableId = (str: string): number | null => {
  let prevIdx = 0
  let currIdx = 0
  let col = 0
  let maxTableIdx = null

  const nextLine = () => {
    col = 0
    prevIdx = currIdx
    const nextIdx = str.substring(currIdx + 1).search(/\r\n/)
    currIdx = nextIdx == -1 ? nextIdx : currIdx + 1 + nextIdx + 2
  }
  const nextCol = () => {
    prevIdx = currIdx
    const nextIdx = str.substring(currIdx + 1).search(/\,/)
    currIdx = nextIdx == -1 ? nextIdx : currIdx + 1 + nextIdx
  }

  nextLine()
  while (currIdx !== -1 && str[currIdx] !== undefined) {
    switch (str[currIdx]) {
      case '#':
        nextLine()
        break
      case ',':
        if (col == 2) {
          try {
            const tableIdx = parseInt(str.substring(prevIdx + 1, currIdx))
            maxTableIdx = Math.max(maxTableIdx || 0, tableIdx)
          } catch {}
          nextLine()
          break
        }
        col++
        nextCol()
        break
      case '\r':
      case '\n':
      default:
        nextLine()
        break
    }
  }
  return maxTableIdx
}
