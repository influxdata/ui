import {
  postUiproxySfdcSupport,
  PostUiproxySfdcSupportParams,
} from 'src/client/uiproxydRoutes'

export const createSfdcSupportCase = async (
  description: string,
  email: string,
  severity: string,
  subject: string
) => {
  const params: PostUiproxySfdcSupportParams = {
    data: {description, email, severity, subject},
  }

  const response = await postUiproxySfdcSupport(params)

  if (response.status !== 204) {
    throw new Error(response.data.message)
  }

  return response
}
