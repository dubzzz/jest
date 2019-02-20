const fc = require('fast-check');

const simpleValues = [
  fc.boolean(),
  fc.integer(),
  fc.double(),
  fc.fullUnicodeString(),
  fc.oneof(fc.fullUnicodeString(), fc.constant(null), fc.constant(undefined)),
  fc.oneof(
    fc.double(),
    fc.constant(-0),
    fc.constant(0),
    fc.constant(Number.NaN),
    fc.constant(Number.POSITIVE_INFINITY),
    fc.constant(Number.NEGATIVE_INFINITY),
    fc.constant(Number.EPSILON),
    fc.constant(Number.MIN_VALUE),
    fc.constant(Number.MAX_VALUE),
    fc.constant(Number.MIN_SAFE_INTEGER),
    fc.constant(Number.MAX_SAFE_INTEGER),
  ),
];

const simpleBoxedValues = simpleValues.map(arb =>
  arb.map(v => {
    switch (typeof v) {
      case 'boolean':
        // eslint-disable-next-line no-new-wrappers
        return new Boolean(v);
      case 'number':
        // eslint-disable-next-line no-new-wrappers
        return new Number(v);
      case 'string':
        // eslint-disable-next-line no-new-wrappers
        return new String(v);
      default:
        return v;
    }
  }),
);

const anythingInternal = maxDepth => {
  const baseArbs = [...simpleValues, ...simpleBoxedValues];
  const potentialArbValue = [...baseArbs]; // base
  if (maxDepth > 0) {
    potentialArbValue.push(
      fc.dictionary(fc.fullUnicodeString(), anythingInternal(maxDepth - 1)),
    ); // object
    potentialArbValue.push(
      fc
        .array(
          fc.tuple(
            anythingInternal(maxDepth - 1),
            anythingInternal(maxDepth - 1),
          ),
        )
        .map(v => new Map(v)),
    ); // map
    potentialArbValue.push(...baseArbs.map(arb => fc.array(arb))); // arrays of base
    potentialArbValue.push(
      ...baseArbs.map(arb => fc.set(arb).map(v => new Set(v))),
    ); // set of base
    potentialArbValue.push(fc.array(anythingInternal(maxDepth - 1))); // mixed content arrays
  }
  if (maxDepth > 1) {
    potentialArbValue.push(
      fc.array(
        fc.dictionary(fc.fullUnicodeString(), anythingInternal(maxDepth - 2)),
      ),
    ); // array of object
    potentialArbValue.push(
      fc
        .set(
          fc.dictionary(fc.fullUnicodeString(), anythingInternal(maxDepth - 2)),
        )
        .map(v => new Set(v)),
    ); // set of object
  }
  return fc.oneof(...potentialArbValue);
};

export const customAnything = () => anythingInternal(5);
