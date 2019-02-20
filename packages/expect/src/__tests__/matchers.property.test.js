/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const chalk = require('chalk');
const chalkEnabled = chalk.enabled;
const fc = require('fast-check');
const {customAnything} = require('./__arbitraries__/anything');

beforeAll(() => {
  chalk.enabled = true;
});

afterAll(() => {
  chalk.enabled = chalkEnabled;
});

describe('.rejects', () => {});

describe('.resolves', () => {});

describe('.toBe()', () => {});

describe('.toStrictEqual()', () => {
  test('distinguishes distinct values', () => {
    // Given a and b values such as a different from b
    // We expect `expect(a).not.toStrictEqual(b)`
    fc.assert(
      fc.property(customAnything(), customAnything(), (a, b) => {
        fc.pre(JSON.stringify(a) !== JSON.stringify(b));
        expect(a).not.toStrictEqual(b);
      }),
    );
  });
});

describe('.toEqual()', () => {
  test('is symmetric', () => {
    const noThrowIsEqual = (a, b) => {
      try {
        expect(a).toEqual(b);
        return true;
      } catch (err) {
        return false;
      }
    };
    fc.assert(
      fc.property(customAnything(), customAnything(), (a, b) => {
        // Given a and b values
        // We expect `expect(a).toEqual(b)` to be equivalent to `expect(b).toEqual(a)`
        expect(noThrowIsEqual(a, b)).toBe(noThrowIsEqual(b, a));
      }),
    );
  });
});

describe('.toBeInstanceOf()', () => {});

describe('.toBeTruthy(), .toBeFalsy()', () => {});

describe('.toBeNaN()', () => {});

describe('.toBeNull()', () => {});

describe('.toBeDefined(), .toBeUndefined()', () => {});

describe(
  '.toBeGreaterThan(), .toBeLessThan(), ' +
    '.toBeGreaterThanOrEqual(), .toBeLessThanOrEqual()',
  () => {},
);

describe('.toContain(), .toContainEqual()', () => {});

describe('.toBeCloseTo()', () => {});

describe('.toMatch()', () => {});

describe('.toHaveLength', () => {});

describe('.toHaveProperty()', () => {});

describe('toMatchObject()', () => {});
