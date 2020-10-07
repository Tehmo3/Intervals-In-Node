const range = require('../intervalsJS.js');
const assert = require('chai').assert;
const expect = require('chai').expect;

describe('Basic Range Functionality', function() {

  it('Creates empty range', function() {
    let emptyIntRange = new range.IntRange().empty();

    assert(typeof emptyIntRange === 'object' && emptyIntRange !== null, 'Object created');
    assert(emptyIntRange.isEmpty);
  });

  it('Tests default bounds', function() {
    let IntRange = new range.IntRange();
    let emptyIntRange = new range.IntRange().empty();
    let testrange = new range.IntRange({lower: 2, lowerInc: false});
    let secondtest = new range.IntRange({lower: 3, upper: 3});

    assert(IntRange.lowerInc);
    assert(!IntRange.upperInc);
    assert(!emptyIntRange.lowerInc);
    assert(!emptyIntRange.upperInc);
    assert(testrange.lower === 3);
    assert(secondtest.isEmpty);
  });

  it('Tests bounds', function() {
    let IntRange = new range.IntRange({lower:1, upper:3});

    assert(IntRange.lower == 1);
    assert(IntRange.upper == 3);
    expect(() => IntRange = new range.IntRange({lower:'a', upper: 2})).to.throw(Error);
    expect(() => IntRange = new range.IntRange({lower:3, upper: 'b'})).to.throw(Error);

    expect(() => IntRange = new range.IntRange({lower:5, upper: 2})).to.throw(Error);
  });

  it('Tests replace', function () {
    let IntRange = new range.IntRange({lower:1, upper:2});
    IntRange.replace({lower:3, upper:10});
    assert(IntRange.lower == 3);
    assert(IntRange.upper == 10);
    assert(IntRange.lowerInc);

    IntRange.replace({lowerInc:true, upperInc:true});
    assert(IntRange.upperInc);
    assert(IntRange.lowerInc);

    expect(() => IntRange.replace({lower:"2000-01-01", upper: 2})).to.throw(Error);
    expect(() => IntRange.replace({upper: "2000-02-03"})).to.throw(Error);
    expect(() => IntRange.replace({upperInc: "2000-02-03"})).to.throw(Error);
    expect(() => IntRange.replace({lowerInc: "2000-02-03"})).to.throw(Error);
  });

  it('tests equality', function() {
    let IntRange = new range.IntRange({lower: 10, upper:24});
    let IntRange2 = new range.IntRange({lower: 10, upper: 24});

    assert(IntRange.isEqual(IntRange2));

    IntRange2.replace({lower: -8});
    assert(!IntRange.isEqual(IntRange2));

    IntRange.replace({lower: -8, upperInc: true});
    assert(!IntRange.isEqual(IntRange2));
    assert(!IntRange.isEqual(2));
  });

  it('tests if the ranges are valid', function () {
    let emptyIntRange = new range.IntRange().empty();
    let IntRange = new range.IntRange({lower:1, upper:2});
    let dateRange = new range.DateRange().fromDate("2000-01-01", "day");

    assert(emptyIntRange.isValidRange(emptyIntRange));
    assert(IntRange.isValidRange(IntRange));
    assert(!IntRange.isValidRange(dateRange));
  });

  it('tests startsAfter', function () {
    let IntRange = new range.IntRange({lower:1, upper:5});
    let startsAfterRange = new range.IntRange({lower: -2, upper: 10});
    let IntRangeUnbounded = new range.IntRange().empty();

    assert(IntRange.startsAfter(startsAfterRange));
    assert(IntRange.startsAfter(0));
    assert(!IntRange.startsAfter(3));
    assert(IntRange.startsAfter(IntRangeUnbounded));

    expect(() => IntRange.startsAfter('a')).to.throw(Error);
  });

  it('tests endsBefore', function () {
    let IntRange = new range.IntRange({lower:1, upper:3});
    let endsBeforeRange = new range.IntRange({lower: 1, upper: 10});
    let IntRangeNoUB = new range.IntRange({lower: 5});
    let IntRangeUnbounded = new range.IntRange().empty();

    assert(IntRange.endsBefore(endsBeforeRange));
    assert(IntRange.endsBefore(5));
    assert(!IntRange.endsBefore(-10));
    assert(IntRange.endsBefore(IntRangeUnbounded));
    assert(!IntRangeNoUB.endsBefore(endsBeforeRange));
    // zero upper bounds
    assert(!new range.IntRange({upper: 0}).endsBefore(new range.IntRange({upper: 0})));
    assert(new range.IntRange({upper: 0}).endsBefore(new range.IntRange({upper: 0, upperInc: true})));
    expect(() => IntRange.endsBefore('a')).to.throw(Error);
  });

  it('tests contains', function () {
    let IntRange = new range.IntRange({lower:1, upper:10});
    let contain = new range.IntRange({lower: 1, upper: 10});

    assert(IntRange.contains(contain));

    contain.replace({lower:3, upper:12});
    assert(!IntRange.contains(contain));

    contain.replace({lower:-2, upper:9});
    assert(!IntRange.contains(contain));

    let IntRangeUnbounded = new range.IntRange().empty();
    assert(IntRange.contains(5));
    assert(!IntRange.contains(-3));
    assert(!IntRange.contains(IntRangeUnbounded));

    expect(() => IntRange.contains('a')).to.throw(Error);

    assert(!new range.IntRange({upper: 10}).contains(10));
    assert(new range.IntRange({upper: 10, upperInc: true}).contains(10));
  });


  it('tests overlaps', function() {
    let IntRange = new range.IntRange({lower:1, upper:10, upperInc: true});
    let overlaps = new range.IntRange({lower: 10, upper: 80, lowerInc: true});

    assert(IntRange.overlap(overlaps));

    overlaps.replace({lower:-2, upper:5});
    assert(IntRange.overlap(overlaps));

    overlaps.replace({lower:12, upper:16});
    assert(!IntRange.overlap(overlaps));

    let IntRangeUnbounded = new range.IntRange().empty();
    assert(IntRange.overlap(IntRangeUnbounded));

    assert(!IntRange.overlap());

  });


  it('tests adjacent', function() {
    let IntRange = new range.IntRange({lower:1, upper:10});
    let adjacent = new range.IntRange({lower: 10, upper: 80, lowerInc: true});

    assert(IntRange.adjacent(adjacent));
    adjacent.replace({lower: 120, upper: 2000});
    assert(!IntRange.adjacent(adjacent));

    expect(() => IntRange.adjacent(1)).to.throw(Error);
  });


  it('tests union', function() {
    let IntRange = new range.IntRange({lower:1, upper:10});
    let IntRange2 = new range.IntRange({lower: 2, upper: 12});


    assert(IntRange.union(IntRange2).upper === 12);
    assert(IntRange.union(IntRange2).lower === 1);

    assert(IntRange2.union(IntRange).upper === 12);
    assert(IntRange2.union(IntRange).lower === 1);

    IntRange2.replace({upper: 10});
    assert(IntRange.union(IntRange2).upper === 10);
    assert(IntRange.union(IntRange2).lower === 1);

    IntRange2.replace({lower: 11, upper: 18});
    expect(() => IntRange.union(IntRange2)).to.throw(Error);

    expect(() => IntRange.union(1)).to.throw(Error);

    // unbounded union
    expect(new range.IntRange({lower: 0, upper: 20}).union(new range.IntRange({lower: 10})))
        .to.eql(new range.IntRange({lower: 0}));
    expect(new range.IntRange({lower: 10}).union(new range.IntRange({lower: 0, upper: 20})))
        .to.eql(new range.IntRange({lower: 0}));
    expect(new range.IntRange({lower: 0, upper: 20}).union(new range.IntRange({upper: 10})))
        .to.eql(new range.IntRange({upper: 20}));
    expect(new range.IntRange({upper: 10}).union(new range.IntRange({lower: 0, upper: 20})))
        .to.eql(new range.IntRange({upper: 20}));

    expect(new range.IntRange({lower: 10, upper: 20}).union(new range.IntRange({lower: 0})))
        .to.eql(new range.IntRange({lower: 0}));
    expect(new range.IntRange({lower: 0}).union(new range.IntRange({lower: 10, upper: 20})))
        .to.eql(new range.IntRange({lower: 0}));
    expect(new range.IntRange({lower: 0, upper: 10}).union(new range.IntRange({upper: 20})))
        .to.eql(new range.IntRange({upper: 20}));
    expect(new range.IntRange({upper: 20}).union(new range.IntRange({lower: 0, upper: 10})))
        .to.eql(new range.IntRange({upper: 20}));

    expect(new range.IntRange({lower: 10}).union(new range.IntRange({lower: 20})))
        .to.eql(new range.IntRange({lower: 10}));
    expect(new range.IntRange({lower: 20}).union(new range.IntRange({lower: 10})))
        .to.eql(new range.IntRange({lower: 10}));
    expect(new range.IntRange({upper: 10}).union(new range.IntRange({upper: 20})))
        .to.eql(new range.IntRange({upper: 20}));
    expect(new range.IntRange({upper: 20}).union(new range.IntRange({upper: 10})))
        .to.eql(new range.IntRange({upper: 20}));

    expect(new range.IntRange({lower: 10}).union(new range.IntRange({upper: 20})))
        .to.eql(new range.IntRange({}));
  });


  it('tests startsWith', function() {
    let IntRange = new range.IntRange({lower:1, upper:10, lowerInc: true});
    let startswithRange = new range.IntRange({lower: 1, upper: 5, lowerInc: true});

    assert(IntRange.startsWith(startswithRange));
    assert(IntRange.startsWith(1));

    startswithRange.replace({lowerInc: false});
    assert(!IntRange.startsWith(startswithRange));

    expect(() => IntRange.startsWith('a')).to.throw(Error);
  });

  it('tests endsWith', function() {
    let IntRange = new range.IntRange({lower:1, upper:10, upperInc: true});
    let endswithRange = new range.IntRange({lower: 5, upper: 10, upperInc: true});
    assert(IntRange.endsWith(endswithRange));
    assert(IntRange.endsWith(10));
    assert(!IntRange.endsWith(3));

    endswithRange.replace({upperInc: true});
    assert(!IntRange.endsWith(endswithRange));


    expect(() => IntRange.endsWith('a')).to.throw(Error);
  });

  it('tests difference', function() {
    let IntRange = new range.IntRange({lower:1, upper:10, upperInc: true, lowerInc: true});
    let IntRange2 = new range.IntRange({lower: 8, upper: 15, lowerInc: true});
    IntRange = IntRange.difference(IntRange2);

    assert(IntRange.lower === 1);
    assert(IntRange.upper == 8);

    IntRange.replace({upper: 5});
    IntRange2.replace({lower: 1});
    assert(IntRange.difference(IntRange2).isEmpty);

    let noOverlap = new range.IntRange({lower: 1000, upper: 2000});
    assert(IntRange.difference(noOverlap).isEqual(IntRange));

    IntRange.replace({lower: 3, upper: 20});
    assert(IntRange.difference(noOverlap).isEqual(IntRange));

    assert(IntRange.difference(IntRange2).upper === 20);
    expect(() => IntRange.difference(1)).to.throw(Error);

    expect(new range.IntRange({upper: 10}).difference(new range.IntRange({upper: 5}))
        .isEqual(new range.IntRange({lower: 5, upper: 10})));

    expect(new range.IntRange({lower: 5}).difference(new range.IntRange({lower: 10}))
        .isEqual(new range.IntRange({lower: 5, upper: 10})));

    assert(new range.IntRange({upper: 5}).difference(new range.IntRange({upper: 10})).isEmpty);
  });


  it('tests intersection', function() {
    let IntRange = new range.IntRange({lower: 3, upper: 5, lowerInc: true, upperInc: false});
    let IntRange2 = new range.IntRange({lower: 1, upper: 10});
    IntRange = IntRange.intersection(IntRange2);

    assert(IntRange.lower === 3);
    assert(IntRange.upper === 5);

    IntRange2.replace({lower: 50, upper: 100});
    assert(IntRange.intersection(IntRange2).isEmpty);


    expect(() => IntRange.intersection(1)).to.throw(Error);
  });


  it('tests left of', function() {
    let IntRange = new range.IntRange({lower: 1, upper: 5});
    let IntRange2 = new range.IntRange({lower: 5, upper: 10});

    assert(IntRange.leftOf(IntRange2));

    IntRange2.replace({lower: 3});
    assert(!IntRange.leftOf(IntRange2));

    // zero bounds
    assert(new range.IntRange({upper: 0}).leftOf(IntRange));

    expect(() => IntRange.leftOf(1)).to.throw(Error);
  });


  it('tests right of', function() {
    let IntRange = new range.IntRange({lower: 5, upper: 10});
    let IntRange2 = new range.IntRange({lower: 1, upper: 5});

    assert(IntRange.rightOf(IntRange2));
    IntRange.replace({lower: 1});

    assert(!IntRange.rightOf(IntRange2));

    expect(() => IntRange.rightOf(1)).to.throw(Error);

  });

});
