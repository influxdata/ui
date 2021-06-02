import {convertKeysToCamelCase, convertKeysToSnakecase} from './checkout'

type stringDict = {[key: string]: string}
const testCases: {snakeCase: stringDict; camelCase: stringDict}[] = [
  {camelCase: {keyOne: 'some string'}, snakeCase: {key_one: 'some string'}},
  {camelCase: {testing: 'some string'}, snakeCase: {testing: 'some string'}},
  {
    camelCase: {numbers01Test: 'some string', numBer1Test2Blah: 'other string'},
    snakeCase: {
      numbers_01_test: 'some string',
      num_ber_1_test_2_blah: 'other string',
    },
  },
]

describe('checkout', () => {
  testCases.forEach(({camelCase, snakeCase}, i) =>
    it(`converts object both ways ${i}`, () => {
      expect(convertKeysToSnakecase(camelCase)).toMatchObject(snakeCase)
      expect(convertKeysToCamelCase(snakeCase)).toMatchObject(camelCase)
    })
  )

  it(`converts abbreviations`, () => {
    expect(
      convertKeysToSnakecase({UPPERCASEABBREVIATIONS: 'some string'})
    ).toMatchObject({uppercaseabbreviations: 'some string'})
    expect(
      convertKeysToCamelCase({UPPERCASEABBREVIATIONS: 'some string'})
    ).toMatchObject({uppercaseabbreviations: 'some string'})
  })
})
