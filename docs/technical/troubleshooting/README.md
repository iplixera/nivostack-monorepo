# Troubleshooting Documentation

This directory contains troubleshooting guides for common issues in the NivoStack platform.

## Contents

### SDK Issues
- [Screen Flow Empty Diagnosis](SCREEN_FLOW_EMPTY_DIAGNOSIS.md) - Root cause analysis and fix for empty screen flow visualization
- [Screen Flow Diagnosis Overview](SCREEN_FLOW_DIAGNOSIS_OVERVIEW.md) - Diagnostic procedures for screen flow issues

### Build & Deployment
- [Build Disappeared Troubleshooting](BUILD_DISAPPEARED_TROUBLESHOOTING.md) - Issues with builds not appearing in Vercel
- [Deployment Troubleshooting](DEPLOYMENT_TROUBLESHOOTING.md) - Common deployment issues and solutions

## Quick Links

### Common Issues

1. **Screen Flow Shows No Data**
   - See: [SCREEN_FLOW_EMPTY_DIAGNOSIS.md](SCREEN_FLOW_EMPTY_DIAGNOSIS.md)
   - Root cause: Race condition during SDK initialization
   - Fix: SDK update (v14.71.02+)

2. **Build Not Appearing in Vercel**
   - See: [BUILD_DISAPPEARED_TROUBLESHOOTING.md](BUILD_DISAPPEARED_TROUBLESHOOTING.md)

3. **Deployment Fails**
   - See: [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)

## Contributing

When adding new troubleshooting documentation:

1. **File Naming**: Use descriptive ALL_CAPS names with `_TROUBLESHOOTING` or `_DIAGNOSIS` suffix
2. **Structure**: Include the following sections:
   - Symptoms
   - Root Cause
   - Solution
   - Implementation Steps
   - Verification
3. **Cross-reference**: Link to related documentation
4. **Update this README**: Add entry to the appropriate category

## Related Documentation

- [Technical Documentation](../) - Main technical docs
- [Development Guides](../../development/) - Development setup and workflows
- [Deployment Guide](../../deployment/) - Deployment procedures
