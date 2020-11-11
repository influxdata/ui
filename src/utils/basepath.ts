import {getRootNode} from 'src/utils/nodes'
import {STATIC_PREFIX, API_BASE_PATH} from 'src/shared/constants'

export const getBrowserBasepath = () => {
  const rootNode = getRootNode()
  if (!rootNode) {
    return ''
  }

  return rootNode.getAttribute('data-basepath') || ''
}

export const getBasepath = () => {
  if (!STATIC_PREFIX || STATIC_PREFIX === '/') {
    return ''
  }

  return STATIC_PREFIX.slice(0, -1)
}

export const getAPIBasepath = () => {
  if (!API_BASE_PATH || API_BASE_PATH === '/') {
    return ''
  }

  return API_BASE_PATH.slice(0, -1)
}

export const stripPrefix = (pathname, basepath = getBasepath()) => {
  if (basepath === '') {
    return pathname
  }

  const expr = new RegExp(`^${basepath}`)
  const matches = pathname.match(expr)
  if (matches) {
    return pathname.replace(expr, '')
  }
}
