export const registerServiceWorker = (): Promise<ServiceWorkerRegistration> => {
  // Worker -- load prior to page load event, in order to intercept fetch in http/2.
  // see service worker life cycle. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
  let workerRegistration = null
  if ('serviceWorker' in navigator) {
    workerRegistration = navigator.serviceWorker.register(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new URL('../workers/downloadHelper.ts', import.meta.url),
      {scope: '/api/v2/query'}
      /* webpackChunkName: "interceptor" */
    )
  }

  return workerRegistration
}
