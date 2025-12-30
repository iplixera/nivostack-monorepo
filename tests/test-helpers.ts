/**
 * Test Helpers
 * Simple assertion and test utilities
 */

export class TestError extends Error {
  constructor(message: string, public actual?: any, public expected?: any) {
    super(message)
    this.name = 'TestError'
  }
}

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new TestError(message)
  }
}

export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new TestError(
      message || `Expected ${expected}, but got ${actual}`,
      actual,
      expected
    )
  }
}

export function assertNotEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual === expected) {
    throw new TestError(
      message || `Expected values to be different, but both are ${actual}`,
      actual,
      expected
    )
  }
}

export function assertContains(haystack: string, needle: string, message?: string): void {
  if (!haystack.includes(needle)) {
    throw new TestError(
      message || `Expected "${haystack}" to contain "${needle}"`,
      haystack,
      needle
    )
  }
}

export function assertGreaterThan(actual: number, expected: number, message?: string): void {
  if (actual <= expected) {
    throw new TestError(
      message || `Expected ${actual} to be greater than ${expected}`,
      actual,
      expected
    )
  }
}

export function assertLessThan(actual: number, expected: number, message?: string): void {
  if (actual >= expected) {
    throw new TestError(
      message || `Expected ${actual} to be less than ${expected}`,
      actual,
      expected
    )
  }
}

export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new TestError(
      message || `Expected value to be defined, but got ${value}`,
      value
    )
  }
}

export function assertNull(value: any, message?: string): void {
  if (value !== null) {
    throw new TestError(
      message || `Expected value to be null, but got ${value}`,
      value
    )
  }
}

export function assertTrue(value: boolean, message?: string): void {
  if (value !== true) {
    throw new TestError(
      message || `Expected true, but got ${value}`,
      value,
      true
    )
  }
}

export function assertFalse(value: boolean, message?: string): void {
  if (value !== false) {
    throw new TestError(
      message || `Expected false, but got ${value}`,
      value,
      false
    )
  }
}

export function assertInstanceOf<T>(value: any, constructor: new (...args: any[]) => T, message?: string): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TestError(
      message || `Expected instance of ${constructor.name}, but got ${typeof value}`,
      value
    )
  }
}

// Test runner utilities
export interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

export interface TestSuite {
  name: string
  tests: Array<{ name: string; fn: () => Promise<void> | void } | (() => Promise<void> | void)>
}

export async function runTest(name: string, testFn: () => Promise<void> | void): Promise<TestResult> {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    return { name, passed: true, duration }
  } catch (error) {
    const duration = Date.now() - start
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    }
  }
}

export async function runTestSuite(suite: TestSuite): Promise<{ suite: string; results: TestResult[] }> {
  console.log(`\n🧪 Running ${suite.name}...`)
  console.log('━'.repeat(60))

  const results: TestResult[] = []
  for (const test of suite.tests) {
    let testName: string
    let testFn: () => Promise<void> | void

    if (typeof test === 'function') {
      testName = test.name || 'Anonymous Test'
      testFn = test
    } else {
      testName = test.name
      testFn = test.fn
    }

    const result = await runTest(testName, testFn)
    results.push(result)

    if (result.passed) {
      console.log(`  ✅ ${testName} (${result.duration}ms)`)
    } else {
      console.log(`  ❌ ${testName} (${result.duration}ms)`)
      if (result.error) {
        console.log(`     Error: ${result.error}`)
      }
    }
  }

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log(`\n  Summary: ${passed} passed, ${failed} failed`)

  return { suite: suite.name, results }
}

// Compatibility with Jest-style expect
export const expect = {
  toBe: <T>(actual: T, expected: T) => assertEquals(actual, expected),
  not: {
    toBe: <T>(actual: T, expected: T) => assertNotEquals(actual, expected),
  },
  toContain: (haystack: string, needle: string) => assertContains(haystack, needle),
  toBeGreaterThan: (actual: number, expected: number) => assertGreaterThan(actual, expected),
  toBeLessThan: (actual: number, expected: number) => assertLessThan(actual, expected),
  toBeDefined: <T>(value: T | null | undefined) => assertDefined(value),
  toBeNull: (value: any) => assertNull(value),
  toBeTruthy: (value: any) => assertTrue(!!value),
  toBeFalsy: (value: any) => assertFalse(!!value),
  toBeInstanceOf: <T>(value: any, constructor: new (...args: any[]) => T) => assertInstanceOf(value, constructor),
}

// Jest-style test function
export function test(name: string, fn: () => Promise<void> | void): () => Promise<void> | void {
  return async () => {
    try {
      await fn()
    } catch (error) {
      throw new TestError(`Test "${name}" failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

// Jest-style describe function
export function describe(name: string, fn: () => void): TestSuite {
  const tests: Array<() => Promise<void> | void> = []
  
  // Create a context object to pass to the describe function
  const context = {
    test: (testName: string, testFunc: () => Promise<void> | void) => {
      tests.push(async () => {
        try {
          await testFunc()
        } catch (error) {
          throw new TestError(`Test "${testName}" failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      })
    },
  }

  // Run the describe block to collect tests
  // We need to call fn with context, but since we can't modify the signature,
  // we'll use a global test function
  const originalTest = global.test
  global.test = context.test
  try {
    fn()
  } finally {
    global.test = originalTest
  }

  return { name, tests }
}

// Make test available globally
declare global {
  var test: (name: string, fn: () => Promise<void> | void) => void
}

