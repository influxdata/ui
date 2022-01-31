import View from './view'
import ReadOnly from './readOnly'
import {PipeData} from 'src/types'
import { patchTask } from 'src/client'

const removeFlowTasks = (tasks = []) => {
  tasks.forEach(task => {
    patchTask({
      taskID: task.id,
      data: {
        status: 'inactive',
      },
    })
  })
}

export default register => {
  register({
    type: 'schedule',
    family: 'output',
    priority: 1,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--schedule',
    button: 'Task',
    beforeRemove: (data: PipeData) => removeFlowTasks(data?.task),
  })
}
