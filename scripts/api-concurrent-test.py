#!/usr/bin/env python3
"""
Concurrent API Performance Testing - Simulates SDK init with parallel requests
"""

import urllib.request
import urllib.error
import time
import json
import statistics
import ssl
import concurrent.futures

# Configuration
BASE_URL = "https://devbridge-eta.vercel.app"
API_KEY = "cmjc3tpnl000413oaw117o3fy"
CONCURRENT_USERS = 5
ITERATIONS = 3

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

def sdk_init_sequence(user_id):
    """Simulate a single SDK initialization (like app startup)"""
    headers = {"X-API-Key": API_KEY}
    results = {}

    # SDK init typically calls these endpoints in sequence or parallel
    endpoints = [
        ("feature_flags", "/api/feature-flags"),
        ("sdk_settings", "/api/sdk-settings"),
        ("business_config", "/api/business-config"),
    ]

    total_start = time.time()

    for name, endpoint in endpoints:
        status, elapsed, body = make_request(endpoint, headers)
        results[name] = {"status": status, "time": elapsed}

    total_time = (time.time() - total_start) * 1000
    results["total"] = total_time

    return user_id, results

def main():
    print("=" * 70)
    print("Concurrent SDK Init Performance Test")
    print(f"Base URL: {BASE_URL}")
    print(f"Concurrent Users: {CONCURRENT_USERS}")
    print(f"Iterations: {ITERATIONS}")
    print("=" * 70)

    all_results = []

    for iteration in range(ITERATIONS):
        print(f"\n--- Iteration {iteration + 1}/{ITERATIONS} ---")

        # Simulate concurrent SDK inits
        with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as executor:
            futures = [executor.submit(sdk_init_sequence, i) for i in range(CONCURRENT_USERS)]
            iteration_results = []

            for future in concurrent.futures.as_completed(futures):
                user_id, results = future.result()
                iteration_results.append(results)
                print(f"  User {user_id}: Total {results['total']:.0f}ms "
                      f"(flags: {results['feature_flags']['time']:.0f}ms, "
                      f"settings: {results['sdk_settings']['time']:.0f}ms, "
                      f"config: {results['business_config']['time']:.0f}ms)")

            all_results.extend(iteration_results)

    # Aggregate statistics
    print("\n" + "=" * 70)
    print("AGGREGATE RESULTS")
    print("=" * 70)

    # Calculate stats for each endpoint
    endpoints = ["feature_flags", "sdk_settings", "business_config", "total"]

    print(f"\n{'Metric':<20} {'Min':>12} {'Mean':>12} {'Max':>12} {'p95':>12}")
    print("-" * 70)

    for endpoint in endpoints:
        if endpoint == "total":
            times = [r["total"] for r in all_results]
        else:
            times = [r[endpoint]["time"] for r in all_results]

        p95_idx = int(len(times) * 0.95)
        print(f"{endpoint:<20} {min(times):>11.0f}ms {statistics.mean(times):>11.0f}ms "
              f"{max(times):>11.0f}ms {sorted(times)[p95_idx]:>11.0f}ms")

    # Total SDK init time analysis
    total_times = [r["total"] for r in all_results]
    print(f"\n{'='*70}")
    print("SDK INITIALIZATION TIME ANALYSIS")
    print("=" * 70)
    print(f"Total Samples: {len(total_times)}")
    print(f"Mean SDK Init Time: {statistics.mean(total_times):.0f}ms")
    print(f"Median SDK Init Time: {statistics.median(total_times):.0f}ms")
    print(f"95th Percentile: {sorted(total_times)[int(len(total_times)*0.95)]:.0f}ms")
    print(f"Max SDK Init Time: {max(total_times):.0f}ms")

    # Performance assessment
    mean_init = statistics.mean(total_times)
    print(f"\n{'='*70}")
    print("ASSESSMENT")
    print("=" * 70)

    if mean_init > 3000:
        print(f"🔴 CRITICAL: Mean SDK init time {mean_init:.0f}ms is > 3 seconds")
        print("   This will significantly impact app startup time")
    elif mean_init > 2000:
        print(f"🟠 WARNING: Mean SDK init time {mean_init:.0f}ms is > 2 seconds")
        print("   Users may notice slow app startup")
    elif mean_init > 1000:
        print(f"🟡 ACCEPTABLE: Mean SDK init time {mean_init:.0f}ms is > 1 second")
        print("   Consider optimizations for better UX")
    else:
        print(f"🟢 GOOD: Mean SDK init time {mean_init:.0f}ms is under 1 second")

    print("\nPotential Optimizations:")
    print("  1. Combine endpoints into single /api/sdk-init endpoint")
    print("  2. Add Redis/Vercel Edge caching for config data")
    print("  3. Use Vercel Edge Functions for lower latency")
    print("  4. Implement client-side caching with ETag/If-None-Match")
    print("  5. Lazy load non-critical configs after app startup")

if __name__ == "__main__":
    main()
