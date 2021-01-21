import axios from 'axios'
import {RemoteDataState} from '@influxdata/clockface'
import {Checkout, toBackend} from 'src/checkout/utils/checkout'

export const privateAPI = (path: string) => `/api/v2private/${path}`

export class CheckoutClient {
  private basePath: string

  constructor() {
    this.basePath = privateAPI('checkout')
  }

  completePurchase = async (formValues: Checkout): Promise<RemoteDataState> => {
    const success = await axios
      .post(`${this.basePath}/complete_purchase`, toBackend(formValues))
      .then(response => response.status === 201)
      .catch(() => false)

    return success ? RemoteDataState.Done : RemoteDataState.Error
  }
}
