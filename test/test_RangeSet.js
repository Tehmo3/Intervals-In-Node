const assert = require('chai').assert;
const range = require('../intervalsJS.js');
const expect = require('chai').expect;
const moment = require('moment');

describe('IntRangeSet', function() {
  it('Tests Empty & not empty', function() {
    assert(new range.IntRangeSet([]).isEmpty);
    assert(!(new range.IntRangeSet([new range.IntRange({ lower: 1})]).isEmpty));
  });

  it('Tests Span', function() {
    const range1 = new range.IntRange({ lower: 1, upper: 5});
    const range2 = new range.IntRange({ lower: 10, upper: 15});
    const rangeset = new range.IntRangeSet([range1, range2]);
    const span = new range.IntRange({lower: 1, upper: 15});
    assert(rangeset.span().isEqual(span));
    assert(new range.IntRangeSet([]).span().isEqual(new range.IntRange().empty()));
  });

  it('Tests Iteration', function() {
    const range1 = new range.IntRange({ lower: 1, upper: 5});
    const range2 = new range.IntRange({ lower: 10, upper: 15});
    const rangeset = new range.IntRangeSet([range1, range2]);
    let i = 0;
    for (let range of rangeset) {
      if (i === 0) {
        assert(range.isEqual(range1));
      }
      else {
        assert(range.isEqual(range2));
      }
      i += 1;
    }
  });

  it('Test copy', function() {
    const range1 = new range.IntRange({ lower: 1, upper: 5});
    const range2 = new range.IntRange({ lower: 10, upper: 15});
    const rangeset = new range.IntRangeSet([range1, range2]);
    const copy = rangeset.copy();
    assert(rangeset.isEqual(copy));
    copy.add(new range.IntRange({lower: 20, upper: 30}));
    assert(!rangeset.isEqual(copy));

  });

  it('Tests contains', function() {
    const rangeset = new range.IntRangeSet([new range.IntRange({lower: 1, upper: 10})]);
    assert(rangeset.contains(new range.IntRange({lower: 1, upper: 5})));
    assert(rangeset.contains(new range.IntRange({lower: 5, upper: 10})));
    assert(rangeset.contains(new range.IntRange().empty()));
    assert(rangeset.contains(1));
    assert(rangeset.contains(5));
    assert(!rangeset.contains(12));

    expect(() => rangeset.contains(1.4)).to.throw(Error);
    expect(() => rangeset.contains(new range.FloatRangeSet([]))).to.throw(Error);
  });

  it('Tests add', function() {
    const rangeset = new range.DateRangeSet([new range.DateRange({ lower: '2000-01-01', upper: '2000-01-15'})]);
    const secondRangeSet = rangeset.copy();
    secondRangeSet.add(new range.DateRange({ lower: '2000-01-05', upper: '2000-01-15'}));

    assert(rangeset.isEqual(secondRangeSet));
  });

  it('Tests add unbounded', function() {
    const r = new range.IntRangeSet([new range.IntRange({lower: 0, upper: 20})]);
    r.add(new range.IntRange({lower: 10}));
    const e = new range.IntRangeSet([new range.IntRange({lower: 0})]);
    expect(r).to.eql(e);
  });

  it('Tests add unbounded to multiple', function() {
    const r = new range.IntRangeSet([
        new range.IntRange({lower: 0, upper: 20}),
        new range.IntRange({lower: 40, upper: 60}),
    ]);
    r.add(new range.IntRange({lower: 10}));
    const e = new range.IntRangeSet([new range.IntRange({lower: 0})]);
    expect(r).to.eql(e);
  });

  it('Tests remove', function() {
    const set = new range.StrRangeSet([new range.StrRange({ upper: 'b'}), new range.StrRange({ lower: 'h'})]);
    const equalTo = new range.StrRangeSet([new range.StrRange({upper: 'b'}), new range.StrRange({lower: 'h', upper: 'j'}), new range.StrRange({lower: 'm'})]);
    set.remove(new range.StrRange({lower: 'j', upper: 'm'}));

    assert(set.isEqual(equalTo));

    const temp = set.copy();
    temp.remove(new range.StrRange().empty());
    assert(temp.isEqual(set));

    const empty = new range.StrRangeSet().empty();
    empty.remove(new range.StrRange({lower: 'a', upper: 'b'}));
    assert(empty.isEqual(new range.StrRangeSet().empty()));

    expect(() => set.remove(1.4)).to.throw(Error);

    const intSet = new range.IntRangeSet([new range.IntRange({lower: 10, upper: 20}), new range.IntRange({lower: 30, upper: 40})]);
    intSet.remove(new range.IntRange({upper: 40}));
    assert(intSet.isEmpty);
  });

  it('Tests Union', function() {
    const a = new range.IntRangeSet([new range.IntRange({lower: 1, upper: 5}), new range.IntRange({lower: 15, upper: 30})]);
    const b = new range.IntRangeSet([new range.IntRange({lower: 5, upper: 10}), new range.IntRange({lower: 20, upper: 100})]);
    const union =  new range.IntRangeSet([new range.IntRange({lower: 1, upper: 10}), new range.IntRange({lower: 15, upper: 100})]);
    assert(a.union(b).isEqual(union));

    expect(() => a.union(1.4)).to.throw(Error);
    expect(() => a.union(new range.IntRange())).to.throw(Error);
  });

  it('Tests difference', function() {
    const a = new range.IntRangeSet([new range.IntRange({lower: 1, upper: 5}), new range.IntRange({lower: 20, upper: 30})]);
    const b = new range.IntRangeSet([new range.IntRange({lower: 5, upper: 10}), new range.IntRange({lower: 20, upper: 100})]);
    const diff =  new range.IntRangeSet([new range.IntRange({lower: 1, upper: 5})]);

    assert(a.difference(b).isEqual(diff));

    expect(() => a.difference(1.4)).to.throw(Error);
    expect(() => a.difference(new range.IntRange())).to.throw(Error);
  });

  it('Tests intersection', function() {
    const a = new range.IntRangeSet([new range.IntRange({lower: 1, upper: 5}), new range.IntRange({lower: 20, upper: 30})]);
    const b = new range.IntRangeSet([new range.IntRange({lower: 5, upper: 10}), new range.IntRange({lower: 20, upper: 100})]);
    const int =  new range.IntRangeSet([new range.IntRange({lower: 20, upper: 30})]);
    const notEqual = new range.IntRangeSet([new range.IntRange({lower: 25, upper: 30})]);
    assert(a.intersection(b).isEqual(int));
    assert(!a.intersection(b).isEqual(notEqual));

    const c = new range.IntRangeSet([new range.IntRange({lower: 20, upper: 30})]);
    const d = new range.IntRangeSet([new range.IntRange({lower: 30, upper: 40})]);
    assert(c.intersection(d).isEmpty);

    expect(() => a.intersection(new range.IntRange())).to.throw(Error);
  });

  it('Tests values', function() {
    const a = new range.IntRangeSet([new range.IntRange({lower: 1, upper: 5}), new range.IntRange({lower: 20, upper: 30})]);
    const output = [1,2,3,4,20,21,22,23,24,25,26,27,28,29];
    const list = a.values();
    let i;
    for (i = 0; i < list.length; i += 1) {
      assert(output[i] === list[i]);
    }
  });
});
