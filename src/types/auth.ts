export {Authorization, Permission} from 'src/client'

export enum Auth0Connection {
  Google = 'google-oauth2',
  Microsoft = 'windowslive',
  Authentication = 'Username-Password-Authentication',
}

export type Auth0Config = {
  clientID: string
  domain: string
  redirectURL: string
  state: string
}
