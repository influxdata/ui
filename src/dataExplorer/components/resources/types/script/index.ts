import {ResourceTypes} from '../..'
import editor from './editor'

export default function script(register) {
  register({
    type: ResourceTypes.Script,
    editor,
    init: id => {
      if (!id) {
        return Promise.resolve({
          type: ResourceTypes.Script,
          flux: '',
          data: {
            name: 'Untitled Script',
          },
        })
      }
    },
    persist: _resource => {},
  })
}
