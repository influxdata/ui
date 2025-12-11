import {CLOUD} from 'src/shared/constants'

let postUiproxySfdcSupport
let PostUiproxySfdcSupportParams
if (CLOUD) {
  postUiproxySfdcSupport =
    require('src/client/uiproxydRoutes').postUiproxySfdcSupport
  PostUiproxySfdcSupportParams =
    require('src/client/uiproxydRoutes').PostUiproxySfdcSupportParams
}

export const createSfdcSupportCase = async (
  description: string,
  email: string,
  severity: string,
  subject: string,
  caseOrigin: string,
  deploymentType: string
) => {
  const params: typeof PostUiproxySfdcSupportParams = {
    data: {
      description,
      email,
      severity,
      subject,
      caseOrigin,
      deploymentType,
    },
  }

  const response = await postUiproxySfdcSupport(params)

  if (response.status !== 204) {
    throw new Error(response.data.message)
  }

  return response
}
