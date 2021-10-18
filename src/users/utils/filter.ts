// filter any *primitive* T[K] value
export const filter = <T, K extends keyof T>(
  items: T[],
  keys: K[],
  searchTerm: string
) => {
  const matches = (item: T) =>
    keys.some(key =>
      (!!item[key] ? item[key].toString() : '').includes(searchTerm)
    )

  return items.filter(matches)
}
