import {InfluxDB, WritePrecisionType} from '@influxdata/influxdb-client'

export interface InfluxParams {
  url: string
  token: string
  org: string
  bucket?: string
}

interface Dico {
  [k: string]: string
}
/*
 * recs strings should be in valid line protocol
 * */

export async function writeLP(
  connect: InfluxParams,
  prec: string,
  recs: string[]
) {
  if (typeof connect.bucket === 'undefined') {
    throw 'connect.bucket is undefined.  Cannot write to DB without bucket'
  }
  const writeApi = new InfluxDB({
    url: connect.url,
    token: connect.token,
  }).getWriteApi(connect.org, connect.bucket, prec as WritePrecisionType)

  writeApi.writeRecords(recs)

  await writeApi
    .close()
    .then(() => {
      cy.log(`Wrote ${recs.length} recs`)
    })
    .catch(e => {
      console.error(e)
      console.error('\nFinished ERROR')
      throw e
    })
}

export async function query(
  connect: InfluxParams,
  fluxQuery: string,
  cols: string[]
) {
  const queryApi = new InfluxDB({
    url: connect.url,
    token: connect.token,
  }).getQueryApi(connect.org)

  //    console.log('*** QUERY LINES ***')

  // TODO make result object array
  const result: Dico[] = []

  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row)
        const line: Dico = {}
        cols.forEach(col => {
          line[col] = o[col]
        })
        result.push(line)
      },
      error(e) {
        console.error(e)
        reject(e)
      },
      complete() {
        resolve(result)
      },
    })
  })
}
