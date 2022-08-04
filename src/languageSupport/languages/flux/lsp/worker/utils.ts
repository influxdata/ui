export const respond = (msg, cb) => {
  try {
    // LSP spec permits a blank response
    if (!msg) {
      return
    }
    const d = JSON.parse(msg)
    cb(d)
  } catch (e) {
    console.error(e)
  }
}
