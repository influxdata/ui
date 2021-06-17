import {
  Resource,
  ResourceManipulator,
  ResourceUpdater,
  ResourceGenerator,
} from 'src/types/flows'

function useResource<T>(
  resource: Resource<T>,
  onChange: ResourceUpdater<T>,
  generator?: ResourceGenerator<T>
): ResourceManipulator<T> {
  return {
    get: (id: string): T => {
      if (!resource.byID.hasOwnProperty(id)) {
        throw new Error(`Could not find resource [${id}]`)
      }

      return resource.byID[id]
    },
    add: (id: string, data?: T) => {
      if (data) {
        resource.byID[id] = data
        resource.allIDs.push(id)

        return {resource, onChange}
      }

      let _data
      if (typeof generator === 'function') {
        _data = generator()
      } else {
        _data = generator
      }

      if (!_data) {
        throw new Error(`No valid data when adding [${id}]`)
      }

      resource.byID[id] = _data
      resource.allIDs.push(id)
      onChange(resource)
      return null
    },
    update: (id: string, data: Partial<T>) => {
      if (!resource.byID.hasOwnProperty(id)) {
        throw new Error(`Could not update resource [${id}]`)
      }

      resource.byID = {
        ...resource.byID,
        [id]: {
          ...resource.byID[id],
          ...data,
        },
      }

      onChange(resource)
    },
    remove: (id: string) => {
      if (!resource.byID.hasOwnProperty(id)) {
        return
      }

      const filterInPlace = (arr: string[], filter: Function) => {
        let i = 0,
          j = 0
        while (i < arr.length) {
          if (filter(arr[i], i, arr)) {
            arr[j++] = arr[i]
          }
          i++
        }
        arr.length = j
        return arr
      }

      delete resource.byID[id]
      // need to filter in place because allIDs only has a getter
      filterInPlace(resource.allIDs, i => i !== id)

      onChange(resource)
    },

    get allIDs() {
      return resource.allIDs
    },
    get all() {
      return resource.allIDs.map(id => resource.byID[id])
    },

    indexOf: (id: string): number => {
      return resource.allIDs.indexOf(id)
    },
    move: (id: string, index: number) => {
      const _index =
        ((index % resource.allIDs.length) + resource.allIDs.length) %
        resource.allIDs.length

      resource.allIDs.splice(
        _index,
        0,
        resource.allIDs.splice(resource.allIDs.indexOf(id), 1)[0]
      )
      onChange(resource)
    },

    serialize: () => {
      return resource
    },
    byID: resource.byID,
  }
}

export default useResource
