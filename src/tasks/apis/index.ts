// Utils
import {downloadTextFile} from 'src/shared/utils/download'

import {postTemplatesExport} from 'src/client'

export const downloadTaskTemplate = async (task): Promise<void> => {
  const resp = await postTemplatesExport({
    data: {
      resources: [
        {
          kind: 'Task',
          id: task.id,
        },
      ],
    },
  })

  if (resp.status === 500) {
    throw new Error(resp.data.message)
  }

  const data = await resp.data
  downloadTextFile(JSON.stringify(data), task.name, '.json', 'text/json')
}
