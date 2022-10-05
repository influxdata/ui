import {FLUX_RESPONSE_BYTES_LIMIT} from 'src/shared/constants'
import {getFlagValue} from 'src/shared/utils/featureFlag'
import {PROJECT_NAME} from 'src/flows/constants'
import {FluxResult, FluxResultComplete} from 'src/shared/apis/query'

/*
  Given an arbitrary text chunk of a Flux CSV, trim partial lines off of the end
  of the text.

  For example, given the following partial Flux response,

            r,baz,3
      foo,bar,baz,2
      foo,bar,b

  we want to trim the last incomplete line, so that the result is

            r,baz,3
      foo,bar,baz,2

*/
export const trimPartialLines = (partialResp: string): string => {
  let i = partialResp.length - 1

  while (partialResp[i] !== '\n') {
    if (i <= 0) {
      return partialResp
    }

    i -= 1
  }

  return partialResp.slice(0, i + 1)
}

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

export async function* fluxDataReader(
  responseBody: ReadableStream<Uint8Array>
): AsyncGenerator<FluxResult, FluxResultComplete> {
  const reader = responseBody.getReader()
  const decoder = new TextDecoder()

  let csv = ''
  let bytesRead = 0
  let maxTableIdx = null
  let didTruncate = false
  let read = await reader.read()

  let BYTE_LIMIT = getFlagValue('increaseCsvLimit') ?? FLUX_RESPONSE_BYTES_LIMIT

  if (!window.location.pathname.includes(PROJECT_NAME.toLowerCase())) {
    BYTE_LIMIT =
      getFlagValue('dataExplorerCsvLimit') ?? FLUX_RESPONSE_BYTES_LIMIT
  }

  let text
  while (!read.done) {
    text = decoder.decode(read.value)
    const tableNum = extractTableId(text)
    if (Number.isInteger(tableNum)) {
      maxTableIdx = Math.max(maxTableIdx, tableNum)
    }

    bytesRead += read.value.byteLength
    if (didTruncate) {
    } else if (bytesRead > BYTE_LIMIT) {
      csv += trimPartialLines(text)
      didTruncate = true
      yield {
        csv,
        bytesRead,
        didTruncate,
      }
    } else {
      csv += text
    }
    read = await reader.read()
  }

  reader.cancel()

  return {
    csv,
    bytesRead,
    didTruncate,
    metadata: {
      tableCnt: maxTableIdx != null ? maxTableIdx + 1 : 0,
    },
  }
}
