#!/usr/bin/env python3
"""
Compare performance: New /api/sdk-init vs Old 3-endpoint approach
"""

import urllib.request
import urllib.error
import time
import json
import statistics
import ssl

BASE_URL = "https://devbridge-eta.vercel.app"
API_KEY = "cmjc3tpnl000413oaw117o3fy"
NUM_REQUESTS = 10

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
            cache_status = response.headers.get('x-vercel-cache', 'N/A')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8') if e.fp else ""
        status_code = e.code
        cache_status = 'ERROR'
    except Exception as e:
        return None, 0, str(e), 'ERROR'

    elapsed_ms = (time.time() - start_time) * 1000
    return status_code, elapsed_ms, body, cache_status

def test_old_approach():
    """Test the old 3-endpoint sequential approach"""
    print("\n" + "=" * 60)
    print("OLD APPROACH: 3 Sequential Requests")
    print("=" * 60)

    headers = {"X-API-Key": API_KEY}
    endpoints = [
        "/api/feature-flags",
        "/api/sdk-settings",
        "/api/business-config"
    ]

    all_total_times = []

    for i in range(NUM_REQUESTS):
        total_time = 0
        for endpoint in endpoints:
            status, elapsed, _, _ = make_request(endpoint, headers)
            if status:
                total_time += elapsed
        all_total_times.append(total_time)
        print(f"  Run {i+1:2d}: {total_time:,.0f}ms total (3 requests)")

    print(f"\n  Results ({len(all_total_times)} runs):")
    print(f"  ├─ Min:    {min(all_total_times):,.0f}ms")
    print(f"  ├─ Max:    {max(all_total_times):,.0f}ms")
    print(f"  ├─ Mean:   {statistics.mean(all_total_times):,.0f}ms")
    print(f"  └─ Median: {statistics.median(all_total_times):,.0f}ms")

    return statistics.mean(all_total_times)

def test_new_approach():
    """Test the new combined endpoint approach"""
    print("\n" + "=" * 60)
    print("NEW APPROACH: Single /api/sdk-init Request")
    print("=" * 60)

    headers = {"X-API-Key": API_KEY}
    timings = []
    cache_hits = 0

    for i in range(NUM_REQUESTS):
        status, elapsed, body, cache_status = make_request("/api/sdk-init", headers)
        if status:
            timings.append(elapsed)
            if cache_status == 'HIT':
                cache_hits += 1
            print(f"  Run {i+1:2d}: {elapsed:,.0f}ms (HTTP {status}, Cache: {cache_status})")

            # Show response structure on first request
            if i == 0:
                try:
                    data = json.loads(body)
                    print(f"\n  Response structure:")
                    print(f"  ├─ featureFlags: {len(data.get('featureFlags', {}))} flags")
                    print(f"  ├─ sdkSettings.settings: {len(data.get('sdkSettings', {}).get('settings', {}))} settings")
                    print(f"  ├─ sdkSettings.apiConfigs: {len(data.get('sdkSettings', {}).get('apiConfigs', []))} configs")
                    print(f"  ├─ businessConfig.configs: {len(data.get('businessConfig', {}).get('configs', {}))} configs")
                    print(f"  └─ Response size: {len(body):,} bytes\n")
                except:
                    pass

    if timings:
        print(f"\n  Results ({len(timings)} requests):")
        print(f"  ├─ Min:        {min(timings):,.0f}ms")
        print(f"  ├─ Max:        {max(timings):,.0f}ms")
        print(f"  ├─ Mean:       {statistics.mean(timings):,.0f}ms")
        print(f"  ├─ Median:     {statistics.median(timings):,.0f}ms")
        print(f"  └─ Cache Hits: {cache_hits}/{len(timings)} ({cache_hits/len(timings)*100:.0f}%)")

    return statistics.mean(timings) if timings else 0

def main():
    print("=" * 60)
    print("SDK Init Performance Comparison Test")
    print(f"Target: {BASE_URL}")
    print(f"Requests per test: {NUM_REQUESTS}")
    print("=" * 60)

    # Run tests
    old_mean = test_old_approach()
    new_mean = test_new_approach()

    # Summary
    print("\n" + "=" * 60)
    print("COMPARISON SUMMARY")
    print("=" * 60)
    print(f"\n  Old Approach (3 requests):  {old_mean:,.0f}ms mean")
    print(f"  New Approach (1 request):   {new_mean:,.0f}ms mean")

    if old_mean > 0 and new_mean > 0:
        improvement = ((old_mean - new_mean) / old_mean) * 100
        speedup = old_mean / new_mean
        print(f"\n  Improvement: {improvement:.1f}% faster")
        print(f"  Speedup:     {speedup:.1f}x faster")

        if improvement > 50:
            print(f"\n  ✅ EXCELLENT: Significant performance improvement!")
        elif improvement > 25:
            print(f"\n  ✅ GOOD: Notable performance improvement.")
        else:
            print(f"\n  ⚠️  Improvement less than expected. Check caching.")

if __name__ == "__main__":
    main()
