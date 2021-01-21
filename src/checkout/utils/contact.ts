interface AlternateSubdivisions {
  intlSubdivision?: string
  usSubdivision?: string
}

interface FinalSubdivision {
  subdivision: string
}

interface ContactBase {
  street1: string
  street2: string
  city: string
  country: string
  postalCode: string
}

export type Contact = ContactBase & AlternateSubdivisions
export type BackendContact = ContactBase & FinalSubdivision

export const isUS = (country: string): boolean => country === 'United States'
