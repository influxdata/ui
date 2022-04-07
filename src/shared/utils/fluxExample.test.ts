import {getFluxExample} from 'src/shared/utils/fluxExample'

describe('Flux example functions and values', () => {
  it('can create an example Flux value', () => {
    const exampleFunc = {
      path: 'test',
      package: 'test',
      name: 'myConstant',
      kind: 'Value',
      headline: 'A static value in a dummy test package',
      fluxType: 'string',
      description: null,
      fluxParameters: [],
    }

    expect(getFluxExample(exampleFunc).example).toEqual(
      `${exampleFunc.package}.${exampleFunc.name}`
    )
  })

  it('can create an example Flux function call with no parameters', () => {
    const exampleFunc = {
      path: 'test',
      package: 'test',
      name: 'myFunc',
      kind: 'Function',
      headline: 'A function that takes no args',
      fluxType: '() => string',
      description: null,
      fluxParameters: [],
    }

    expect(getFluxExample(exampleFunc).example).toEqual(
      `${exampleFunc.package}.${exampleFunc.name}()`
    )
  })

  it('can create an example Flux function call with only optional parameters', () => {
    const exampleFunc = {
      path: 'test',
      package: 'test',
      name: 'myFuncOptionalTwoArgs',
      kind: 'Function',
      headline: 'A function that takes two optional parameters',
      fluxType:
        '(?column:A, ?fill:B) => {reduce:(state:int, values:[E]) => int, init:(values:[D]) => int, fill:B, compute:(state:C) => C, column:A}',
      description: null,
      fluxParameters: [
        {
          name: 'column',
          headline: 'column: Name of the column to aggregate.',
          description: null,
          required: false,
        },
        {
          name: 'fill',
          headline: 'fill: When set, value to replace missing values.',
          description: null,
          required: false,
        },
      ],
    }

    expect(getFluxExample(exampleFunc).example).toEqual(
      `${exampleFunc.package}.${exampleFunc.name}(  )`
    )
  })

  it('can create an example Flux function call with only required parameters', () => {
    const exampleFunc = {
      path: 'test',
      package: 'test',
      name: 'myFuncRequiredThreeArgs',
      kind: 'Function',
      headline: 'A function that takes three required parameters',
      fluxType: '(myMeasurement:A, myField:B, myClass: string) => string',
      description: null,
      fluxParameters: [
        {
          name: 'myMeasurement',
          headline: 'myMeasurement: Measurement to use as training data.',
          description: null,
          required: true,
        },
        {
          name: 'myField',
          headline: 'myField: Field to use as training data.',
          description: null,
          required: true,
        },
        {
          name: 'myClass',
          headline: 'myClass: Class to classify against.',
          description: null,
          required: true,
        },
      ],
    }

    expect(getFluxExample(exampleFunc).example).toEqual(
      `${exampleFunc.package}.${exampleFunc.name}(myMeasurement: , myField: , myClass: )`
    )
  })
})
