const makeResponse = (status, data, ...args) => {
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]) // eslint-disable-line no-console
  }

  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const deleteOrgUser = async (orgID: string, id: string): any => {
  return makeResponse(204, null, orgID, id)
}
