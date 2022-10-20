/*
    Background:
        * the traditional approaches to file downloads will load the data first into browser memory.
        * this includes:
            * reading the response.body ReadableStream
            * converting to a file Blob
        * there is a web API for FileSystem writes, but it's not implemented for Firefox.
            * https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API/Firefox_support
            * Firefox focused on uploadable streams from the fs. The result == firefox's web API does not support our use case.

    In order to trigger a direct to filesystem download, bypassing the browser memory, we needed:
        * have a response header:
            * `Content-Disposition`
            * which the server attaches in response to a request header `Prefer: return-download`
        * have a form submission request:
            * the XMLhttpRequest does not directly download, even with the appropriate header.
            * cannot use the `a` tag download feature, as that is only GET requests
            * a form submit is build into the browser to allow downloads. **this is the only approach**

    To get the form submit to have a http request which looked like our normal query requests:
        * we used a service worker, which can be an interceptor/listener for form submissions.
            * forms themselves do not allow headers to be attached.
        * then modify the headers, and parse the body to the appropriate format
*/

self.addEventListener('fetch', function (event: any) {
  const contentType = (event.request.headers as Headers).get('Content-Type')
  if (
    new URL(event.request.url).pathname == '/api/v2/query' &&
    contentType == 'application/x-www-form-urlencoded'
  ) {
    const headers = new Headers()
    for (const pair of event.request.headers) {
      switch (pair[0]) {
        case 'content-type':
          headers.append('Content-Type', 'application/json')
          break
        case 'accept':
          headers.append('Accept', '*/*')
          break
        default:
          headers.append(pair[0], pair[1])
      }
    }
    headers.append('Prefer', 'return-download')

    return event.respondWith(
      (async () => {
        const body = (await event.request.formData()).get('data')
        const request = new Request(event.request.url, {
          body,
          headers,
          method: event.request.method,
          mode: 'cors',
          credentials: event.request.credentials,
          signal: event.request.signal,
          cache: event.request.cache,
          referrer: event.request.referrer,
          referrerPolicy: event.request.referrerPolicy,
          redirect: event.request.redirect,
          keepalive: true,
        })
        return fetch(request)
      })()
    )
  } else {
    event.respondWith(fetch(event.request))
  }
})
