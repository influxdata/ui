import {validateVariableName} from 'src/variables/utils/validation'

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
    const fullErrorText =
      'Variable name must start with a letter or underscore, and ' +
      'contain only numbers, letters, and underscores.'

    it('rejects names with a special character in it', () => {
      const special1 = 'foo&'
      expect(getError(special1)).toEqual(fullErrorText)
    })
    it('rejects names with a space in it', () => {
      const special1 = 'foo hello there'
      expect(getError(special1)).toEqual(fullErrorText)
    })
    it('allows letters, then letters, underscore and numbers', () => {
      expect(getError('foo_78')).toBe(null)
      expect(getError('Foo_788')).toBe(null)
      expect(getError('Foo')).toBe(null)
      expect(getError('foo')).toBe(null)
      expect(getError('f78987_ack_7')).toBe(null)
    })
    it('disallows starting with a number', () => {
      expect(getError('7bananas')).toEqual(fullErrorText)
    })
    it('disallows duplicate names', () => {
      expect(getError('banana')).toEqual('Variable name must be unique')
      expect(getError('apple')).toEqual('Variable name must be unique')
      expect(getError('fig')).toEqual('Variable name must be unique')
    })
    it('rejects empty names', () => {
      const emptyErrorText = 'Variable name cannot be empty'

      expect(getError(null)).toEqual(emptyErrorText)
      expect(getError('')).toEqual(emptyErrorText)
      expect(getError(' ')).toEqual(emptyErrorText)
      expect(getError(undefined)).toEqual(emptyErrorText)
    })
    it('disallows reserved names', () => {
      const checkReservedWord = word => {
        const expectedMsg = `Variable name is reserved: ${word}`
        expect(getError(word)).toEqual(expectedMsg)
      }

      checkReservedWord(TIME_RANGE_START)
      checkReservedWord(TIME_RANGE_STOP)
      checkReservedWord(WINDOW_PERIOD)
    })
  })
})
