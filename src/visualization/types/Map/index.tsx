import {Visualization} from 'src/visualization'
import {CLOUD} from 'src/shared/constants'
import {GeoIcon} from 'src/visualization/types/Map/icon'
import {GeoOptions} from 'src/visualization/types/Map/GeoOptions'
import {GeoProperties} from 'src/visualization/types/Map/properties'
import {Geo} from 'src/visualization/types/Map/view'

export class View implements Visualization {
  type = 'geo'
  name = 'Map'
  graphic = GeoIcon
  initial = GeoProperties
  component = Geo
  options = GeoOptions
  disabled = !CLOUD // Maps are not supported on OSS
}
