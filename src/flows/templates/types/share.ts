export default register =>
  register({
    type: 'share',
    init: accessID => fetch(`/api/share/${accessID}`).then(res => res.json()),
  })
