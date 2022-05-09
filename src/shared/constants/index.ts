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

import {AutoRefreshStatus, CreditCardParams} from 'src/types'

/**
 * UPDATE: the original integration of this had linked to a Quartz issue that has
 * since been resolved. However, removing this function caused our unit tests
 * to fail in CI since the GIT_SHA was undefined. We need to resolve that issue
 * before we can remove this function from the app
 */
function formatConstant(constant: string) {
  if (!constant) {
    return ''
  }
  return constant.trim()
}

// If we don't initialize these params here, then the UI will start
// showing a popup and cypress tests will start failing.
export const EMPTY_ZUORA_PARAMS: CreditCardParams = {
  id: '',
  tenantId: '',
  key: '',
  signature: '',
  token: '',
  style: '',
  submitEnabled: 'false',
  url: '',
}

export const BALANCE_THRESHOLD_DEFAULT = 10
export const MINIMUM_BALANCE_THRESHOLD = 1

export const DROPDOWN_MENU_MAX_HEIGHT = 240

export const PRESENTATION_MODE_ANIMATION_DELAY = 0 // In milliseconds.

export const HTTP_UNAUTHORIZED = 401
export const HTTP_FORBIDDEN = 403
export const HTTP_NOT_FOUND = 404

export const AUTOREFRESH_DEFAULT_INTERVAL = 0 // in milliseconds
export const AUTOREFRESH_DEFAULT_STATUS = AutoRefreshStatus.Paused
export const AUTOREFRESH_DEFAULT = {
  status: AUTOREFRESH_DEFAULT_STATUS,
  interval: AUTOREFRESH_DEFAULT_INTERVAL,
  duration: null,
  inactivityTimeout: 0,
  infiniteDuration: false,
  label: '',
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
export const AMPLITUDE_KEY = formatConstant(process.env.AMPLITUDE_KEY)

export const RUDDERSTACK_DATA_PLANE_URL = formatConstant(
  process.env.RUDDERSTACK_DATA_PLANE_URL
)
export const RUDDERSTACK_WRITE_KEY = formatConstant(
  process.env.RUDDERSTACK_WRITE_KEY
)

export const CLOUD = !!process.env.CLOUD_URL
export const CLOUD_SIGNIN_PATHNAME = '/api/v2/signin'
export const CLOUD_SIGNOUT_PATHNAME = '/api/v2/signout'
export const CLOUD_LOGIN_PATHNAME = '/login'
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
  axisColor: InfluxColors.Grey35,
  gridColor: InfluxColors.Grey35,
  gridOpacity: 1,
  tickFont: '500 11px Rubik',
  tickFontColor: InfluxColors.Grey75,
  legendFont: '12px Rubik',
  legendFontColor: InfluxColors.Grey55,
  legendFontBrightColor: InfluxColors.Grey75,
  legendBackgroundColor: InfluxColors.Grey5,
  legendBorder: `1px solid ${InfluxColors.Grey15}`,
  legendCrosshairColor: InfluxColors.Grey35,
}

export const VIS_THEME_LIGHT: Partial<Config> = {
  axisColor: InfluxColors.Grey95,
  gridColor: InfluxColors.Grey95,
  gridOpacity: 1,
  tickFont: '500 11px Rubik',
  tickFontColor: InfluxColors.Grey45,
  legendFont: '12px Rubik',
  legendFontColor: InfluxColors.Grey35,
  legendFontBrightColor: InfluxColors.Grey65,
  legendBackgroundColor: InfluxColors.Grey95,
  legendBorder: `1px solid ${InfluxColors.Grey95}`,
  legendCrosshairColor: InfluxColors.Grey25,
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

export const QUERY_BUILDER_MODE = 'builder'
export const SCRIPT_EDITOR_MODE = 'advanced'

export const MARKDOWN_UNSUPPORTED_IMAGE =
  "We don't support images in markdown for security purposes"

export const GLOBALSEARCH_APP_ID = formatConstant(
  process.env.GLOBALSEARCH_APP_ID
)
export const GLOBALSEARCH_API_KEY = formatConstant(
  process.env.GLOBALSEARCH_API_KEY
)

export const PAYG_CREDIT_DAYS = 30
export const PAYG_MAX_CREDIT = 250
export const PAYG_CREDIT_EXPERIMENT_ID = process.env.PAYG_CREDIT_EXPERIMENT_ID
export const CREDIT_250_EXPERIMENT_ID = process.env.CREDIT_250_EXPERIMENT_ID
