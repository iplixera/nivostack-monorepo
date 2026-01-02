#!/bin/bash
# Quick script to open SDK in Xcode

cd "$(dirname "$0")"
open Package.swift
echo "✅ Opening NivoStack SDK in Xcode..."
echo "📁 Package location: $(pwd)"
