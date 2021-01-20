import * as yup from 'yup'

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

const requiredMessage = 'This is a required field'

export const validationSchema: yup.ObjectSchema<Contact> = yup.object({
  street1: yup.string(),
  street2: yup.string(),
  city: yup.string().required(requiredMessage),
  country: yup.string().required(requiredMessage),
  intlSubdivision: yup.string().notRequired(),
  usSubdivision: yup.string().when('country', {
    is: isUS,
    then: yup.string().required(requiredMessage),
    otherwise: yup.string().notRequired(),
  }),
  postalCode: yup.string().when('country', {
    is: isUS,
    then: yup.string().required(requiredMessage),
    otherwise: yup.string().notRequired(),
  }),
})

export const makeInitial = (states: string[]): Contact => ({
  street1: '',
  street2: '',
  city: '',
  country: 'United States',
  intlSubdivision: '',
  usSubdivision: states[0],
  postalCode: '',
})
