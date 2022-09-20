For more detailed and up to date information check out the [GitHub Repository](https://github.com/influxdata/influxdb-client-swift/)

##### Install via Swift Package Manager

Add this line to your `Package.swift`:

```swift
// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "MyPackage",
    dependencies: [
        .package(name: "influxdb-client-swift", url: "https://github.com/influxdata/influxdb-client-swift", from: "1.4.0"),
    ],
    targets: [
        .target(name: "MyModule", dependencies: [
          .product(name: "InfluxDBSwift", package: "influxdb-client-swift"),
          // or InfluxDBSwiftApis for management API
          .product(name: "InfluxDBSwiftApis", package: "influxdb-client-swift")
        ])
    ]
)
```
