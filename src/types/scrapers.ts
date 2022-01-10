export interface Scraper extends ScraperTargetRequest {
  id?: string
  org?: string
  bucket?: string
  links?: any
}

export interface ScraperTargetRequest {
  name?: string
  type?: 'prometheus'
  url?: string
  orgID?: string
  bucketID?: string
}
