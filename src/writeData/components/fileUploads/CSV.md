For more detailed and up to date information check out the [Annotated CSV Documentation](https://docs.influxdata.com/influxdb/latest/reference/syntax/annotated-csv/).

For ingesting custom CSV files into InfluxDB, we recommend you use the [`influx write` command](https://docs.influxdata.com/influxdb/cloud/reference/cli/influx/write/) in the InfluxDB Command Line Interface (CLI).

To install the InfluxDB Command Line Interface (CLI), check out how to [install and use the Influx CLI](https://docs.influxdata.com/influxdb/cloud/tools/influx-cli/).

You can include [Extended annotated CSV](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/)
annotations to specify how the data translates into [line protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/).

Include annotations in the CSV file or inject them using the `--header` flag of
the `influx write` command. See the examples below for more details.

##### Example write command

```sh
influx write -b <%= bucket %> -f path/to/example.csv
```

##### example.csv

```csv
#datatype measurement,tag,double,dateTime:RFC3339
m,host,used_percent,time
mem,host1,64.23,2020-01-01T00:00:00Z
mem,host2,72.01,2020-01-01T00:00:00Z
mem,host1,62.61,2020-01-01T00:00:10Z
mem,host2,72.98,2020-01-01T00:00:10Z
mem,host1,63.40,2020-01-01T00:00:20Z
mem,host2,73.77,2020-01-01T00:00:20Z
```

##### Resulting line protocol

```lp
mem,host=host1 used_percent=64.23 1577836800000000000
mem,host=host2 used_percent=72.01 1577836800000000000
mem,host=host1 used_percent=62.61 1577836810000000000
mem,host=host2 used_percent=72.98 1577836810000000000
mem,host=host1 used_percent=63.40 1577836820000000000
mem,host=host2 used_percent=73.77 1577836820000000000
```

**_Note:_** To test the CSV to line protocol conversion process, use the `influx write dryrun`
command to print the resulting line protocol to stdout rather than write to InfluxDB.

## CSV Annotations

Use **CSV annotations** to specify which element of line protocol each CSV column
represents and how to format the data. CSV annotations are rows at the beginning
of a CSV file that describe column properties.

The `influx write` command supports [Extended annotated CSV](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended)
which provides options for specifying how CSV data should be converted into line
protocol and how data is formatted.

To write data to InfluxDB, data must include the following:

- [measurement](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#measurement)
- [field set](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#field-set)
- [timestamp](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#timestamp) _(Optional but recommended)_
- [tag set](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#tag-set) _(Optional)_

Use CSV annotations to specify which of these elements each column represents.

## Inject annotation headers

If the CSV data you want to write to InfluxDB does not contain the annotations
required to properly convert the data to line protocol, use the `--header` flag
to inject annotation rows into the CSV data.

```sh
influx write -b <%= bucket %> \
  -f path/to/example.csv \
  --header "#constant measurement,birds" \
  --header "#datatype dataTime:2006-01-02,long,tag"
```

##### example.csv

```
date,sighted,loc
2020-01-01,12,Boise
2020-06-01,78,Boise
2020-01-01,54,Seattle
2020-06-01,112,Seattle
2020-01-01,9,Detroit
2020-06-01,135,Detroit
```

##### Resulting line protocol

```
birds,loc=Boise sighted=12i 1577836800000000000
birds,loc=Boise sighted=78i 1590969600000000000
birds,loc=Seattle sighted=54i 1577836800000000000
birds,loc=Seattle sighted=112i 1590969600000000000
birds,loc=Detroit sighted=9i 1577836800000000000
birds,loc=Detroit sighted=135i 1590969600000000000
```

#### Use files to inject headers

The `influx write` command supports importing multiple files in a single command.
Include annotations and header rows in their own file and import them with the write command.
Files are read in the order in which they're provided.

```sh
influx write -b <%= bucket %> \
  -f path/to/headers.csv \
  -f path/to/example.csv
```

##### headers.csv

```
#constant measurement,birds
#datatype dataTime:2006-01-02,long,tag
```

##### example.csv

```
date,sighted,loc
2020-01-01,12,Boise
2020-06-01,78,Boise
2020-01-01,54,Seattle
2020-06-01,112,Seattle
2020-01-01,9,Detroit
2020-06-01,135,Detroit
```

##### Resulting line protocol

```
birds,loc=Boise sighted=12i 1577836800000000000
birds,loc=Boise sighted=78i 1590969600000000000
birds,loc=Seattle sighted=54i 1577836800000000000
birds,loc=Seattle sighted=112i 1590969600000000000
birds,loc=Detroit sighted=9i 1577836800000000000
birds,loc=Detroit sighted=135i 1590969600000000000
```

## Skip annotation headers

Some CSV data may include header rows that conflict with or lack the annotations
necessary to write CSV data to InfluxDB.
Use the `--skipHeader` flag to specify the **number of rows to skip** at the
beginning of the CSV data.

```sh
influx write -b <%= bucket %> \
  -f path/to/example.csv \
  --skipHeader=2
```

You can then inject new header rows to rename columns and provide the necessary annotations.

## Process input as CSV

The `influx write` command automatically processes files with the `.csv` extension as CSV files.
If your CSV file uses a different extension, use the `--format` flat to explicitly
declare the format of the input file.

```sh
influx write -b <%= bucket %> \
  -f path/to/example.txt \
  --format csv
```

**_Note:_** The `influx write` command assumes all input files are line protocol unless they
include the `.csv` extension or you declare the `csv`.

## Specify CSV character encoding

The `influx write` command assumes CSV files contain UTF-8 encoded characters.
If your CSV data uses different character encoding, specify the encoding
with the `--encoding`.

```sh
influx write -b <%= bucket %> \
  -f path/to/example.csv \
  --encoding "UTF-16"
```

## Skip rows with errors

If a row in your CSV data is missing an
[element required to write to InfluxDB](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#elements-of-line-protocol)
or data is incorrectly formatted, when processing the row, the `influx write` command
returns an error and cancels the write request.
To skip rows with errors, use the `--skipRowOnError` flag.

```sh
influx write -b <%= bucket %> \
  -f path/to/example.csv \
  --skipRowOnError
```

**_Warning:_** Skipped rows are ignored and are not written to InfluxDB.

## Advanced examples

### Define constants

Use the Extended annotated CSV [`#constant` annotation](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/#constant)
to add a column and value to each row in the CSV data.

##### CSV with constants

```
#constant measurement,example
#constant tag,source,csv
#datatype long,dateTime:RFC3339
count,time
1,2020-01-01T00:00:00Z
4,2020-01-02T00:00:00Z
9,2020-01-03T00:00:00Z
18,2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example,source=csv count=1 1577836800000000000
example,source=csv count=4 1577923200000000000
example,source=csv count=9 1578009600000000000
example,source=csv count=18 1578096000000000000
```

---

### Annotation shorthand

Extended annotated CSV supports [annotation shorthand](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/#annotation-shorthand),
which lets you define the **column label**, **datatype**, and **default value** in the column header.

##### CSV with annotation shorthand

```
m|measurement,count|long|0,time|dateTime:RFC3339
example,1,2020-01-01T00:00:00Z
example,4,2020-01-02T00:00:00Z
example,,2020-01-03T00:00:00Z
example,18,2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example count=1 1577836800000000000
example count=4 1577923200000000000
example count=0 1578009600000000000
example count=18 1578096000000000000
```

#### Replace column header with annotation shorthand

It's possible to replace the column header row in a CSV file with annotation
shorthand without modifying the CSV file.
This lets you define column data types and default values while writing to InfluxDB.

To replace an existing column header row with annotation shorthand:

1. Use the `--skipHeader` flag to ignore the existing column header row.
2. Use the `--header` flag to inject a new column header row that uses annotation shorthand.

**_Note:_** `--skipHeader` is the same as `--skipHeader=1`.

```sh
influx write -b <%= bucket %> \
  -f example.csv \
  --skipHeader
  --header="m|measurement,count|long|0,time|dateTime:RFC3339"
```

##### Unmodified example.csv

```
m,count,time
example,1,2020-01-01T00:00:00Z
example,4,2020-01-02T00:00:00Z
example,,2020-01-03T00:00:00Z
example,18,2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example count=1i 1577836800000000000
example count=4i 1577923200000000000
example count=0i 1578009600000000000
example count=18i 1578096000000000000
```

---

### Ignore columns

Use the Extended annotated CSV [`#datatype ignored` annotation](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/#ignored)
to ignore columns when writing CSV data to InfluxDB.

##### CSV data with ignored column

```
#datatype measurement,long,time,ignored
m,count,time,foo
example,1,2020-01-01T00:00:00Z,bar
example,4,2020-01-02T00:00:00Z,bar
example,9,2020-01-03T00:00:00Z,baz
example,18,2020-01-04T00:00:00Z,baz
```

##### Resulting line protocol

```
m count=1i 1577836800000000000
m count=4i 1577923200000000000
m count=9i 1578009600000000000
m count=18i 1578096000000000000
```

---

### Use alternate numeric formats

If your CSV data contains numeric values that use a non-default fraction separator (`.`)
or contain group separators, [define your numeric format](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/#double)
in the `double`, `long`, and `unsignedLong` datatype annotations.

**_Note:_** If your **numeric format separators** include a comma (`,`), wrap the column annotation in double
quotes (`""`) to prevent the comma from being parsed as a column separator or delimiter.
You can also define a custom column separator by injecting the `sep=` header.

##### CSV with non-default float values

```
#datatype measurement,"double:.,",dateTime:RFC3339
m,lbs,time
example,"1,280.7",2020-01-01T00:00:00Z
example,"1,352.5",2020-01-02T00:00:00Z
example,"1,862.8",2020-01-03T00:00:00Z
example,"2,014.9",2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example lbs=1280.7 1577836800000000000
example lbs=1352.5 1577923200000000000
example lbs=1862.8 1578009600000000000
example lbs=2014.9 1578096000000000000
```

##### CSV with non-default integer values

```
#datatype measurement,"long:.,",dateTime:RFC3339
m,lbs,time
example,"1,280.0",2020-01-01T00:00:00Z
example,"1,352.0",2020-01-02T00:00:00Z
example,"1,862.0",2020-01-03T00:00:00Z
example,"2,014.9",2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example lbs=1280i 1577836800000000000
example lbs=1352i 1577923200000000000
example lbs=1862i 1578009600000000000
example lbs=2014i 1578096000000000000
```

##### CSV with non-default uinteger values

```
#datatype measurement,"unsignedLong:.,",dateTime:RFC3339
m,lbs,time
example,"1,280.0",2020-01-01T00:00:00Z
example,"1,352.0",2020-01-02T00:00:00Z
example,"1,862.0",2020-01-03T00:00:00Z
example,"2,014.9",2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example lbs=1280u 1577836800000000000
example lbs=1352u 1577923200000000000
example lbs=1862u 1578009600000000000
example lbs=2014u 1578096000000000000
```

---

### Use alternate boolean format

Line protocol supports only [specific boolean values](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#boolean).
If your CSV data contains boolean values that line protocol does not support,
[define your boolean format](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/#boolean)
in the `boolean` datatype annotation.

##### CSV with non-default boolean values

```
sep=;
#datatype measurement,"boolean:y,Y,1:n,N,0",dateTime:RFC3339
m,verified,time
example,y,2020-01-01T00:00:00Z
example,n,2020-01-02T00:00:00Z
example,1,2020-01-03T00:00:00Z
example,N,2020-01-04T00:00:00Z
```

##### Resulting line protocol

```
example verified=true 1577836800000000000
example verified=false 1577923200000000000
example verified=true 1578009600000000000
example verified=false 1578096000000000000
```

---

### Use different timestamp formats

The `influx write` command automatically detects **RFC3339** and **number** formatted
timestamps when converting CSV to line protocol.
If using a different timestamp format, [define your timestamp format](https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/extended/#datetime)
in the `dateTime` datatype annotation.

##### CSV with non-default timestamps

```
#datatype measurement,dateTime:2006-01-02,field
m,time,lbs
example,2020-01-01,1280.7
example,2020-01-02,1352.5
example,2020-01-03,1862.8
example,2020-01-04,2014.9
```

##### Resulting line protocol

```
example lbs=1280.7 1577836800000000000
example lbs=1352.5 1577923200000000000
example lbs=1862.8 1578009600000000000
example lbs=2014.9 1578096000000000000
```
