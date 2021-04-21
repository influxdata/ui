import {
  validateVariableName,
  FULL_ERROR_TEXT,
  EMPTY_ERROR_TEXT,
  UNIQUE_ERROR_TEXT,
  makeReservedErrorText,
} from 'src/variables/utils/validation'

// reserved variable names
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'

// Mocks
import {createVariable} from 'src/variables/mocks'

describe('Validation', () => {
  const variable3 = createVariable('apple', 'f(x: v.b)')
  const variableB = createVariable('banana', 'f(x: v.c)')
  const variableF = createVariable('fig', 'f(x: v.g)')

  const varList = [variable3, variableB, variableF]

  const getError = name => {
    return validateVariableName(varList, name).error
  }

  describe('variable name validation', () => {
    it('rejects names with a special character in it', () => {
      const special1 = 'foo&'
      expect(getError(special1)).toEqual(FULL_ERROR_TEXT)
    })
    it('rejects names with a space in it', () => {
      const special1 = 'foo hello there'
      expect(getError(special1)).toEqual(FULL_ERROR_TEXT)
    })
    it('allows letters (or an underscore), then letters, underscore and numbers', () => {
      expect(getError('foo_78')).toBe(null)
      expect(getError('Foo_788')).toBe(null)
      expect(getError('Foo')).toBe(null)
      expect(getError('foo')).toBe(null)
      expect(getError('f78987_ack_7')).toBe(null)
      expect(getError('_hello89_')).toBe(null)
    })
    it('disallows starting with a number', () => {
      expect(getError('7bananas')).toEqual(FULL_ERROR_TEXT)
    })
    it('disallows duplicate names', () => {
      expect(getError('banana')).toEqual(UNIQUE_ERROR_TEXT)
      expect(getError('apple')).toEqual(UNIQUE_ERROR_TEXT)
      expect(getError('fig')).toEqual(UNIQUE_ERROR_TEXT)
    })
    it('rejects empty names', () => {
      expect(getError(null)).toEqual(EMPTY_ERROR_TEXT)
      expect(getError('')).toEqual(EMPTY_ERROR_TEXT)
      expect(getError(' ')).toEqual(EMPTY_ERROR_TEXT)
      expect(getError(undefined)).toEqual(EMPTY_ERROR_TEXT)
    })
    it('disallows reserved names', () => {
      const checkReservedWord = word => {
        const expectedMsg = makeReservedErrorText(word)
        expect(getError(word)).toEqual(expectedMsg)
      }

      checkReservedWord(TIME_RANGE_START)
      checkReservedWord(TIME_RANGE_STOP)
      checkReservedWord(WINDOW_PERIOD)
    })
    it('allows an existing var to keep its name (used when editing other parts of the variable)', () => {
      const error = validateVariableName(varList, 'banana', 'banana').error
      expect(error).toBe(null)

      //now changing the name
      const error2 = validateVariableName(varList, 'banana2', 'banana').error
      expect(error2).toBe(null)
    })
  })
})
