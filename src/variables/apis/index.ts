// Utils
import {downloadTextFile} from 'src/shared/utils/download'

import {postTemplatesExport} from 'src/client'

export const downloadVariableTemplate = async (variable): Promise<void> => {
  const resp = await postTemplatesExport({
    data: {
      resources: [
        {
          kind: 'Variable',
          id: variable.id,
        },
      ],
    },
  })

  if (resp.status === 500) {
    throw new Error(resp.data.message)
  }

  const data = await resp.data
  downloadTextFile(JSON.stringify(data), variable.name, '.json', 'text/json')
}