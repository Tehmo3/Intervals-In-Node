const Range = require('./Range.js');
const utils = require('../utils');

const _internalRange = utils.namedList(['lower', 'upper', 'lowerInc', 'upperInc', 'empty']);
const _emptyInternalRange = _internalRange([null, null, false, false, true]);

class DiscreteRange extends Range {
  /**
  @class DiscreteRange
  @extends Range
  @description Discrete ranges are a subset of ranges that work
  on discrete types. This includes `int` and `datetime.date`.
  * Discrete ranges are iterable. Using: let x of IntRange.
  @param {object} settings - The settings of the range.
  @param {number|string} [settings.lower=null] - The lower end of the range
  @param {number|string} [settings.upper=null] - The upper end of the range
  @param {boolean} [settings.lowerInc=true] - ``true`` if lower end should be included in range.
  @param {boolean} [settings.upperInc=false] ``true`` if upper end should be included in range.
  */
  constructor(step, settings = {}) {
    super(settings);
    this.step = step;
    let lb = this.lower;
    if (this.lower !== null && !this.lowerInc) {
      lb = this.next(lb);
    }

    let ub = this.upper;
    if (this.upper !== null && this.upperInc) {
      ub = this.next(ub, this.step, settings.type);
    }
    if (this.lower !== null && this.upper !== null && lb >= ub) {
      this._range = _emptyInternalRange;
      this.replace({ upper: null, lower: null, lowerInc: false, upperInc: false });
    } else {
      this._range = _internalRange([lb, ub, true, false, false]);
      this.replace({ upper: ub, lower: lb, lowerInc: true, upperInc: false });
    }
  }
  /**
  @memberof DiscreteRange
  @method next
  @description Increment the given value with the step defined for this class.
  @param {int|string} curr -Value to increment
  @param {int} [step = 1] - How much to step by each time. OPTIONAL (defaults to
  whatever is appropriate for the current range, for ints it is 1).
  @returns {int|string}
  */
  next(curr, step = 1) {
    if (this) {
      step = this.step ? this.step : step;
    }
    return curr + step;
  }

  [Symbol.iterator]() {
    const nextFunc = this.next;
    const last = this.last();
    const step = this.step;
    let start = this.prev(this.lower, step);
    const iterator = {
      next() {
        start = nextFunc(start, step);
        const bool = (start) > last;
        return {
          value: start,
          done: bool,
        };
      },
    };
    return iterator;
  }
  /**
  @memberof DiscreteRange
  @method prev
  @description Decrement the given value with the step defined for this class.
  @param {int|string} curr -Value to decrement
  @returns {int|string}
  */
  prev(curr) {
    return curr - this.step;
  }
  /**
  @memberof DiscreteRange
  @method last
  @description Returns the last element within this range. If the range has no
  upper limit, `null` is returned.
  @returns {int|string}
  */
  last() {
    if (!this || !this.upper) {
      return null;
    }
    return this.prev(this.upper, this.step, this.type);
  }

  endsWith(other) {
    // Discrete ranges have a lst element even in cases where the UB is null
    if (this.isValidScalar(other)) {
      return this.last() === other;
    }
    return super.endsWith(other);
  }
}
module.exports = DiscreteRange;
