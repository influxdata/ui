export const sortFuncs = (a, b) => {
  if (a.package.toLowerCase() === b.package.toLowerCase()) {
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  } else {
    return a.package.toLowerCase() < b.package.toLowerCase() ? -1 : 1
  }
}
