import { expect, use } from "chai";
import chaiAsPromised = require('chai-as-promised');
import { CSVParser } from "./parser";
import { EOFError } from "./utils";
import {set, reset} from "mockdate";

import dayjs from "dayjs";
import dayjsCustomParseFormat from "dayjs/plugin/customParseFormat";
import dayjsUTC from "dayjs/plugin/utc";
import dayjsTimezone from "dayjs/plugin/timezone";

dayjs.extend(dayjsCustomParseFormat);
dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);

interface Metric {
  name: any;
  tags: Record<string, any>;
  time: any;
  fields: Record<string, any>;
}

const metric: Metric[] = [];

class Metric {
  constructor(name: any, tags: any, time: any, fields: any) {
    this.name = name;
    this.tags = tags;
    this.time = time;
    this.fields = fields;
  }
}

describe("CSVParser", () => {
  const date = "2020-04-13T18:09:12.451Z"
  beforeEach(async () => {
    use(chaiAsPromised)
    set(date) // Any request to Date will return this date
  });
  

  afterEach(() => {
    reset()
  })

  it("parses a basic CSV", async () => {
    const parser = new CSVParser({
      columnNames: ["first", "second", "third"],
      tagColumns: ["third"],
    });
    const metric = await parser.parseLine("1.4,true,hi");
    expect(metric).to.not.be.null;
  });

  it("parses a CSV with a headerRowCount", async () => {
    const parser = new CSVParser({
      headerRowCount: 2,
      measurementColumn: "3",
    });
    const file = `first,second
  1,2,3
  3.4,70,test_name`;
    const metrics = await parser.parse(file);
    expect(metrics[0]?.name).to.be.eql("test_name");
  });

  it("parses a CSV with a headerRowCount and columnNames specified", async () => {
    const parser = new CSVParser({
      headerRowCount: 1,
      columnNames: ["first", "second", "third"],
      measurementColumn: "third",
    })

    const testCSV = `line1,line2,line3
    3.4,70,test_name`

    const expectedFields = {
      "first":  3.4,
      "second": 70,
    }

    const metrics = await parser.parse(testCSV);
    expect(metrics[0]?.name).to.be.eql('test_name');
    expect(metrics[0]?.fields).to.be.eql(expectedFields);

    const testCSVRows:any = ["line1,line2,line3\r\n", "3.4,70,test_name\r\n"];

    const parser2 = new CSVParser({
      headerRowCount: 1,
      columnNames: ["first", "second", "third"],
      measurementColumn: "third",
    })

    const metrics2 = await parser2.parse(testCSVRows[0]);
    expect(metrics2).to.be.eql(metric);

    const metrics3 = await parser2.parseLine(testCSVRows[1]);
    expect(metrics3?.name).to.be.eql('test_name');
    expect(metrics3?.fields).to.be.eql(expectedFields);
  })

  it("parses a non-annotated CSV", async () => {
    const parser = new CSVParser({
      headerRowCount: 1,
      timestampColumn: "time",
      timestampFormat: "ISO8601",
      measurementColumn: "measurement",
      trimSpace: true
    });
    const file = `measurement,cpu,time_user,time_system,time_idle,time
    cpu,cpu0,42,42,42,2018-09-13T13:03:28Z`;
    const metrics = await parser.parse(file);
    expect(metrics[0]?.name).to.be.eql("cpu");
  });

  it("parses an annotated CSV", async () => {
    const parser = new CSVParser({
      metadataRows: 2,
      metadataSeparators: [":", "="],
      metadataTrimSet: " #",
      headerRowCount: 1,
      tagColumns: ["Version", "File Created"],
      timestampColumn: "time",
      timestampFormat: "ISO8601",
    });
    const file = `# Version=1.1
# File Created: 2021-11-17T07:02:45+10:00
measurement,cpu,time_user,time_system,time_idle,time
cpu,cpu0,42,42,42,2018-09-13T13:03:28Z`;
    const metrics = await parser.parse(file);
    expect(Object.keys(metrics[0]?.tags!)).deep.equal([
      "Version",
      "File Created",
    ]);
  });

  it("allows specifying comments to skip", async () => {
    const parser = new CSVParser({
      headerRowCount: 0,
      comment: '#',
      columnNames: ["first", "second", "third", "fourth"],
      metricName: "test_value",
    });
    const file = `#3.3,4,true,hello
    4,9.9,true,name_this`;

    const expectedFields = {
      "first": 4,
      "second": 9.9,
      "third": true, 
      "fourth": "name_this"
    }
    const metrics = await parser.parse(file);
    expect(metrics[0]?.fields).to.deep.equal(expectedFields);
  });

  it("trims space", async () => {
    const parser = new CSVParser({
      headerRowCount: 0,
      trimSpace: true,
      columnNames: ["first", "second", "third", "fourth"],
      metricName: "test_value",
    });
    const file = ` 3.3, 4,    true,hello`;

    const expectedFields = {
      "first": 3.3,
      "second": 4,
      "third": true, 
      "fourth": "hello"
    }
    const metrics = await parser.parse(file);
    expect(metrics[0]?.fields).to.be.eql(expectedFields);

    const parser2 = new CSVParser({
      headerRowCount: 2, 
      trimSpace: true,
    });

    const testCSV = "   col  ,  col  ,col\n" +
		"  1  ,  2  ,3\n" +
		"  test  space  ,  80  ,test_name"

    const metrics2 = await parser2.parse(testCSV);
    const expectedFields2 = {
      "col1": "test  space", 
      "col2": 80,
      "col3": "test_name", 
    }
    expect(metrics2[0]?.fields).to.be.eql(expectedFields2);
  });

  it("parses quoted numbers", async () => {
    const parser = new CSVParser({
      headerRowCount: 1,
		  columnNames: ["first", "second", "third"],
		  measurementColumn: "third",
    })

    const testCSV = `line1,line2,line3
"3,4",70,test_name`

    const metrics = await parser.parse(testCSV);
    expect(metrics[0]?.fields["first"]).to.be.eql("3,4");
  })

  it("handles specified delimeters", async () => {
    const parser = new CSVParser({
      headerRowCount: 1, 
      delimiter: "%", 
      columnNames: ["first", "second", "third"], 
      measurementColumn: "third"
    })

    const testCSV = `line1%line2%line3
3,4%70%test_name`

    const metrics = await parser.parse(testCSV);
    expect(metrics[0]?.fields["first"]).to.be.eql("3,4");
  })

  it("parses a CSV with types explicitly and implicitly defined identically", async () => {
    const parser = new CSVParser({
      headerRowCount: 0, 
      delimiter: ",", 
      columnNames: ["first", "second", "third", "fourth"], 
      metricName: "test_value",
    })

    const testCSV = `3.3,4,true,hello`

    const expectedFields = {
      "first": 3.3,
      "second": 4, 
      "third": true,
      "fourth": "hello"
    }
    const metrics = await parser.parse(testCSV);
    const expectedMetric = new Metric("test_value",{}, date, expectedFields);
    const returnedMetric = new Metric(metrics[0]?.name, metrics[0]?.tags, date, metrics[0]?.fields)

    expect(expectedMetric).deep.equal(returnedMetric);

    // // Test explicit type conversion.
    const parser2 = new CSVParser({
      headerRowCount: 0, 
      delimiter: ",", 
      columnNames: ["first", "second", "third", "fourth"], 
      metricName: "test_value",
      columnTypes: ["float", "int", "bool", "string"]
    })

    const metrics2 = await parser2.parse(testCSV);
    const returnedMetric2 = new Metric(metrics2[0]?.name, metrics2[0]?.tags, date, metrics2[0]?.fields)
    expect(expectedMetric.fields).deep.equal(returnedMetric2.fields);

  })

  it("trims space delimited by space", async () => {
    const parser = new CSVParser({
      delimiter: " ",
      headerRowCount: 1,
      trimSpace: true,
    });
    const file = `   first   second   third   fourth
abcdefgh        0       2    false
  abcdef      3.3       4     true
       f        0       2    false`;

    const expectedFields = {
      first: "abcdef",
      second: 3.3,
      third: 4,
      fourth: true,
    };
    const metrics = await parser.parse(file);

    expect(expectedFields).to.be.deep.equal(metrics[1]?.fields);
  })

  it("skips rows", async () => {
    const parser = new CSVParser({
      headerRowCount: 1, 
      skipRows: 1, 
      tagColumns: ["line1"],
      measurementColumn: "line3"
    });

    const testCSV = `garbage nonsense
line1,line2,line3
hello,80,test_name2`;

    const expectedFields = {
      "line2": 80
    };

    const expectedTags = {
      "line1": "hello",
    };

    const metrics = await parser.parse(testCSV);
    expect("test_name2").to.be.eql(metrics[0]?.name);
    expect(expectedFields).to.be.eql(metrics[0]?.fields);
    expect(expectedTags).to.be.eql(metrics[0]?.tags);


    const parser2 = new CSVParser({
      headerRowCount: 1, 
      skipRows: 1, 
      tagColumns: ["line1"],
      measurementColumn: "line3"
    });
    const testCSVRows: any = ["garbage nonsense\r\n", "line1,line2,line3\r\n", "hello,80,test_name2\r\n"];

    await expect(parser2.parse(testCSVRows[0])).to.be.rejectedWith(Error)
    await expect(() => parser2.parse(testCSVRows[1])).to.not.throw();
    await expect(() => parser2.parse(testCSVRows[2])).to.not.throw();

    const metrics2 = await parser2.parse(testCSVRows[2]);
    expect("test_name2").to.be.eql(metrics2[0]?.name);
    expect(expectedFields).to.be.eql(metrics2[0]?.fields);
    expect(expectedTags).to.be.eql(metrics2[0]?.tags);

  })

  it("skips columns", async () => {
    const parser = new CSVParser({
      skipColumns: 1, 
      columnNames: ["line1", "line2"], 
    });

    const testCSV = `hello,80,test_name`;

    const expectedRecordFields = {
      "line1": 80, 
      "line2": "test_name"
    };

    const metrics = await parser.parse(testCSV);
    expect(expectedRecordFields).to.be.eql(metrics[0]?.fields);

  })

  it("skips columns with headers specified", async () => {
    const parser = new CSVParser({
      skipColumns: 1, 
      headerRowCount: 2,
    });

    const testCSV = `col,col,col
1,2,3
trash,80,test_name`;

    const expectedRecordFields = {
      "col2": 80, 
      "col3": "test_name"
    };

    const metrics = await parser.parse(testCSV);
    expect(expectedRecordFields).to.be.eql(metrics[0]?.fields);

  })

  it("skips measurement columns", async () => {
    const parser = new CSVParser({
      metricName: "csv",
      headerRowCount: 1,
      timestampColumn: "timestamp",
      timestampFormat: "unix",
      trimSpace: true,
    });

    const file = `id,value,timestamp
    1,5,1551129661.954561233`;
    const metrics = await parser.parse(file);
    const expected: Metric = {
      name: "csv",
      fields: { id: 1, value: 5 },
      time: dayjs.unix(1551129661.954561233).toDate(),
      tags: {},
    };

    expect(metrics[0]).to.deep.equal(expected);


  });

  it("skips empty string values", async () => {
    const parser = new CSVParser({
      metricName: "csv",
      headerRowCount: 1,
      columnNames: ["a", "b"],
      skipValues: [""]
    });

    const testCSV = `a,b
1,""`;

    const metrics = await parser.parse(testCSV);

    const expected = {
      name: "csv",
      tags: {},
      fields: {
        "a": 1,
      },
      time: date
    }
    expect(expected.name).to.be.eql(metrics[0]?.name);
    expect(expected.tags).to.be.eql(metrics[0]?.tags);
    expect(expected.fields).to.be.eql(metrics[0]?.fields);
    expect(JSON.stringify(expected.time)).to.be.eql(JSON.stringify(metrics[0]?.time));

  });

  it("skips specified string value", async () => {
    const parser = new CSVParser({
      metricName: "csv",
      headerRowCount: 1,
      columnNames: ["a", "b"],
      skipValues: ["MM"]
    });

    const testCSV = `a,b
1,MM`;

    const metrics = await parser.parse(testCSV);

    const expected = {
      name: "csv",
      tags: {},
      fields: {
        "a": 1,
      },
      time: date
    }
    expect(expected.name).to.be.eql(metrics[0]?.name);
    expect(expected.tags).to.be.eql(metrics[0]?.tags);
    expect(expected.fields).to.be.eql(metrics[0]?.fields);
    expect(JSON.stringify(expected.time)).to.be.eql(JSON.stringify(metrics[0]?.time));

  });

  it("skips error on corrupted CSV line", async () => {
    const parser = new CSVParser({
      headerRowCount: 1,
      timestampColumn: "date",
      measurementColumn: "third",
      timestampFormat: "DD/MM/YY hh:mm:ss A",
      skipErrors: true,
    });

    const testCSV = `date,a,b
23/05/09 11:05:06 PM,1,2
corrupted_line
07/11/09 04:06:07 PM,3,4`;

    const expectedfields0 = {
      "a": 1,
      "b": 2,
    }

    const expectedfields1 = {
      "a": 3,
      "b": 4,
    }
    const metrics = await parser.parse(testCSV);
  expect(metrics[0]?.fields).to.deep.equal(expectedfields0);
  expect(metrics[1]?.fields).to.deep.equal(expectedfields1);
  });

  it("can parse with multi header config", async () => {
    const parser = new CSVParser({
      headerRowCount: 2,
    });

    const testCSV = `col,col
1,2
80,test_name`;

    const expectedRecordFields = {
      "col1": 80, 
      "col2": "test_name"
    };

    const metrics = await parser.parse(testCSV);
    expect(expectedRecordFields).to.be.eql(metrics[0]?.fields);

    const testCSVRows: any = ["col,col\r\n", "1,2\r\n", "80,test_name\r\n"];

    const parser2 = new CSVParser({
      headerRowCount: 2,
    });

    await expect(parser2.parse(testCSVRows[0])).to.be.rejectedWith(Error)
    await expect(() => parser2.parse(testCSVRows[1])).to.not.throw();

    const metrics2 = await parser2.parse(testCSVRows[2]);
    expect(expectedRecordFields).to.be.eql(metrics2[0]?.fields);


  })

  it("parses stream", async () => {
    const parser = new CSVParser({
      metricName: "csv", 
      headerRowCount: 1,
    });

    const csvHeader = "a,b,c";
    const csvBody = "1,2,3";

    const expected = [
      {
        name: "csv",
        tags: {},
        fields: {
          "a": 1,
          "b": 2,
          "c": 3
        },
        time: date
      }
    ]

    const metrics = await parser.parse(csvHeader);
    expect(metrics.length).to.be.eql(0);

    const metrics2 = await parser.parseLine(csvBody);

    expect(metrics2?.name).to.deep.equal(expected[0]?.name)
    expect(metrics2?.fields).to.deep.equal(expected[0]?.fields)
    expect(metrics2?.tags).to.deep.equal(expected[0]?.tags)
    expect(JSON.stringify(metrics2?.time)).to.deep.equal(JSON.stringify(expected[0]?.time))

  })

  it("throws an error when parseLine returns more than one line", async () => {
    const parser = new CSVParser({
      metricName: "csv", 
      headerRowCount: 1,
    });

    const csvHeader = "a,b,c";
    const csvOneRow = "1,2,3";
    const csvTwoRows = "4,5,6\n7,8,9";

    const expected = [
      {
        name: "csv",
        tags: {},
        fields: {
          "a": 1,
          "b": 2,
          "c": 3
        },
        time: date
      }
    ]

    const metrics = await parser.parse(csvHeader);
    expect(metrics.length).to.be.eql(0);

    const metrics2: any = await parser.parseLine(csvOneRow);

    expect(metrics2?.name).to.deep.equal(expected[0]?.name)
    expect(metrics2?.fields).to.deep.equal(expected[0]?.fields)
    expect(metrics2?.tags).to.deep.equal(expected[0]?.tags)
    expect(JSON.stringify(metrics2?.time)).to.deep.equal(JSON.stringify(expected[0]?.time))

    await expect(parser.parseLine(csvTwoRows)).to.be.rejectedWith(Error, 'Expected 1 metric found 2')

    const metrics3 = await parser.parse(csvTwoRows);
    expect(metrics3.length).to.be.eql(2);
  })

  it("handles timestamps with unix float precision", async () => {
    const parser = new CSVParser({
      metricName: "csv", 
      columnNames: ["time", "value"],
      timestampColumn: "time",
      timestampFormat: "unix",
    });

    const file = `1551129661.95456123352050781250,42`;
    const metrics = await parser.parse(file);
    const expected: Metric = {
      name: "csv",
      fields: { value: 42 },
      time: dayjs.unix(1551129661.954561233).toDate(),
      tags: {},
    };

    expect(metrics[0]).to.deep.equal(expected);
    
  });

  it("handles timestamps with time zones", async () => {
      const parser = new CSVParser({
        headerRowCount: 1,
        columnNames: ["first", "second", "third"],
        measurementColumn: "third",
        timestampColumn: "first",
        timestampFormat: "DD/MM/YY hh:mm:ss A",
        timezone: "Asia/Jakarta",
      });
  
      const testCSV = `line1,line2,line3
  23/05/09 11:05:06 PM,70,test_name
  07/11/09 11:05:06 PM,80,test_name2`;
  
      const metrics = await parser.parse(testCSV);
      expect(metrics[0]?.time).to.deep.equal(dayjs.unix(1243094706).toDate());
      expect(metrics[1]?.time).to.deep.equal(dayjs.unix(1257609906).toDate());
  });

  it("can handle empty measurement name", async () => {
    const parser = new CSVParser({
      metricName: "csv", 
      headerRowCount: 1,
      columnNames: ["", "b"],
      measurementColumn: ""
    });

    const testCSV = `,b
1,2`;

    const metrics = await parser.parse(testCSV);
   
    const expected = {
      name: "csv",
      tags: {},
      fields: {
        "b": 2,
      },
      time: date
    }
    expect(expected.name).to.be.eql(metrics[0]?.name);
    expect(expected.tags).to.be.eql(metrics[0]?.tags);
    expect(expected.fields).to.be.eql(metrics[0]?.fields);
    expect(JSON.stringify(expected.time)).to.be.eql(JSON.stringify(metrics[0]?.time));

  });

  it("handles numeric measurement names specified by measurementColumn", async () => {
    const parser = new CSVParser({
      metricName: "csv", 
      headerRowCount: 1,
      columnNames: ["a", "b"],
      measurementColumn: "a",
    });

    const testCSV = `a,b
1,2`;

    const metrics = await parser.parse(testCSV);
   
    const expected = {
      name: "1",
      tags: {},
      fields: {
        "b": 2,
      },
      time: date
    };

    expect(expected.name).to.be.eql(metrics[0]?.name);
    expect(expected.tags).to.be.eql(metrics[0]?.tags);
    expect(expected.fields).to.be.eql(metrics[0]?.fields);
    expect(JSON.stringify(expected.time)).to.be.eql(JSON.stringify(metrics[0]?.time));

  });

  it("handles static measurement names with no measurementColumn specified", async () => {
    const parser = new CSVParser({
      metricName: "csv", 
      headerRowCount: 1,
      columnNames: ["a", "b"],
    });

    const testCSV = `a,b
1,2`;

    const metrics = await parser.parse(testCSV);
   
    const expected = {
      name: "csv",
      tags: {},
      fields: {
        "a": 1,
        "b": 2,
      },
      time: date
    }
    expect(expected.name).to.be.eql(metrics[0]?.name);
    expect(expected.tags).to.be.eql(metrics[0]?.tags);
    expect(expected.fields).to.be.eql(metrics[0]?.fields);
    expect(JSON.stringify(expected.time)).to.be.eql(JSON.stringify(metrics[0]?.time));

  });


  it("parses with metadata separators", async () => {
    let parser

    expect(() => { 
      parser = new CSVParser({
        columnNames: ["a", "b"],
        metadataRows: 0, 
        metadataSeparators: []
      })
    }).to.not.throw(Error);
    
    let parser2
   
    expect(() => { 
      parser2 = new CSVParser({
        columnNames: ["a", "b"],
        metadataRows: 1, 
        metadataSeparators: []
      })
    }).to.throw(Error, "metadataSeparators required when specifying metadataRows");
    
    const parser3 = new CSVParser({
      columnNames: ["a", "b"],
      metadataRows: 1, 
      metadataSeparators: [",", "=", ",", ":", "=", ":="]
    });

    expect(parser3.metadataSeparatorList.length).to.equal(4);
    expect(parser3.config.metadataTrimSet.length).to.equal(0);
    expect(parser3.metadataSeparatorList).deep.equal([":=", ",", "=", ":"]);

    const parser4 = new CSVParser({
      columnNames: ["a", "b"],
      metadataRows: 1, 
      metadataSeparators: [",", ":", "=", ":="],
      metadataTrimSet: " #'"
    });

    expect(parser4.metadataSeparatorList.length).to.equal(4);
    expect(parser4.config.metadataTrimSet.length).to.equal(3);
    expect(parser4.metadataSeparatorList).deep.equal([":=", ",", ":", "="]);
  });

  it("parses metadata rows", async () => {
    const parser = new CSVParser({
      columnNames: ["a", "b"],
      metadataRows: 5, 
      metadataSeparators: [":=", ",", ":", "="]
    });

    expect(Object.keys(parser.metadataTags).length).to.equal(0);

    let parseMetadata = parser.parseMetadataRow("# this is a not matching string");
    expect(parseMetadata).to.be.empty;

    parseMetadata = parser.parseMetadataRow("# key1 : value1 \r\n");
    expect(parseMetadata).to.deep.equal({"# key1 ": " value1 "});

    parseMetadata = parser.parseMetadataRow("key2=1234\n");
    expect(parseMetadata).to.deep.equal({"key2": "1234"});

    parseMetadata = parser.parseMetadataRow(" file created : 2021-10-08T12:34:18+10:00 \r\n");
    expect(parseMetadata).to.deep.equal({" file created ": " 2021-10-08T12:34:18+10:00 "});

    parseMetadata = parser.parseMetadataRow("file created: 2021-10-08T12:34:18\t\r\r\n");
    expect(parseMetadata).to.deep.equal({"file created": " 2021-10-08T12:34:18\t"});

    const parser2 = new CSVParser({
      columnNames: ["a", "b"],
      metadataRows: 5, 
      metadataSeparators: [":=", ",", ":", "="],
      metadataTrimSet: " #'"
    });

    expect(Object.keys(parser2.metadataTags).length).to.equal(0);

    let parseMetadata2 = parser2.parseMetadataRow("# this is a not matching string");
    expect(parseMetadata2).to.be.empty;
    parseMetadata = parser2.parseMetadataRow("# key1 : value1 \r\n");
    expect(parseMetadata).to.deep.equal({"key1": "value1"});

    parseMetadata = parser2.parseMetadataRow("key2=1234\n");
    expect(parseMetadata).to.deep.equal({"key2": "1234"});

    parseMetadata = parser2.parseMetadataRow(" file created : 2021-10-08T12:34:18+10:00 \r\n");
    expect(parseMetadata).to.deep.equal({"file created": "2021-10-08T12:34:18+10:00"});

    parseMetadata = parser2.parseMetadataRow("file created: '2021-10-08T12:34:18'\r\n");
    expect(parseMetadata).to.deep.equal({"file created": "2021-10-08T12:34:18"});

  });

  it("parses CSV files with metadata", async () => {
    const parser = new CSVParser({
      headerRowCount: 1, 
      skipRows: 2, 
      metadataRows: 4, 
      comment: "#",
      tagColumns: ["type"],
      metadataSeparators: [":", "="],
      metadataTrimSet: " #"
    });

    const testCSV = `garbage nonsense that needs be skipped

# version= 1.0

    invalid meta data that can be ignored.
file created: 2021-10-08T12:34:18+10:00
timestamp,type,name,status
2020-11-23T08:19:27+10:00,Reader,R002,1
#2020-11-04T13:23:04+10:00,Reader,R031,0
2020-11-04T13:29:47+10:00,Coordinator,C001,0`;

    parser.setDefaultTags({ test: "tag" });

    const expectedFields = [
      {
      "name": "R002",
      "status": 1, 
      "timestamp": "2020-11-23T08:19:27+10:00"
      },
      {
        "name": "C001",
        "status": 0, 
        "timestamp": "2020-11-04T13:29:47+10:00"
      }
    ];

    const expectedTags = [
      {
        "file created": "2021-10-08T12:34:18+10:00",
        "test": "tag",
        "type": "Reader",
        "version": "1.0",
      },
      {
        "file created": "2021-10-08T12:34:18+10:00",
        "test": "tag",
        "type": "Coordinator",
        "version": "1.0",
      }
    ];
    const metrics = await parser.parse(testCSV);
    metrics.forEach((metric, i) => {
      expect(expectedFields[i]).to.deep.equal(metric.fields);
      expect(expectedTags[i]).to.deep.equal(metric.tags);
    });

    const parser2 = new CSVParser({
      headerRowCount: 1, 
      skipRows: 2, 
      metadataRows: 4, 
      comment: "#",
      tagColumns: ["type", "version"],
      metadataSeparators: [":", "="],
      metadataTrimSet: " #"
    });

    expect(() => parser2).to.not.throw(Error);

    const rows: any = [
"garbage nonsense that needs be skipped",
"",
"# version= 1.0\r\n",
"",
"    invalid meta data that can be ignored.\r\n",
"file created: 2021-10-08T12:34:18+10:00",
"timestamp,type,name,status\n",
"2020-11-23T08:19:27+10:00,Reader,R002,1\r\n",
"#2020-11-04T13:23:04+10:00,Reader,R031,0\n",
"2020-11-04T13:29:47+10:00,Coordinator,C001,0"
];

    // Set default tags
    parser2.setDefaultTags({"test": "tag"});
    let rowIndex = 0;
    for (; rowIndex < 6; rowIndex++) {
      try {
        await parser.parseLine(rows[rowIndex]!);
      } catch (error) {
        expect(error).to.be.deep.equal(EOFError);
      }
    }

    let metric = await parser.parseLine(rows[rowIndex]!);
    rowIndex++;

    metric = await parser.parseLine(rows[rowIndex]!);
    expect(expectedFields[0]).to.deep.equal(metric?.fields);
    expect(expectedTags[0]).to.deep.equal(metric?.tags);
    rowIndex++;

    metric = await parser.parseLine(rows[rowIndex]!);
    expect(metric).to.be.null;
    rowIndex++;

    metric = await parser.parseLine(rows[rowIndex]!);
    expect(expectedFields[1]).to.deep.equal(metric?.fields);
    expect(expectedTags[1]).to.deep.equal(metric?.tags);

  });

  it("overwrtes default tags and metadata tags", async () => {
    const parser = new CSVParser({
      columnNames: ["first", "second", "third"],
      tagColumns: ["second", "third"],
      metadataRows: 2, 
      metadataSeparators: ["="]
    });

    parser.setDefaultTags({"third": "bye", "fourth": "car"});
    expect(parser.parseLine("second=orange")).to.be.rejectedWith(Error)
    await expect(() => parser.parseLine("fourth=plain")).to.not.throw(Error);

    const expectedFields = [
      {"first": 1.4}
    ];

    const expectedTags = [
      {
        "second": "orange",
        "third": "bye", 
        "fourth": "car"
      }
    ];

    const metrics = await parser.parseLine("1.4,apple,hi");
    expect(() => metrics).to.not.throw(Error);

    expect(metrics?.tags).to.deep.equal(expectedTags[0]);
    expect(metrics?.fields).to.deep.equal(expectedFields[0]);
  });

  it("throws an error on CSVs with invalid reset modes", async () => {

    expect(() => new CSVParser({
      headerRowCount: 1,
      resetMode: "garbage"
    })).to.throw(Error, `expected "none" or "always" but got unknown reset mode garbage`)
  });

  it("parses string CSVs with reset mode set to 'none'", async () => {

    const testCSV = `garbage nonsense that needs be skipped

# version= 1.0

    invalid meta data that can be ignored.
file created: 2021-10-08T12:34:18+10:00
timestamp,type,name,status
2020-11-23T08:19:27+00:00,Reader,R002,1
#2020-11-04T13:23:04+00:00,Reader,R031,0
2020-11-04T13:29:47+00:00,Coordinator,C001,0`;

    const expected = [
      {
        name: "",
        tags: {
          "type": "Reader",
          "version": "1.0",
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
        },
        fields: {
          "name": "R002",
				  "status": 1,
        },
        time: "2020-11-23T08:19:27.000Z"
      },
      {
        name: "",
        tags: {
          "type": "Coordinator",
          "version": "1.0",
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
        },
        fields: {
          "name": "C001",
				  "status": 0,
        },
        time: "2020-11-04T13:29:47.000Z"
      }
    ];

    const parser = new CSVParser({
      headerRowCount: 1, 
      skipRows: 2, 
      metadataRows: 4, 
      comment: "#", 
      tagColumns: ["type"],
      metadataSeparators: [":", "="],
      metadataTrimSet: " #",
      timestampColumn: "timestamp",
      timestampFormat: "iso8601",
      resetMode: "none"
    })
    expect(() => parser).to.not.throw(Error);

    // Set default Tags
    parser.setDefaultTags({"test": "tag"});

    const metrics = await parser.parse(testCSV);

    metrics.forEach((metric, i) => {
      expect(metric.name).to.deep.equal(expected[i]?.name)
      expect(metric.fields).to.deep.equal(expected[i]?.fields)
      expect(metric.tags).to.deep.equal(expected[i]?.tags)
      expect(JSON.stringify(metric.time)).to.deep.equal(JSON.stringify(expected[i]?.time))

    });

    // Parsing another data line should work when not resetting
    const additionalCSV = "2021-12-01T19:01:00+00:00,Reader,R009,5\r\n";
    const additionalExpected = [
      {
        name: "",
        tags: {
          "type": "Reader",
          "version": "1.0",
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
        },
        fields: {
          "name": "R009",
				  "status": 5,
        },
        time: "2021-12-01T19:01:00.000Z"
      }
    ];

    const metrics2 = await parser.parse(additionalCSV);
    expect(() => metrics2).to.not.throw(Error);

    expect(metrics2[0]?.name).to.deep.equal(additionalExpected[0]?.name)
    expect(metrics2[0]?.fields).to.deep.equal(additionalExpected[0]?.fields)
    expect(metrics2[0]?.tags).to.deep.equal(additionalExpected[0]?.tags)
    expect(JSON.stringify(metrics2[0]?.time)).to.deep.equal(JSON.stringify(additionalExpected[0]?.time))
  });

  it("parses array CSVs with reset mode set to 'none'", async () => {

    const testCSV: any = ["garbage nonsense that needs be skipped", 
      "", 
      "# version= 1.0\r\n", 
      "", 
      "    invalid meta data that can be ignored.\r\n", 
      "file created: 2021-10-08T12:34:18+10:00", 
      "timestamp,type,name,status\n", 
      "2020-11-23T08:19:27+00:00,Reader,R002,1\r\n", 
      "#2020-11-04T13:23:04+00:00,Reader,R031,0\n",
      "2020-11-04T13:29:47+00:00,Coordinator,C001,0" 
    ]; 

    const expected = [
      {
        name: "",
        tags: {
          "type": "Reader",
          "version": "1.0",
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
        },
        fields: {
          "name": "R002",
				  "status": 1,
        },
        time: "2020-11-23T08:19:27.000Z"
      },
      {
        name: "",
        tags: {
          "type": "Coordinator",
          "version": "1.0",
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
        },
        fields: {
          "name": "C001",
				  "status": 0,
        },
        time: "2020-11-04T13:29:47.000Z"
      }
    ];

    const parser = new CSVParser({
      headerRowCount: 1, 
      skipRows: 2, 
      metadataRows: 4, 
      comment: "#", 
      tagColumns: ["type"],
      metadataSeparators: [":", "="],
      metadataTrimSet: " #",
      timestampColumn: "timestamp",
      timestampFormat: "iso8601",
      resetMode: "none",
    });
    expect(() => parser).to.not.throw(Error);

    // Set default Tags
    parser.setDefaultTags({"test": "tag"});

    const metrics = [];

    for (const [i, line] of testCSV.entries()) {
      
      try {
        let metric = await parser.parseLine(line)
        if (metric !== null) {

          metrics.push(metric);
        }
      } catch (error) {
        if (i < parser.config.skipRows + parser.config.metadataRows) {
          expect(error).to.be.deep.equal(EOFError);
        }
      }
    };

    metrics.forEach((metric, i) => {
      expect(metric.name).to.deep.equal(expected[i]?.name)
      expect(metric.fields).to.deep.equal(expected[i]?.fields)
      expect(metric.tags).to.deep.equal(expected[i]?.tags)
      expect(JSON.stringify(metric.time)).to.deep.equal(JSON.stringify(expected[i]?.time))
    })

    // Parsing another data line should work when not resetting
    const additionalCSV = "2021-12-01T19:01:00+00:00,Reader,R009,5\r\n";
    const additionalExpected = [
      {
        name: "",
        tags: {
          "type": "Reader",
          "version": "1.0",
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
        },
        fields: {
          "name": "R009",
				  "status": 5,
        },
        time: "2021-12-01T19:01:00.000Z"
      }
    ];

    const metrics2 = await parser.parseLine(additionalCSV);
    expect(() => metrics2).to.not.throw(Error);

    expect(metrics2?.name).to.deep.equal(additionalExpected[0]?.name)
    expect(metrics2?.fields).to.deep.equal(additionalExpected[0]?.fields)
    expect(metrics2?.tags).to.deep.equal(additionalExpected[0]?.tags)
    expect(JSON.stringify(metrics2?.time)).to.deep.equal(JSON.stringify(additionalExpected[0]?.time))

  });

  it("parses string CSVs with reset mode set to 'always'", async () => {
    const testCSV = `garbage nonsense that needs be skipped

# version= 1.0

    invalid meta data that can be ignored.
file created: 2021-10-08T12:34:18+10:00
timestamp,type,name,status
2020-11-23T08:19:27+00:00,Reader,R002,1
#2020-11-04T13:23:04+00:00,Reader,R031,0
2020-11-04T13:29:47+00:00,Coordinator,C001,0`

    const expected = [
      {
        name: "",
        tags: {
          "file created" : "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "type": "Reader",
          "version": "1.0",
        },
        fields: {
          "name": "R002",
          "status": 1
        },
        time: "2020-11-23T08:19:27.000Z"
      },
      {
        name: "",
        tags: {
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "type": "Coordinator",
          "version": "1.0",
        },
        fields: {
          "name": "C001",
          "status": 0
        },
        time: "2020-11-04T13:29:47.000Z"
      }
    ];

    const parser = new CSVParser({
      headerRowCount: 1, 
      skipRows: 2, 
      metadataRows: 4, 
      comment: "#", 
      tagColumns: ["type", "category"],
      metadataSeparators: [":", "="],
      metadataTrimSet: " #",
      timestampColumn: "timestamp",
      timestampFormat: "iso8601",
      resetMode: "always",
    });

    parser.setDefaultTags({"test": "tag"});

    const metrics = await parser.parse(testCSV);

    metrics.forEach((metric, i) => {
      expect(metric.name).to.deep.equal(expected[i]?.name)
      expect(metric.fields).to.deep.equal(expected[i]?.fields)
      expect(metric.tags).to.deep.equal(expected[i]?.tags)
      expect(JSON.stringify(metric.time)).to.deep.equal(JSON.stringify(expected[i]?.time))

    });

    // Parsing another data line should fail as it is interpreted as header
    const additionalCSV = "2021-12-01T19:01:00+00:00,Reader,R009,5\r\n";
    await expect(parser.parse(additionalCSV)).to.be.rejectedWith(Error, 'EOF')

    // Prepare a second CSV with different column names
    const testCSV2 = `garbage nonsense that needs be skipped

# version= 1.0

    invalid meta data that can be ignored.
file created: 2021-10-08T12:34:18+10:00
timestamp,category,id,flag
2020-11-23T08:19:27+00:00,Reader,R002,1
#2020-11-04T13:23:04+00:00,Reader,R031,0
2020-11-04T13:29:47+00:00,Coordinator,C001,0`;

    const expected2 = [
      {
        name: "",
        tags: {
          "file created" : "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "category": "Reader",
          "version": "1.0",
        },
        fields: {
          "id": "R002",
          "flag": 1
        },
        time: "2020-11-23T08:19:27.000Z"
      },
      {
        name: "",
        tags: {
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "category": "Coordinator",
          "version": "1.0",
        },
        fields: {
          "id": "C001",
          "flag": 0
        },
        time: "2020-11-04T13:29:47.000Z"
      }
    ];

    // This should work as the parser is reset
    const metrics2 = await parser.parse(testCSV2);
    expect(() => metrics2).to.not.throw(Error);

    metrics2.forEach((metric, i) => {
      expect(metric.name).to.deep.equal(expected2[i]?.name)
      expect(metric.fields).to.deep.equal(expected2[i]?.fields)
      expect(metric.tags).to.deep.equal(expected2[i]?.tags)
      expect(JSON.stringify(metric.time)).to.deep.equal(JSON.stringify(expected2[i]?.time))

    });
  });

  it("parses array CSVs with reset mode set to 'always'", async () => {
    const testCSV: any = ["garbage nonsense that needs be skipped",
		"",
		"# version= 1.0\r\n",
		"",
		"    invalid meta data that can be ignored.\r\n",
		"file created: 2021-10-08T12:34:18+10:00",
		"timestamp,type,name,status\n",
		"2020-11-23T08:19:27+00:00,Reader,R002,1\r\n",
		"#2020-11-04T13:23:04+00:00,Reader,R031,0\n",
		"2020-11-04T13:29:47+00:00,Coordinator,C001,0"];

    const expected = [
      {
        name: "",
        tags: {
          "file created" : "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "type": "Reader",
          "version": "1.0",
        },
        fields: {
          "name": "R002",
          "status": 1
        },
        time: "2020-11-23T08:19:27.000Z"
      },
      {
        name: "",
        tags: {
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "type": "Coordinator",
          "version": "1.0",
        },
        fields: {
          "name": "C001",
          "status": 0
        },
        time: "2020-11-04T13:29:47.000Z"
      }
    ];

    const parser = new CSVParser({
      headerRowCount: 1, 
      skipRows: 2, 
      metadataRows: 4, 
      comment: "#", 
      tagColumns: ["type"],
      metadataSeparators: [":", "="],
      metadataTrimSet: " #",
      timestampColumn: "timestamp",
      timestampFormat: "iso8601",
      resetMode: "always",
    });

    parser.setDefaultTags({"test": "tag"});

    let metrics = [];

    for (const [i, line] of testCSV.entries()) {
      
      try {
        let metric = await parser.parseLine(line)
        if (metric !== null) {
          metrics.push(metric);
        }
      } catch (error) {
        if (i < parser.config.skipRows + parser.config.metadataRows) {
          expect(error).to.be.deep.equal(EOFError);
        }
      }
    };

    metrics.forEach((metric, i) => {
      expect(metric.name).to.deep.equal(expected[i]?.name)
      expect(metric.fields).to.deep.equal(expected[i]?.fields)
      expect(metric.tags).to.deep.equal(expected[i]?.tags)
      expect(JSON.stringify(metric.time)).to.deep.equal(JSON.stringify(expected[i]?.time))
    })


    // Parsing another data line should work in line-wise parsing as
	  // reset-mode "always" is ignored.
    const additionalCSV = "2021-12-01T19:01:00+00:00,Reader,R009,5\r\n";

    const additionalExpected = [
      {
        name: "",
        tags: {
          "file created": "2021-10-08T12:34:18+10:00",
          "test": "tag",
          "type": "Reader",
          "version": "1.0",
        },
        fields: {
          "name": "R009",
          "status": 5
        },
        time: "2021-12-01T19:01:00.000Z"
      }
    ];

    const metrics2 = await parser.parseLine(additionalCSV);

    expect(() => metrics2).to.not.throw(Error);

    expect(metrics2?.name).to.deep.equal(additionalExpected[0]?.name)
    expect(metrics2?.fields).to.deep.equal(additionalExpected[0]?.fields)
    expect(metrics2?.tags).to.deep.equal(additionalExpected[0]?.tags)
    expect(JSON.stringify(metrics2?.time)).to.deep.equal(JSON.stringify(additionalExpected[0]?.time))
    
  });
})
