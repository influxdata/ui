import { processStatusesResponse } from 'src/alerting/utils/statusEvents'
import { fromFlux, Table } from '@influxdata/giraffe'
import { range } from "lodash"
import { mocked } from "ts-jest/utils"

jest.mock('@influxdata/giraffe', () => ({
  fromFlux: jest.fn(),
}))
// todo: test will fails on binaryPrefixFormatter not a function in src/shared/copy/notifications.ts:22:24 this mock can be removed after this will be fixed
jest.mock('src/cloud/utils/reporting', () => ({
  event: jest.fn(),
}))

const mockGetBuckets = (fnc: typeof fromFlux) => {
  ; (fromFlux as any).mockImplementationOnce(fnc)
}

const alwaysZero = new Proxy([], { get: (_, key: any) => Number.isInteger(+key) ? 0 : [][key] })

describe('process statuses response', () => {
  beforeEach(jest.clearAllMocks)

  it('process empty table', async () => {
    mockGetBuckets(() => ({ table: { length: 0 } } as any));

    const { promise } = processStatusesResponse({
      promise: Promise.resolve({
        type: "SUCCESS",
        csv: "some csv",
        bytesRead: 0,
        didTruncate: false,
      }), cancel: jest.fn(() => { })
    })
    const actual = await promise;

    expect(actual.length).toBe(1);
    expect(actual[0].length).toBe(0);
  })

  it('process single table', async () => {
    const csv = "some csv";
    const length = 100;
    const cols = 20;
    const table: Table = {
      columnKeys: ['table', ...range(cols).map(x => x.toString(10))],
      getColumn: (col: string) =>
        col === 'table'
          ? alwaysZero
          : range(length).map(x => x * +col) as any,
      length,
      getColumnName: jest.fn(),
      getColumnType: jest.fn(),
      getOriginalColumnType: jest.fn(),
      addColumn: jest.fn(),
    };
    mockGetBuckets(() => ({ table }) as any);
    const expected = range(length).map(i =>
      Object.fromEntries([['table', 0], ...range(cols).map(col => [col, i * col])])
    )

    const { promise } = processStatusesResponse({
      promise: Promise.resolve({
        type: "SUCCESS",
        csv,
        bytesRead: 0,
        didTruncate: false,
      }), cancel: jest.fn(() => { })
    })
    const actual = await promise;

    expect(mocked(fromFlux).mock.calls[0][0]).toBe(csv);
    expect(actual.length).toBe(1);
    expect(actual[0]).toMatchObject(expected);
  })
})
