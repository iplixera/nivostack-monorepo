// swift-tools-version:5.5
// This file is for reference only - the example app should be added as an Xcode project
// and the SDK should be added as a local package dependency

import PackageDescription

let package = Package(
    name: "NivoStackExample",
    platforms: [
        .iOS(.v13)
    ],
    dependencies: [
        // Add NivoStack SDK as local dependency
        // In Xcode: File → Add Packages... → Add Local...
        // Path: ../ (relative to example directory)
    ],
    targets: [
        // Targets are defined in Xcode project
    ]
)

