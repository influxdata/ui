import {BASE_PATH} from 'src/shared/constants'

export const registerServiceWorker = (): Promise<ServiceWorkerRegistration> => {
  // Worker -- load prior to page load event, in order to intercept fetch in http/2.
  // see service worker life cycle. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
  let workerRegistration = null
  if ('serviceWorker' in navigator) {
    workerRegistration = navigator.serviceWorker.register(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new URL('../workers/downloadHelper.ts', import.meta.url),
      {scope: `${BASE_PATH}api/v2/query`}
      /* webpackChunkName: "interceptor" */
    )
  }

  return workerRegistration
}

export const registerServiceWorkerInfluxQL =
  (): Promise<ServiceWorkerRegistration> => {
    // Worker -- load prior to page load event, in order to intercept fetch in http/2.
    // see service worker life cycle. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
    let workerRegistrationInfluxQL = null
    if ('serviceWorker' in navigator) {
      workerRegistrationInfluxQL = navigator.serviceWorker.register(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new URL('../workers/downloadHelper.ts', import.meta.url),
        {scope: `${BASE_PATH}query`}
        /* webpackChunkName: "interceptor" */
      )
    }

    return workerRegistrationInfluxQL
  }

export const registerServiceWorkerSQL =
  (): Promise<ServiceWorkerRegistration> => {
    // Worker -- load prior to page load event, in order to intercept fetch in http/2.
    // see service worker life cycle. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
    let workerRegistrationSQL = null
    if ('serviceWorker' in navigator) {
      workerRegistrationSQL = navigator.serviceWorker.register(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new URL('../workers/downloadHelper.ts', import.meta.url),
        {scope: `${BASE_PATH}api/v2private/query`}
        /* webpackChunkName: "interceptor" */
      )
    }

    return workerRegistrationSQL
  }
