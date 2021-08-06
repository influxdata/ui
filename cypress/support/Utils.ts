import * as fs from 'fs';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

interface TimeExpr {
    measure: number,
    unit: "s" | "ms" | "us" | "ns" | "m" | "h" | "d"
}

function parseTime(timeString: string){
    const result: TimeExpr = {measure: 0, unit: 's'};
    const range: RegExpMatchArray | null = timeString.match(/[-]?[0-9]*/)
    if(range) {
        result.measure = parseInt(range.toString());
        const match: RegExpMatchArray | null =  timeString.match(/[mnus].*/)
        if(!match){
            throw `failed to match timeString to "${timeString}}" to time unit`
        }
        result.unit = match.toString() as TimeExpr["unit"]
    }
    return result;
}

/* assume number in ms - for now */
function calcTimeStamp(unit: string, prec: string, base: number){
    let msBase: number = 0;
    const now = new Date().getTime();

    switch(unit){
        case "s":
            msBase = base * second;
            break
        case "m":
            msBase = base * minute
            break
        case "h":
            msBase = base * hour;
            break;
        case "d":
            msBase = base * day;
            break;
        default:
            throw `Unhandled time unit ${unit}`
    }

    switch(prec){
        case "s":
            return (now / 1000) + (msBase / 1000);
        case "ms":
            return now + msBase;
        case "us":
            return (now * 1000) + (msBase * 1000);
        case "ns":
            return (now * 1000 * 1000 ) + (msBase * 1000 * 1000);
        default:
            throw `unhandled time precision definition ${prec}`
    }
}

export function addTimestampToRecsFromFile(filePath: string, timeDif: string) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');
    // const now = new Date().getTime();
    const timeFrame: TimeExpr = parseTime(timeDif);

    // Todo use calcTime above
    const timeStamp = calcTimeStamp(timeFrame.unit, "ms", timeFrame.measure);
    const result: string[] = [];

    lines.forEach((line) => {
        if (line.trim().length > 0) {
            result.push(line + " " + timeStamp);
        }
    })

    return result;
}

// noinspection DuplicatedCode
export function addTimestampToRecs(recs: string[], timeDif: string){

    const timeFrame: TimeExpr = parseTime(timeDif);
    const timeStamp = calcTimeStamp(timeFrame.unit, "ms", timeFrame.measure);
    const result: string[] = [];

    recs.forEach((line) => {
        if (line.trim().length > 0) {
            result.push(line + " " + timeStamp);
        }
    })

    return Promise.resolve(result)

}

function _prepTags(tags: {key: string, vals: string[]}[], randomize = false){
    let result: string = '';
    let valIndex = 0;
    for(let i = 0; i < tags.length; i++){
        result += tags[i].key;

        if(randomize){
            result += `=${tags[i].vals[Math.floor(Math.random() * tags[i].vals.length)]}`;
        }else{
            result += `=${tags[i].vals[valIndex++ % tags[i].vals.length]}`
        }
        if(tags[i+1]){
            result += ','
        }
    }
    return result;
}

function _prepFields(fields: {key: string, val: any}[]){
    let result: string = '';

    for(let i = 0; i < fields.length; i++){
        if(typeof(fields[i].val) === 'function'){
            result += `${fields[i].key}=${fields[i].val()}`
        }else{
            result += `${fields[i].key}=${fields[i].val}`
        }
        if(fields[i+1]){ result += ','}
    }
    return result;
}

export function addStaggerTimestampToRecs(recs: string[], timeDif: string, stagger: string){

    const result: string[] = []

    for(let i = 0; i < recs.length; i++){
        const timeFrame: TimeExpr = parseTime(timeDif);
        const staggerFrame: TimeExpr = parseTime(stagger);
        if(timeFrame.unit !== staggerFrame.unit){
            throw (`Time units do not match: ${timeFrame.unit} !== ${staggerFrame.unit}`)
        }
        if(recs[i].match(/.* .*/)){
            const timeStamp = calcTimeStamp(timeFrame.unit, "ms", timeFrame.measure + (staggerFrame.measure * i))
            result.push(recs[i] + " " + timeStamp);
        }
    }
    return Promise.resolve(result)
}
