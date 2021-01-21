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

export const makeInitial = (states: string[]): Contact => ({
  street1: '',
  street2: '',
  city: '',
  country: 'United States',
  intlSubdivision: '',
  usSubdivision: states[0],
  postalCode: '',
})
