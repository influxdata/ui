export default register =>
  register({
    type: 'share',
    init: accessID =>
      fetch(`/api/share/${accessID}`)
        .then(res => res.json())
        .then(res => {
          delete res.id
          res.spec.pipes.forEach(p => delete p.id)

          return res
        }),
  })
