// Mocks
import {
  createVariable,
  associatedVariable,
  defaultVariables,
  hydrateVarsAdditionalMappings,
} from 'src/variables/mocks'
import {getMockedParse} from 'src/shared/utils/mocks/mockedParse'

jest.mock('src/languageSupport/languages/flux/lspUtils', () => {
  return {
    parse: jest.fn(getMockedParse(hydrateVarsAdditionalMappings)),
  }
})

// Utils
import {ValueFetcher} from 'src/variables/utils/ValueFetcher'
import {hydrateVars} from 'src/variables/utils/hydrateVars'

// Types
import {Variable, CancellationError, RemoteDataState} from 'src/types'

class FakeFetcher implements ValueFetcher {
  responses = {}

  fetch(_, __, query, ___, ____, _____, ______) {
    if (this.responses.hasOwnProperty(query)) {
      return {
        cancel: () => {},
        promise: this.responses[query],
      }
    }

    return {
      cancel: () => {},
      promise: Promise.resolve({
        values: [],
        valueType: 'string',
        selected: [],
      }),
    }
  }

  setResponse(variable, response) {
    this.responses[variable.arguments.values.query] = response
  }
}

describe('hydrate vars', () => {
  test('should invalidate cyclic subgraphs', async () => {
    // Construct the following graph:
    //
    //     digraph {
    //       a -> b
    //       b -> c
    //       c -> d
    //       d -> e
    //       d -> b
    //       f -> g
    //     }
    //
    const a = createVariable('a', 'f(x: v.b)')
    const b = createVariable('b', 'f(x: v.c)')
    const c = createVariable('c', 'f(x: v.d)')
    const d = createVariable('d', 'f(x: v.b, y: v.e)')
    const e = createVariable('e', 'f() // called by f')
    const f = createVariable('f', 'f(x: v.g)')
    const g = createVariable('g', 'f() // called by g')
    const vars = [a, b, c, d, e, f, g]

    const fetcher = new FakeFetcher()

    fetcher.setResponse(
      e,
      Promise.resolve({
        values: ['eVal'],
        valueType: 'string',
        selected: ['eVal'],
      })
    )

    fetcher.setResponse(
      g,
      Promise.resolve({
        values: ['gVal'],
        valueType: 'string',
        selected: ['gVal'],
      })
    )

    fetcher.setResponse(
      f,
      Promise.resolve({
        values: ['fVal'],
        valueType: 'string',
        selected: ['fVal'],
      })
    )

    const actual = await hydrateVars(vars, vars, {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    }).promise

    // We expect the end state of the graph to be:
    //
    //     digraph {
    //       a -> b
    //       b -> c
    //       c -> d
    //       d -> e
    //       d -> b
    //       f -> g
    //       a [fontcolor = "red"]
    //       b [fontcolor = "red"]
    //       c [fontcolor = "red"]
    //       d [fontcolor = "red"]
    //       e [fontcolor = "green"]
    //       f [fontcolor = "green"]
    //       g [fontcolor = "green"]
    //     }
    expect(
      actual.filter(v => v.id === 'a')[0].arguments.values.results
    ).toBeFalsy()
    expect(
      actual.filter(v => v.id === 'b')[0].arguments.values.results
    ).toBeFalsy()
    expect(
      actual.filter(v => v.id === 'c')[0].arguments.values.results
    ).toBeFalsy()
    expect(
      actual.filter(v => v.id === 'd')[0].arguments.values.results
    ).toBeFalsy()

    expect(
      actual.filter(v => v.id === 'e')[0].arguments.values.results
    ).toEqual(['eVal'])
    expect(actual.filter(v => v.id === 'e')[0].selected).toEqual(['eVal'])

    expect(
      actual.filter(v => v.id === 'g')[0].arguments.values.results
    ).toEqual(['gVal'])
    expect(actual.filter(v => v.id === 'g')[0].selected).toEqual(['gVal'])

    expect(
      actual.filter(v => v.id === 'f')[0].arguments.values.results
    ).toEqual(['fVal'])
    expect(actual.filter(v => v.id === 'f')[0].selected).toEqual(['fVal'])
  })

  test('should invalidate all ancestors of a node when it fails', async () => {
    // Construct the following graph:
    //
    //     digraph {
    //       a -> b
    //       b -> c
    //     }
    //
    // and then make hydrating `b` fail.
    const a = createVariable('a', 'f(x: v.b)')
    const b = createVariable('b', 'f(x: v.c)')
    const c = createVariable('c', 'f()')
    const vars = [a, b, c]

    const fetcher = new FakeFetcher()

    fetcher.setResponse(
      c,
      Promise.resolve({
        values: ['cVal'],
        valueType: 'string',
        selected: ['cVal'],
      })
    )

    fetcher.setResponse(b, Promise.reject('oopsy whoopsies'))

    const response = hydrateVars(vars, vars, {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    })

    const mockFire = jest.spyOn(response.on, 'fire')

    const actual = await response.promise

    // We expect the following end state:
    //
    //     digraph {
    //       a -> b
    //       b -> c
    //       a [fontcolor = "red"]
    //       b [fontcolor = "red"]
    //       c [fontcolor = "green"]
    //     }
    expect(
      actual.filter(v => v.id === 'a')[0].arguments.values.results
    ).toEqual([])
    expect(
      actual.filter(v => v.id === 'b')[0].arguments.values.results
    ).toEqual([])

    expect(
      actual.filter(v => v.id === 'c')[0].arguments.values.results
    ).toEqual(['cVal'])
    expect(actual.filter(v => v.id === 'c')[0].selected).toEqual(['cVal'])

    const errorCall = mockFire.mock.calls[4]
    const [eventName, variable, errorMessage] = errorCall
    expect(eventName).toBe('error')
    expect(variable).toEqual(b)
    expect(errorMessage).toBe('oopsy whoopsies')
  })

  test('works with map template variables', async () => {
    const a = createVariable('a', 'f(x: v.b)')

    const b: Variable = {
      id: 'b',
      name: 'b',
      orgID: '',
      labels: [],
      arguments: {
        type: 'map',
        values: {
          k: 'v',
        },
      },
      status: RemoteDataState.NotStarted,
    }

    const vars = [a, b]

    const fetcher = new FakeFetcher()

    fetcher.setResponse(
      a,
      Promise.resolve({
        values: ['aVal'],
        valueType: 'string',
        selected: ['aVal'],
      })
    )

    const actual = await hydrateVars(vars, vars, {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    }).promise

    // Basic test for now, we would need an icky mock to assert that the
    // appropriate substitution is actually taking place
    expect(
      actual.filter(v => v.id === 'a')[0].arguments.values.results
    ).toEqual(['aVal'])
    expect(actual.filter(v => v.id === 'a')[0].selected).toEqual(['aVal'])
    expect(actual.filter(v => v.id === 'b')[0].arguments.values).toEqual({
      k: 'v',
    })
  })

  // This ensures that the update of a dependant variable updates the
  // parent variable
  test('works with constant template variables', async () => {
    const a = createVariable('a', 'f(x: v.b)')

    const b: Variable = {
      id: 'b',
      name: 'b',
      orgID: '',
      labels: [],
      arguments: {
        type: 'constant',
        values: ['v1', 'v2'],
      },
      status: RemoteDataState.NotStarted,
    }

    const vars = [a, b]

    const fetcher = new FakeFetcher()

    fetcher.setResponse(
      a,
      Promise.resolve({
        values: ['aVal'],
        valueType: 'string',
        selected: ['aVal'],
      })
    )

    const actual = await hydrateVars(vars, vars, {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    }).promise

    expect(
      actual.filter(v => v.id === 'a')[0].arguments.values.results
    ).toEqual(['aVal'])
    expect(actual.filter(v => v.id === 'a')[0].selected).toEqual(['aVal'])

    expect(actual.filter(v => v.id === 'b')[0].arguments.values).toEqual([
      'v1',
      'v2',
    ])
  })

  test('should be cancellable', done => {
    expect.assertions(1)

    const a = createVariable('a', 'f()')
    const fetcher = new FakeFetcher()

    fetcher.setResponse(a, new Promise(() => {}))

    const {cancel, promise} = hydrateVars([a], [a], {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    })

    promise.catch(e => {
      expect(e).toBeInstanceOf(CancellationError)
      done()
    })

    cancel()
  })

  test('should return the child node with associated parents', async () => {
    /*
     This example deals with the following situation where a parent with a child has been passed in.
     Practically speaking, this looks like:

              associatedVariable
                    |
                    |
                defaultVariable

      By passing in the defaultVariable, we expect the child to be returned with a reference to the parent:

      [
        {
          variable: defaultVariable,
          parent: [associatedVariable]
        },
      ]
      The reason for this is because we want the youngest child node (end of the LL tail) to load first, followed by its parents.
    */

    const fetcher = new FakeFetcher()

    const actual = await hydrateVars([associatedVariable], defaultVariables, {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    }).promise
    expect(actual.length).toEqual(2)
  })

  it('fires an error event when an error is caught', async () => {
    const error = 'four_oh_four not found'
    const fetcher = new FakeFetcher()
    const queryVariable = createVariable(
      'errorVariable',
      'f(x: v.four_oh_four)',
      null,
      RemoteDataState.Error
    )

    fetcher.setResponse(queryVariable, Promise.reject(error))

    const actual = hydrateVars([queryVariable], [queryVariable], {
      url: '',
      orgID: '',
      selections: {},
      fetcher,
    })
    const mockFire = jest.spyOn(actual.on, 'fire')

    await actual.promise

    const [_, errorCall] = mockFire.mock.calls
    const [eventName, variable, errorMessage] = errorCall
    expect(eventName).toBe('error')
    expect(variable).toEqual(queryVariable)
    expect(errorMessage).toBe(error)
  })
})
