const collator = new Intl.Collator('en', {
  usage: 'sort',
  // Not case or accent sensitive
  sensitivity: 'base',
  ignorePunctuation: false,
  // Sort numerical results like this ('1' < '2' < '10)
  numeric: true,
  // Upper case not sorted before lower case
  caseFirst: 'false',
})

export const alphaSortSelectedFirst = (itemArray, selectedItem) => {
  return [...itemArray].sort((a, b) => {
    if (a.id === selectedItem.id) {
      return -1
    } else if (b.id === selectedItem.id) {
      return 1
    } else {
      return collator.compare(a.name, b.name)
    }
  })
}
