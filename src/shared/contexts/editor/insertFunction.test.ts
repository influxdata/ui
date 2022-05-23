import {generateImport} from 'src/shared/contexts/editor/insertFunction'
import {FluxFunction} from 'src/types/shared'

describe('insertFunction Namespace', () => {
  const script = `import "wordz/date"\nfrom(bucket: "b0")
    |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
    |> filter(fn: (r) => r._measurement == "m0")`

  test('generateImport should generate an import statement', () => {
    const emptyImport = generateImport({} as FluxFunction, script)
    expect(emptyImport).toEqual(null)
    const func = {
      name: 'window.aggregate',
      package: 'contrib/jsternberg/aggregate',
    } as FluxFunction
    const actual = generateImport(func, script)
    expect(actual).toEqual(`import "${func.package}"`)
  })

  test('generateImport should not generate an import for universe', () => {
    const func = {name: 'aggregateWindow', package: 'universe'} as FluxFunction
    const actual = generateImport(func, script)
    expect(actual).toEqual(null)
  })

  test('generateImport should not duplicate headers', () => {
    const func = {name: 'use.wordz', package: 'wordz/date'} as FluxFunction
    const actual = generateImport(func, script)
    expect(actual).toEqual(null)
  })
})
