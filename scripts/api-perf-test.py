#!/usr/bin/env python3
"""
API Performance Testing Script for DevBridge SDK Endpoints
Tests: Feature Flags, SDK Settings, Business Config
"""

import urllib.request
import urllib.error
import time
import json
import statistics
import ssl

# Configuration
BASE_URL = "https://devbridge-eta.vercel.app"
API_KEY = "cmjc3tpnl000413oaw117o3fy"
NUM_REQUESTS = 10

# Disable SSL verification for testing (if needed)
ssl_context = ssl.create_default_context()

def make_request(endpoint, headers=None):
    """Make a single request and return timing info"""
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers=headers or {})

    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30, context=ssl_context) as response:
            body = response.read().decode('utf-8')
            status_code = response.status
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8') if e.fp else ""
        status_code = e.code
    except Exception as e:
        return None, 0, str(e)

    elapsed_ms = (time.time() - start_time) * 1000
    return status_code, elapsed_ms, body

def run_performance_test(name, endpoint, headers):
    """Run multiple requests and collect statistics"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"Endpoint: {endpoint}")
    print(f"{'='*60}")

    timings = []
    statuses = []

    for i in range(NUM_REQUESTS):
        status, elapsed, body = make_request(endpoint, headers)
        if status:
            timings.append(elapsed)
            statuses.append(status)
            print(f"  Request {i+1:2d}: {elapsed:7.2f}ms (HTTP {status})")
        else:
            print(f"  Request {i+1:2d}: FAILED - {body}")

    if timings:
        print(f"\n  Results ({len(timings)} successful requests):")
        print(f"  ├─ Min:     {min(timings):7.2f}ms")
        print(f"  ├─ Max:     {max(timings):7.2f}ms")
        print(f"  ├─ Mean:    {statistics.mean(timings):7.2f}ms")
        print(f"  ├─ Median:  {statistics.median(timings):7.2f}ms")
        if len(timings) > 1:
            print(f"  ├─ Std Dev: {statistics.stdev(timings):7.2f}ms")
        print(f"  └─ p95:     {sorted(timings)[int(len(timings)*0.95)]:7.2f}ms")

        # Parse and show response size from last request
        try:
            data = json.loads(body)
            print(f"\n  Response size: {len(body)} bytes")
        except:
            pass

    return timings

def main():
    print("="*60)
    print("DevBridge API Performance Test")
    print(f"Base URL: {BASE_URL}")
    print(f"Requests per endpoint: {NUM_REQUESTS}")
    print("="*60)

    sdk_headers = {"X-API-Key": API_KEY}

    all_results = {}

    # Test 1: Feature Flags
    all_results['feature_flags'] = run_performance_test(
        "Feature Flags (SDK Init)",
        "/api/feature-flags",
        sdk_headers
    )

    # Test 2: SDK Settings
    all_results['sdk_settings'] = run_performance_test(
        "SDK Settings",
        "/api/sdk-settings",
        sdk_headers
    )

    # Test 3: Business Config
    all_results['business_config'] = run_performance_test(
        "Business Config",
        "/api/business-config",
        sdk_headers
    )

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"{'Endpoint':<25} {'Min':>10} {'Mean':>10} {'Max':>10} {'p95':>10}")
    print("-"*60)

    for name, timings in all_results.items():
        if timings:
            p95_idx = int(len(timings) * 0.95)
            print(f"{name:<25} {min(timings):>9.1f}ms {statistics.mean(timings):>9.1f}ms {max(timings):>9.1f}ms {sorted(timings)[p95_idx]:>9.1f}ms")

    # Performance recommendations
    print("\n" + "="*60)
    print("RECOMMENDATIONS")
    print("="*60)

    for name, timings in all_results.items():
        if timings:
            mean_time = statistics.mean(timings)
            if mean_time > 500:
                print(f"⚠️  {name}: Mean {mean_time:.0f}ms - Consider caching or optimization")
            elif mean_time > 200:
                print(f"⚡ {name}: Mean {mean_time:.0f}ms - Acceptable but could improve")
            else:
                print(f"✅ {name}: Mean {mean_time:.0f}ms - Good performance")

if __name__ == "__main__":
    main()
