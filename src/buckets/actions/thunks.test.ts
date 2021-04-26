
import { fetchAllBuckets, getBuckets } from "./thunks";

const createMockGetBuckets = (shouldSucess: boolean): (typeof api.getBuckets) => () => {
  if (shouldSucess) {
    const res: ReturnType<(typeof api.getBuckets)> = Promise.resolve(
      { data: { buckets: [{ name: "buck1", retentionRules: [], id: "custom-id" }] }, headers: {} as any, status: 200 }
    );
    return res;
  } else {
    const res: ReturnType<(typeof api.getBuckets)> = Promise.resolve(
      { data: { message: "simulated error", code: "not found" }, headers: {} as any, status: 500 }
    );
    return res;
  }
};


jest.mock("src/client", () => ({
  getBuckets: jest.fn(),
}))
import * as api from 'src/client';

import { fetchDemoDataBuckets } from 'src/cloud/apis/demodata';
import { getMockAppState } from "src/mockAppState";
import { RemoteDataState } from "@influxdata/clockface";
jest.mock("src/cloud/apis/demodata", () => ({
  fetchDemoDataBuckets: jest.fn(() => {
    const res: ReturnType<(typeof fetchDemoDataBuckets)> = Promise.resolve(
      [{ id: "demo-bucket", retentionRules: [], name: "demo-buck", readableRetention: "retee", type: "demodata" }]
    );
    return res;
  }),
}))


describe("buckets thunks", () => {
  describe("fetchAllBuckets", () => {
    it("success", async () => {
      (api.getBuckets as any).mockImplementationOnce(createMockGetBuckets(true))

      const bucks = await fetchAllBuckets("ord01")
      expect(bucks.result).toContain("custom-id")
      expect(bucks.result).toContain("demo-bucket")
    })

    it("fails", async () => {
      (api.getBuckets as any).mockImplementationOnce(createMockGetBuckets(false))

      await expect(fetchAllBuckets("ord01"))
        .rejects
        .toThrowError("simulated error")
    })
  })

  describe("getBuckets", () => {
    it("starts", async () => {
      (api.getBuckets as any).mockImplementationOnce(createMockGetBuckets(true));
      const dispatched = [];
      const dispatch = jest.fn(Array.prototype.push.bind(dispatched));
      const getState = jest.fn(getMockAppState) as any;

      await getBuckets()(dispatch, getState)
      expect(dispatched.length).toBe(2)
      expect(dispatched[0].status).toBe(RemoteDataState.Loading)
      expect(dispatched[1].status).toBe(RemoteDataState.Done)
      expect(dispatched[1].schema.result).toContain("custom-id")
      expect(dispatched[1].schema.result).toContain("demo-bucket")
    })
  })

})
