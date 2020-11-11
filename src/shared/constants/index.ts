import _ from 'lodash'
import {
  Config,
  NINETEEN_EIGHTY_FOUR,
  ATLANTIS,
  DO_ANDROIDS_DREAM,
  DELOREAN,
  CTHULHU,
  ECTOPLASM,
  T_MAX_400_FILM,
} from '@influxdata/giraffe'
import {InfluxColors} from '@influxdata/clockface'

import {AutoRefreshStatus} from 'src/types'

function formatConstant(constant: string) {
  if (!constant) {
    return ''
  }
  return constant.trim()
}

export const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss ZZ'

export const DROPDOWN_MENU_MAX_HEIGHT = 240

export const PRESENTATION_MODE_ANIMATION_DELAY = 0 // In milliseconds.

export const HTTP_UNAUTHORIZED = 401
export const HTTP_FORBIDDEN = 403
export const HTTP_NOT_FOUND = 404

export const ALLOW_IMPORT_FROM_TEMPLATE = false

export const AUTOREFRESH_DEFAULT_INTERVAL = 0 // in milliseconds
export const AUTOREFRESH_DEFAULT_STATUS = AutoRefreshStatus.Paused
export const AUTOREFRESH_DEFAULT = {
  status: AUTOREFRESH_DEFAULT_STATUS,
  interval: AUTOREFRESH_DEFAULT_INTERVAL,
}

export const LAYOUT_MARGIN = 4
export const DASHBOARD_LAYOUT_ROW_HEIGHT = 83.5

export const NOTIFICATION_TRANSITION = 250
export const FIVE_SECONDS = 5000
export const TEN_SECONDS = 10000
export const FIFTEEN_SECONDS = 15000
export const INDEFINITE = Infinity

export const HOMEPAGE_PATHNAME = 'me'

// Resizer && Threesizer
export const HANDLE_VERTICAL = 'vertical'
export const HANDLE_HORIZONTAL = 'horizontal'
export const HANDLE_NONE = 'none'
export const HANDLE_PIXELS = 20
export const MIN_HANDLE_PIXELS = 20
export const MAX_SIZE = 1
export const MIN_SIZE = 0

export const VERSION = formatConstant(process.env.npm_package_version)
export const GIT_SHA = formatConstant(process.env.GIT_SHA)
export const BASE_PATH = formatConstant(process.env.STATIC_PREFIX)
export const API_BASE_PATH = formatConstant(process.env.API_PREFIX)
export const HONEYBADGER_KEY = formatConstant(process.env.HONEYBADGER_KEY)
export const HONEYBADGER_ENV = formatConstant(process.env.HONEYBADGER_ENV)

export const CLOUD = !!process.env.CLOUD_URL
export const CLOUD_SIGNIN_PATHNAME = '/api/v2/signin'
export const CLOUD_BILLING_VISIBLE = CLOUD
export const CLOUD_URL = formatConstant(process.env.CLOUD_URL)
export const CLOUD_CHECKOUT_PATH = '/checkout'
export const CLOUD_BILLING_PATH = '/billing'
export const CLOUD_USAGE_PATH = '/usage'
export const CLOUD_LOGOUT_PATH = '/logout'
export const CLOUD_USERS_PATH = '/users'

export const FLUX_RESPONSE_BYTES_LIMIT = CLOUD
  ? 27 * 1024 * 1024 // 27 MiB  (desa: this was determined by looking at queries responses in the cloud app)
  : 100 * 1024 * 1024 // 100 MiB

export const VIS_SIG_DIGITS = 4

export const VIS_THEME: Partial<Config> = {
  axisColor: InfluxColors.Kevlar,
  gridColor: InfluxColors.Kevlar,
  gridOpacity: 1,
  tickFont: '500 11px Rubik',
  tickFontColor: InfluxColors.Mist,
  legendFont: '12px Rubik',
  legendFontColor: InfluxColors.Wolf,
  legendFontBrightColor: InfluxColors.Chromium,
  legendBackgroundColor: InfluxColors.Raven,
  legendBorder: `1px solid ${InfluxColors.Kevlar}`,
  legendCrosshairColor: InfluxColors.Smoke,
}

export const VIS_THEME_LIGHT: Partial<Config> = {
  axisColor: InfluxColors.Whisper,
  gridColor: InfluxColors.Whisper,
  gridOpacity: 1,
  tickFont: '500 11px Rubik',
  tickFontColor: InfluxColors.Mountain,
  legendFont: '12px Rubik',
  legendFontColor: InfluxColors.Graphite,
  legendFontBrightColor: InfluxColors.Forge,
  legendBackgroundColor: InfluxColors.Ghost,
  legendBorder: `1px solid ${InfluxColors.Whisper}`,
  legendCrosshairColor: InfluxColors.Smoke,
}

export const GIRAFFE_COLOR_SCHEMES = [
  {name: 'Nineteen Eighty Four', colors: NINETEEN_EIGHTY_FOUR},
  {name: 'Atlantis', colors: ATLANTIS},
  {name: 'Do Androids Dream of Electric Sheep?', colors: DO_ANDROIDS_DREAM},
  {name: 'Delorean', colors: DELOREAN},
  {name: 'Cthulhu', colors: CTHULHU},
  {name: 'Ectoplasm', colors: ECTOPLASM},
  {name: 'T-MAX 400 Film', colors: T_MAX_400_FILM},
]

export const BAND_LINE_OPACITY = 0.7
export const BAND_LINE_WIDTH = 3
export const BAND_SHADE_OPACITY = 0.3

export const LEGEND_OPACITY_MINIMUM = 0.2
export const LEGEND_OPACITY_MAXIMUM = 1.0
export const LEGEND_OPACITY_DEFAULT = LEGEND_OPACITY_MAXIMUM
export const LEGEND_OPACITY_STEP = 0.01
export const LEGEND_ORIENTATION_THRESHOLD_DEFAULT = 10

export const QUERY_BUILDER_MODE = 'builder'
export const SCRIPT_EDITOR_MODE = 'advanced'
