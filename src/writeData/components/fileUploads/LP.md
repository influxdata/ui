For more detailed and up to date information check out the <a href="https://v2.docs.influxdata.com/v2.0/reference/syntax/line-protocol/" target="_blank" rel="noreferrer">Line Protocol Documentation</a>

##### Getting Started

The Line Protocol uploader is a simple tool that can be used to upload files directly to a bucket by uploading a file or writing line protocol directly.

If you're looking to upload Line Protocol files into a specific bucket, simply select the bucket you want your data uploaded to, select the precision of the timestamp your data is set to, and drag & drop your data into the dropzone below. If you're interested in manually writing data into your bucket using line protocol, please continue to the section below.

##### Writing Line Protocol

InfluxDB uses line protocol to write data points. It is a text-based format that provides the measurement, tag set, field set, and timestamp of a data point.

Syntax:

```
measurementName,tagKey=tagValue fieldKey="fieldValue" 1465839830100400200
--------------- --------------- --------------------- -------------------
       |               |                  |                    |
  Measurement       Tag set           Field set            Timestamp
```

Example:

```
myMeasurement,tag1=value1,tag2=value2 fieldKey="fieldValue" 1556813561098000000
```

Lines separated by the newline character `\n` represent a single point in InfluxDB. Line protocol is whitespace sensitive.
