const utils = require('../utils.js');

const _internalRange = utils.namedList(['lower', 'upper', 'lowerInc', 'upperInc', 'empty']);
const _emptyInternalRange = _internalRange([null, null, false, false, true]);

class Range {
  /**
  @class Range
  @description Abstract base class of all ranges.
  Ranges are strict about types. This means that both `lower` and `upper` must
  be of the given class or subclass, or `null`
  @param {object} settings - The settings of the range.
  @param {string|number|object} [settings.lower=null] - The lower end of the range
  @param {string|number|object} [settings.upper=null] - The upper end of the range
  @param {boolean} [settings.lowerInc=true] - ``true`` if lower end should be included in range.
  @param {boolean} [settings.upperInc=false] ``true`` if upper end should be included in range.
  @param {string} settings.type - The type of the range.
  */
  constructor(settings = {}) {
    this.type = settings.type;
    if (settings.lower && !this.isValidScalar(settings.lower)) {
      throw new Error(`Invalid type for lower bound. Expected: ${this.type}. Got ${utils.getType(settings.lower)} instead.`);
    }

    if (settings.upper && !this.isValidScalar(settings.upper)) {
      throw new Error(`Invalid type for upper bound. Expected: ${this.type}. Got ${utils.getType(settings.upper)} instead.`);
    }

    if (settings.upper && settings.lower && settings.type !== 'date' && settings.upper < settings.lower) {
      throw new Error('Upper bound is less than lower bound!');
    }

    if (settings.upper && settings.lower && settings.type === 'date' && settings.upper.isBefore(settings.lower)) {
      throw new Error('Upper bound is less than lower bound!');
    }

    if (settings.lowerInc !== undefined && typeof settings.lowerInc !== 'boolean') {
      throw new Error(`Invalid type for lowerInc. Expected: boolean. Got ${this.type}.`);
    }
    if (settings.upperInc !== undefined && typeof settings.upperInc !== 'boolean') {
      throw new Error(`Invalid type for upperInc. Expected: boolean. Got ${this.type}.`);
    }
    settings = {
      // Setting default values
      lower: settings.lower !== undefined ? settings.lower : null,
      upper: settings.upper !== undefined ? settings.upper : null,
      lowerInc: (settings.lowerInc === false) ? settings.lowerInc : true,
      upperInc: settings.upperInc || false,
      empty: false,
    };

    this._range = settings;
  }
  /**
  @memberof Range
  @member {number|string|object} lower
  @description The lower bound for the interval.
  */
  get lower() {
    return this._range.lower;
  }
  /**
  @memberof Range
  @member {number|string|object} upper
  @description The upper bound for the interval.
  */
  get upper() {
    return this._range.upper;
  }
  /**
  @memberof Range
  @member {boolean} lowerInc
  @description Whether the lower bound should be included in the interval.
  */
  get lowerInc() {
    return this._range.lowerInc;
  }
  /**
  @memberof Range
  @member {boolean} upperInc
  @description Whether the upper bound should be included in the interval.
  */
  get upperInc() {
    return this._range.upperInc;
  }
  /**
  @memberof Range
  @method empty
  @description Returns an empty Range. An empty Range in unbounded and only
  contains the empty Range.
  @returns {object} An empty Range.
  */
  empty() {
    this._range = _emptyInternalRange;

    return this;
  }
  /**
  @memberof Range
  @method isEmpty
  @description Returns ``true`` if the range is empty.
  @returns {boolean}
  */
  get isEmpty() {
    return this._range.empty;
  }

  /**
  @memberof Range
  @method replace
  @description Returns a new instance of self with the given arguments replaced.
  @param {object} settings - The settings of the range.
  @param settings.lower - The lower end of the range
  @param settings.upper - The upper end of the range
  @param settings.lowerInc - ``true`` if lower end should be
  included in range. Defaults to ``true``.
  @param settings.upperInc - ``true`` if upper end should be
  included in range. Defautls to ``false``.
  @returns {object} A set with the given arguments replaced.
  */
  replace(settings = {}) {
    if (settings.lower !== undefined) {
      if (this.isValidScalar(settings.lower) || settings.lower === null) {
        this._range.lower = settings.lower;
      } else {
        throw new Error(`Invalid type for lower bound. Expected: ${this.type}. Got ${utils.getType(settings.lower)} instead.`);
      }
    }
    if (settings.upper !== undefined) {
      if (this.isValidScalar(settings.upper) || settings.upper === null) {
        this._range.upper = settings.upper;
      } else {
        throw new Error(`Invalid type for upper bound. Expected: ${this.type}. Got ${utils.getType(settings.lower)} instead.`);
      }
    }
    if (settings.lowerInc !== undefined) {
      if (typeof settings.lowerInc !== 'boolean') {
        throw new Error(`Invalid type for lowerInc. Expected: boolean. Got ${this.type}.`);
      }
      this._range.lowerInc = settings.lowerInc;
    }
    if (settings.upperInc !== undefined) {
      if (typeof settings.upperInc !== 'boolean') {
        throw new Error(`Invalid type for upperInc. Expected: boolean. Got ${this.type}.`);
      }
      this._range.upperInc = settings.upperInc;
    }
    if (this._range.lower === null && this._range.upper === null) {
      this._range.empty = true;
    }
    return this;
  }
  /**
  @memberof Range
  @method copy
  @description Returns a copy of the Range
  @returns {object}
  */
  copy() {
    const upper = this.upper;
    const lower = this.lower;
    const upperInc = this.upperInc;
    const lowerInc = this.lowerInc;
    return new this.constructor({ upper, lower, upperInc, lowerInc });
  }
  /**
  @memberof Range
  @method isValidRange
  @description Returns ``true`` if `obj` is a valid range of the same
  type as this. Otherwise ``false``
  @param {range} obj - A range to check
  @returns {boolean}
  */
  isValidRange(obj) {
    return obj instanceof this.constructor;
  }
  /**
  @memberof Range
  @method isValidScalar
  @description Returns ``true`` if `scalar` is a valid scalar of the
   same type as this. Otherwise ``false``
  @param {number|string|object} scalar - A scalar to check
  @returns {boolean}
  */
  isValidScalar(scalar) {
    return utils.getType(scalar) === this.type;
  }

  /**
  @memberof Range
  @method isEqual
  @description Returns ``true`` if this is the same range as other.
  @param {object} scalar - A range to check for equality.
  @returns {boolean}
  */
  isEqual(other) {
    if (!this || !other || !this.isValidRange(other)) {
      return false;
    }
    const keys = Object.keys(this._range);
    let i;
    for (i = 0; i < keys.length; i += 1) {
      const item = keys[i];
      if (this._range[item] !== other._range[item]) {
        return false;
      }
    }
    return true;
  }
  /**
  @memberof Range
  @method contains
  @description Returns ``true`` if this contains other. Other may be either
  range of same type or scalar of same type as the boundaries.
  @param {object|string|number} other - Check whether this contains other.
  @returns {boolean}
  */
  contains(other) {
    if (this.isValidRange(other)) {
      return !this.startsAfter(other) && !this.endsBefore(other);
    } else if (this.isValidScalar(other)) {
      let isInLower = true;
      if (this.lower !== null) {
        isInLower = (this.lower < other);
        if (this.lowerInc) {
          isInLower = this.lower <= other;
        }
      }

      let isInUpper = true;
      if (this.upper !== null) {
        isInUpper = (this.upper > other);
        if (this.upperInc) {
          isInUpper = (this.upper >= other);
        }
      }
      return isInLower && isInUpper;
    }
    throw new Error(`Unsupported type to test for inclusion Expected range or scalar of type ${this.type}. Got ${other} instead.`);
  }
  _lessThan(other) {
    if (!this.isValidRange(other)) {
      return false;
    } else if (this.isEmpty || other.isEmpty) {
      return false;
    } else if (this.lower === null || this.upper === null) {
      return other.lower !== null;
    } else if (this.lower === other.lower) {
      if (this.lowerInc !== other.lowerInc) {
        return this.lowerInc;
      } else if (this.upper === null || other.upper === null) {
        return (other.upper === null);
      } else if (this.upper === other.upper) {
        return !this.upperInc && other.upperInc;
      }
      return this.upper < other.upper;
    }
    return this.lower < other.lower;
  }
  /**
  @memberof Range
  @method overlap
  @description Returns ``true`` if this shares any points with other.
  @param {object} other - Check whether this shares any points with other.
  @returns {boolean}
  */
  overlap(other) {
    let a;
    let b;
    if (!this || !other) {
      return false;
    }

    if (this._lessThan(other)) {
      a = this;
      b = other;
    } else {
      a = other;
      b = this;
    }

    if (a.upper === null || b.lower === null) {
      return true;
    }
    return a.upper > b.lower || (a.upper === b.lower && a.upperInc && b.lowerInc);
  }
  /**
  @memberof Range
  @method adjacent
  @description Returns ``true`` if ranges are directly next to each other but do not overlap.
  @param {object} other - Check whether this is adjacent to other.
  @returns {boolean}
  */
  adjacent(other) {
    if (!this.isValidRange(other)) {
      throw new Error(`Unsupported type to test for inclusion. Expected range of type ${this.type}. Got ${other} instead.`);
    }
    if ((this.lower === null && other.upper === null) ||
    (this.upper === null && other.lower === null)) {
      return false;
    }
    return (this.lower === other.upper && this.lowerInc !== other.upperInc) ||
              (this.upper === other.lower && this.upperInc !== other.lowerInc);
  }
  /**
  @memberof Range
  @method union
  @description Merges two ranges.
  *note: wo ranges can not be merged if the resulting range would be split in two.
  @param {object} other - The range to merge.
  @returns {object} Both of the sets merged together
  */
  union(other) {
    if (!this.isValidRange(other)) {
      throw new Error(`Unsupported type to test for union. Expected range of type ${this.type}. Got ${other} instead.`);
    }

    if (this.isEmpty) {
      return other;
    }
    if (other.isEmpty) {
      return this;
    }
    let a;
    let b;
    if (!this.startsAfter(other)) {
      a = this;
      b = other;
    } else {
      a = other;
      b = this;
    }

    if (!a.overlap(b) && !a.adjacent(b)) {
      throw new Error('Ranges must be either adjacent or overlapping');
    }

    let upper;
    let upperInc;
    if (a.upper === b.upper) {
      upper = a.upper;
      upperInc = a.upperInc || b.upperInc;
    } else if (a.upper === null || b.upper === null) {
      upper = null;
      upperInc = false;
    } else if (a.upper < b.upper) {
      upper = b.upper;
      upperInc = b.upperInc;
    } else {
      upper = a.upper;
      upperInc = a.upperInc;
    }

    return new this.constructor({
      lower: a.lower,
      upper,
      lowerInc: a.lowerInc,
      upperInc,
      type: this.type,
    });
  }
  /**
  @memberof Range
  @method difference
  @description Compute the difference between this and a given range. (in place)
  *note: The difference can not be computed if the resulting range would be
  split in two seperate ranges.
  @param {object} other - The range to find the difference with.
  @returns {object} The difference between the two sets.
  */
  difference(other) {
    if (!this.isValidRange(other)) {
      throw new Error(`Unsupported type to test for difference. Expected range of type ${this.type}. Got ${other} instead.`);
    }

    if (!this || !other || !this.overlap(other)) {
      return this.copy();
    } else if (other.contains(this)) {
      return this.copy().empty();
    } else if (this.contains(other) && !(this.startsWith(other) || this.endsWith(other))) {
      throw new Error('Other range must not be within this range');
    } else if (this.endsBefore(other)) {
      return this.copy().replace({ upper: other.lower, upperInc: !other.lowerInc });
    } else if (this.startsAfter(other) || this.startsWith(other)) {
      return this.copy().replace({ lower: other.upper, lowerInc: !other.upperInc });
    }
    return this.copy().empty();
  }
  /**
  @memberof Range
  @method intersection
  @description Returns a new range containing all points shared by both ranges.
  If no points are shared an empty range is returned. (in place)
  *note: The difference can not be computed if the resulting range would be
  split in two seperate ranges.
  @param {object} other - The range to intersect with.
  @returns {object} A range containing all common points of the two objects
  */
  intersection(other) {
    if (!this.isValidRange(other)) {
      throw new Error(`Unsupported type to test for intersection. Expected range of type ${this.type}. Got ${other} instead.`);
    }

    if (!this || !other || !this.overlap(other)) {
      return new this.constructor().empty();
    }

    const lowerEndSpan = this.startsAfter(other) ? this : other;
    const upperEndSpan = this.endsBefore(other) ? this : other;

    return new this.constructor({
      lower: lowerEndSpan.lower,
      lowerInc: lowerEndSpan.lowerInc,
      upper: upperEndSpan.upper,
      upperInc: upperEndSpan.upperInc,
    });
  }
  /**
  @memberof Range
  @method startsWith
  @description Test if this range starts with other. other may either be range or scalar.
  @param {object|number|string} other - Range or scalar to test.
  @returns {boolean}
  */
  startsWith(other) {
    if (this.isValidRange(other)) {
      if (this.lowerInc === other.lowerInc) {
        return this.lower === other.lower;
      }
      return false;
    } else if (this.isValidScalar(other)) {
      if (this.lowerInc) {
        return this.lower === other;
      }
      return false;
    }
    throw new Error(`Unsupported type to test for startsWith. Expected range or scalar of type ${this.type}. Got ${other} instead.`);
  }
  /**
  @memberof Range
  @method endsWith
  @description Test if this range ends with other. other may either be range or scalar.
  @param {object|number|string} other - Range or scalar to test.
  @returns {boolean}
  */
  endsWith(other) {
    if (this.isValidRange(other)) {
      if (this.upperInc === other.upperInc) {
        return this.upper === other.upper;
      }
      return false;
    } else if (this.isValidScalar(other)) {
      if (this.upperInc) {
        return this.upper === other;
      }
      return false;
    }
    throw new Error(`Unsupported type to test for endsWith. Expected range or scalar of type ${this.type}. Got ${other} instead.`);
  }
  /**
  @memberof Range
  @method startsAfter
  @description Test if this range starts after other. Other may be either a range or a scalar.
  @param {object|number|string} other - Range or scalar to test.
  @returns {boolean}
  */
  startsAfter(other) {
    if (this.isValidRange(other)) {
      if (this.lower === other.lower) {
        return other.lowerInc && !this.lowerInc;
      } else if (this.lower === null) {
        return false;
      } else if (other.lower === null) {
        return true;
      }
      return this.lower > other.lower;
    } else if (this.isValidScalar(other)) {
      return this.lower >= other;
    }
    throw new Error(`Unsupported type to test for startsAfter. Expected range or scalar of type ${this.type}. Got ${other} instead.`);
  }
  /**
  @memberof Range
  @method endsBefore
  @description Test if this range ends before other. Other may be either a range or a scalar.
  @param {object|number|string} other - Range or scalar to test.
  @returns {boolean}
  */
  endsBefore(other) {
    if (this.isValidRange(other)) {
      if (this.upper === other.upper) {
        return other.upperInc && !this.upperInc;
      } else if (this.upper === null) {
        return false;
      } else if (other.upper === null) {
        return true;
      }
      return this.upper <= other.upper;
    } else if (this.isValidScalar(other)) {
      return this.upper <= other;
    }
    throw new Error(`Unsupported type to test for endsBefore. Expected range or scalar of type ${this.type}. Got ${other} instead.`);
  }
  /**
  @memberof Range
  @method leftOf
  @description Test if the range is strictly left of `other`.
  @param {object} other - Range to test.
  @returns {boolean}
  */
  leftOf(other) {
    if (!this.isValidRange(other)) {
      throw new Error(`Unsupported type to test for leftOf. Expected range of type ${this.type}. Got ${other} instead.`);
    }
    return (this.endsBefore(other) && !this.overlap(other));
  }
  /**
  @memberof Range
  @method rightOf
  @description Test if the range is strictly right of `other`.
  @param {object} other - Range to test.
  @returns {boolean}
  */
  rightOf(other) {
    if (!this.isValidRange(other)) {
      throw new Error(`Unsupported type to test for rightOf. Expected range of type ${this.type}. Got ${other} instead.`);
    }
    return other.leftOf(this);
  }
}

module.exports = Range;
