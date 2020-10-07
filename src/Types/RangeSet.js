class RangeSet {
  /**
  @class RangeSet
  @description A RangeSet works much like a Range. But they are able to contain
  'holes' within the range. A RangeSet is iterable using a for..of loop, it
  loops through the Ranges that make up the set.
  @param {object} settings - The settings of the range.
  @param {array} _list - An Array with all the Ranges to include in the RangeSet
  @param {function} type - The constructor function for a Range of the correct type
  */
  constructor(settings) {
    this.Type = settings.type;
    this._list = [];

    let i;
    for (i = 0; i < settings.ranges.length; i += 1) {
      this.add(settings.ranges[i]);
    }
  }

  get type() {
    return new this.Type();
  }
  /**
  @memberof RangeSet
  @method isEmpty
  @description Returns ``true`` if the RangeSet is empty.
  @returns {boolean}
  */
  get isEmpty() {
    return (this._list.length === 0);
  }
  /**
  @memberof RangeSet
  @method empty
  @description Returns an empty RangeSet. An empty RangeSet in unbounded and
  only contains the empty Range.
  @returns {object} An empty RangeSet.
  */
  empty() {
    this._list = [];
    return this;
  }
  /**
  @memberof RangeSet
  @method isEqual
  @description Returns ``true`` if this is the same RangeSet as other.
  @param {object} scalar - A RangeSet to check for equality.
  @returns {boolean}
  */
  isEqual(other) {
    let i;
    let j;
    let found = false;
    if (this._list.length !== other._list.length) {
      return false;
    }
    for (i = 0; i < this._list.length; i += 1) {
      for (j = 0; j < other._list.length; j += 1) {
        // Since rangesets are sorted
        if (this._list[i].isEqual(other._list[j])) {
          found = true;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  }

  _testRangeSetType(item) {
    if (!this.isValidRangeSet(item)) {
      throw new Error(`Invalid rangeset type. Expected ${this.constructor.name}. Got ${item.constructor.name}`);
    }
  }

  isValidRangeSet(obj) {
    return obj instanceof this.constructor;
  }

  _testRangeType(item) {
    if (!this.isValidRange(item)) {
      throw new Error(`Invalid range type. Expected ${this.constructor.name}. Got ${item.constructor.name}`);
    }
  }
  /**
  @memberof RangeSet
  @method isValidRange
  @description Returns ``true`` if `obj` is a valid range of the same
  type as this. Otherwise ``false``
  @param {range} obj - A range to check
  @returns {boolean}
  */
  isValidRange(obj) {
    return this.type.isValidRange(obj);
  }
  /**
  @memberof RangeSet
  @method isValidScalar
  @description Returns ``true`` if `scalar` is a valid scalar of the
   same type as this. Otherwise ``false``
  @param {number|string|object} scalar - A scalar to check
  @returns {boolean}
  */
  isValidScalar(obj) {
    return this.type.isValidScalar(obj);
  }
  /**
  @memberof RangeSet
  @method copy
  @description Returns a copy of the RangeSet
  @returns {object}
  */
  copy() {
    const newList = [];
    for (const x of this._list) {
      newList.push(x.copy());
    }
    return new this.constructor(newList);
  }
  /**
  @memberof RangeSet
  @method contains
  @description Returns ``true`` if this contains other. Other may be either
  range of same type or scalar of same type as the boundaries.
  @param {object|string|number} other - Check whether this contains other.
  @returns {boolean}
  */
  contains(item) {
    if (!this.isValidRange(item) && !this.isValidScalar(item)) {
      throw new Error(`Unsupported item type provided. Expected range or scalar of type ${this.type}. Got ${item}`);
    }

    if (item === null || item === undefined || item.isEmpty) {
      return true;
    }
    let i;
    for (i = 0; i < this._list.length; i += 1) {
      if (this._list[i].contains(item)) {
        return true;
      }
    }
    return false;
  }
  /**
  @memberof RangeSet
  @method remove
  @description Removes a Range from the set. This operation updates the set in
  place.
  @param {object} item - A Range to remove.
  */
  remove(item) {
    let i = 0;

    if (!item.isEmpty) {
      while (i < this._list.length) {
        const r = this._list[i];
        if (item.leftOf(r)) {
          break;
        } else if (item.overlap(r)) {
          try {
            this._list[i] = r.difference(item);

            if (this._list[i].isEmpty) {
              this._list.splice(i, 1);
              continue; // don't i+1 as we just removed an item
            }
          } catch (e) {
            const one = r.copy();
            const two = r.copy();
            this._list.splice(i, 1);
            this._list.splice(i, 0, one.replace({ lower: item.upper, lowerInc: !item.upperInc }));
            this._list.splice(i, 0, two.replace({ upper: item.lower, upperInc: !item.lowerInc }));
            break;
          }
        }
        i += 1;
      }
    }
  }
  /**
  @memberof RangeSet
  @method add
  @description Adds a Range to the set. This operation updates the set in
  place.
  @param {object} item - A Range to add.
  */
  add(item) {
    let i = 0;
    const buffer = [];
    let boolean = true;

    this._testRangeType(item);

    if (item.isEmpty) {
      return;
    }
    while (i < this._list.length) {
      const r = this._list[i];

      if (r.overlap(item) || r.adjacent(item)) {
        buffer.push(this._list.splice(i, 1)[0]);
        continue; // skip the i+1 as we just removed an item
      } else if (item.leftOf(r)) {
        if (buffer.length === 0) {
          this._list.splice(i, 0, item);
        }
        boolean = false;
        break;
      }
      i += 1;
    }
    if (boolean) {
      if (buffer.length === 0) {
        this._list.push(item);
      }
    }
    if (buffer.length !== 0) {
      let j = 0;
      for (j = 0; j < buffer.length; j += 1) {
        item = item.union(buffer[j]);
      }
      this.add(item);
    }
  }
  /**
  @memberof RangeSet
  @method span
  @description Returns a Range that spans from the first point to the last point
  in this set. That is, the smallest range containing all elements of this set.
  @returns {object} - A Range.
  */
  span() {
    if (this.isEmpty) {
      return new this.Type().empty();
    }
    return this._list[0].replace({
      upper: this._list[this._list.length - 1].upper,
      upperInc: this._list[this._list.length - 1].upperInc,
    });
  }
  /**
  @memberof RangeSet
  @method union
  @description Returns this set combined with every given set into a super set
  for each given set.
  @param {object|array} others - A RangeSet or array of RangeSets to merge with.
  @returns {object} The sets merged together.
  */
  union(others) {
    if (!Array.isArray(others)) {
      others = [others];
    }
    const union = this.copy();
    let i = 0;
    let j = 0;
    for (i = 0; i < others.length; i += 1) {
      this._testRangeSetType(others[i]);
      for (j = 0; j < others[i]._list.length; j += 1) {
        union.add(others[i]._list[j]);
      }
    }
    return union;
  }
  /**
  @memberof RangeSet
  @method difference
  @description Returns this set stripped of every subset that are in the other
  given sets.
  @param {object|array} other - A RangeSet or array of RangeSets to remove.
  @returns {object} A new RangeSet that is the difference of this and the other.
  */
  difference(others) {
    if (!Array.isArray(others)) {
      others = [others];
    }
    const difference = this.copy();
    let i = 0;
    let j = 0;
    for (i = 0; i < others.length; i += 1) {
      this._testRangeSetType(others[i]);
      for (j = 0; j < others[i]._list.length; j += 1) {
        difference.remove(others[i]._list[j]);
      }
    }
    return difference;
  }
  /**
  @memberof RangeSet
  @method intersection
  @description Returns a new set of all subsets that exist in this and every
  given set.
  @param {object|array} other - A RangeSet or array of RangeSets to intersect.
  @returns {object} A new RangeSet that is the intersection between this and
  `other`
  */
  intersection(others) {
    if (!Array.isArray(others)) {
      others = [others];
    }
    let intersection;
    let output = this.copy();
    let i;
    let j;
    let k;
    for (i = 0; i < others.length; i += 1) {
      this._testRangeSetType(others[i]);
      intersection = new this.constructor([]);
      for (j = 0; j < output._list.length; j += 1) {
        for (k = 0; k < others[i]._list.length; k += 1) {
          intersection.add(output._list[j].intersection(others[i]._list[k]));
        }
      }

      if (intersection.isEmpty) {
        return intersection;
      }

      output = intersection;
    }
    return output;
  }
  [Symbol.iterator]() {
    const iterator = this._list[Symbol.iterator]();
    return iterator;
  }
}


module.exports = RangeSet;
