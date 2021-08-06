import {InfluxDB,
//    FluxTableMetaData,
//    Point,
//    HttpError,
    WritePrecisionType} from '@influxdata/influxdb-client';

export interface InfluxParams {
    url: string,
    token: string,
    org: string,
    bucket?: string
}

interface Dico {
    [k: string]: string
}
/*
* recs strings should be in valid line protocol
* */

export async function writeLP(connect: InfluxParams, prec: string, recs: string[]){
//    console.log('*** WRITE RECORDS ***')
    if(typeof(connect.bucket) === 'undefined'){
        throw 'connect.bucket is undefined.  Cannot write to DB without bucket';
    }
    const writeApi = new InfluxDB({url: connect.url, token: connect.token})
        .getWriteApi(connect.org, connect.bucket, prec as WritePrecisionType)

    writeApi.writeRecords(recs);

    await writeApi
        .close()
        .then(()=> {
            // console.log('Wrote recs:\n' + recs.join('\n'));
        })
        .catch((e) => {
            console.error(e)
            console.error('\nFinished ERROR')
        })
}

export async function query(connect: InfluxParams, fluxQuery: string, cols: string[]) {

    const queryApi = new InfluxDB({
        url: connect.url,
        token: connect.token
    }).getQueryApi(connect.org)

//    console.log('*** QUERY LINES ***')

    // TODO make result object array
    const result: Dico[] = [];

    /*
    cols.forEach((col) => { result += `${col} `})
    result += '\n';
    */
    return new Promise((resolve, reject) => {
        queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                const line: Dico = {}
                cols.forEach((col) => {line[col] = o[col] })
//                console.log(`DEBUG QRR: ${JSON.stringify(line)}`)
                // result += `${line}\n`;
                result.push(line)
            },
            error(e) {
                console.error(e)
//                console.log('Finished ERROR')
                reject(e)
            }, complete() {
//                console.log('Finished SUCCESS')
                resolve(result);
            }
        })
    })
}
