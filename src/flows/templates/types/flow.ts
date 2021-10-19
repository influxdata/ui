export default register =>
  register({
    type: 'id',
    init: id => fetch(`/api/v2private/notebooks/${id}`).then(res => res.json()),
  })
