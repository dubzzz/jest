/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import fc from 'fast-check';

import {objectContaining} from '../asymmetricMatchers';

function fromEntries(entries: Array<[string, unknown]>): object {
  // Equivalent to Object.fromEntries
  const obj: object = {};
  for (const [key, value] of entries) {
    obj[key] = value;
  }
  return obj;
}

const objectArb = fc.object({
  withBoxedValues: true,
  withObjectString: true,
  withMap: true,
  withSet: true,
});

test('ObjectContaining matches identical instances', () => {
  fc.assert(
    fc.property(fc.dedup(objectArb, 2), ([instanceA, instanceB]) =>
      objectContaining(instanceA).asymmetricMatch(instanceB),
    ),
  );
});

test('ObjectContaining matches instance with missing root keys', () => {
  fc.assert(
    fc.property(
      objectArb.chain(instance =>
        fc
          .shuffledSubarray(Object.entries(instance))
          .map(subEntries => [fromEntries(subEntries), instance]),
      ),
      ([instanceA, instanceB]) =>
        objectContaining(instanceA).asymmetricMatch(instanceB),
    ),
  );
});

test('ObjectContaining matches instance with missing keys spread accross multiple depths', () => {
  const identicalRootInstances = () => fc.dedup(objectArb, 2);
  const divergingInstances: fc.Memo<[object, object]> = fc.memo(n => {
    if (n <= 1) return identicalRootInstances();
    return (
      fc
        .dictionary(
          fc.string(),
          fc.oneof(identicalRootInstances(), divergingInstances()),
        )
        // At this point our structure will be something like:
        //   { [key]: [subInstanceA[key], subInstanceB[key]] }
        // with objectContaining(subInstanceA[key]).asymmetricMatch(subInstanceB[key])
        // for each key
        .map(objectWithBothInstances => Object.entries(objectWithBothInstances))
        .map(entriesForInstances => [
          fromEntries(entriesForInstances.map(e => [e[0], objectContaining(e[1][0])])),
          fromEntries(entriesForInstances.map(e => [e[0], e[1][1]])),
        ])
        // At this point we have recombined each instance separately
        // They both have the exact same keys (only first level)
        // ie. instanceA and instanceB have the same keys
        .chain(([instanceA, instanceB]) =>
          fc
            .shuffledSubarray(Object.entries(instanceA))
            .map(subEntriesA => [fromEntries(subEntriesA), instanceB]),
        )
    );
    // We might have removed some keys from instanceA by now
  });
  fc.assert(
    fc.property(divergingInstances(3), ([instanceA, instanceB]) =>
      objectContaining(instanceA).asymmetricMatch(instanceB),
    )
  );
});
