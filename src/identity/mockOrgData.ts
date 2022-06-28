export const generateOrgs = (num: number) => {
  const orgs = {
    orgs: [],
  }
  for (let i = 1; i <= num; i++) {
    orgs.orgs.push({
      id: 20000 + i,
      // Change this if desired that default account not be first.
      name: 'Random Org ' + Math.floor(Math.random() * 50000),
    })
  }
  return orgs
}
