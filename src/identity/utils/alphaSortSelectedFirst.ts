import {SelectableItem} from '@influxdata/clockface'

export const alphaSortSelectedFirst = (
  itemArray,
  selectedItem: SelectableItem
) => {
  return [...itemArray].sort((a, b) => {
    if (a.id === selectedItem.id) {
      return -1
    } else if (b.id === selectedItem.id) {
      return 1
    } else {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
    }
  })
}
