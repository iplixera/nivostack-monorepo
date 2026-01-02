// swift-tools-version:5.5
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "NivoStack",
    platforms: [
        .iOS(.v13),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "NivoStack",
            targets: ["NivoStack"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NivoStack",
            dependencies: [],
            path: "Sources/NivoStack"
        ),
        .testTarget(
            name: "NivoStackTests",
            dependencies: ["NivoStack"],
            path: "Tests/NivoStackTests"
        ),
    ]
)

