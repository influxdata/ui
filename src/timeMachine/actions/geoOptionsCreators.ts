import {MapType} from 'src/timeMachine/components/view_options/GeoOptions'

export const SET_MAP_TYPE = 'SET_MAP_TYPE'
export const SET_ZOOM_VALUE = 'SET_ZOOM_VALUE'
export const SET_ALLOW_PAN_AND_ZOOM = 'SET_ALLOW_PAN_AND_ZOOM'
export const SET_LATITUDE = 'SET_LATITUDE'
export const SET_LONGITUDE = 'SET_LONGITUDE'
export const SET_RADIUS = 'SET_RADIUS'

export type Action =
  | ReturnType<typeof setMapType>
  | ReturnType<typeof setZoomValue>
  | ReturnType<typeof setAllowPanAndZoom>
  | ReturnType<typeof setLatitude>
  | ReturnType<typeof setLongitude>
  | ReturnType<typeof setRadius>

export const setMapType = (mapType: MapType) =>
  ({
    type: SET_MAP_TYPE,
    mapType,
  } as const)
export const setZoomValue = (zoom: number) =>
  ({
    type: SET_ZOOM_VALUE,
    zoom,
  } as const)
export const setAllowPanAndZoom = (allowPanAndZoom: boolean) =>
  ({
    type: SET_ALLOW_PAN_AND_ZOOM,
    allowPanAndZoom,
  } as const)
export const setLatitude = (lat: number) =>
  ({
    type: SET_LATITUDE,
    lat,
  } as const)
export const setLongitude = (lon: number) =>
  ({
    type: SET_LONGITUDE,
    lon,
  } as const)

export const setRadius = (radius: number) =>
  ({
    type: SET_RADIUS,
    radius,
  } as const)
