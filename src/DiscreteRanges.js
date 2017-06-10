var RangeClass = require("./Range.js");
var namedList = function(fields) {
    //Emulating pythons Named Tuples
    return function(arr) {
        var obj = { };

        for(var i = 0; i < arr.length; i++) {
            obj[fields[i]] = arr[i];
        }

        return obj;
    };
};

var _internalRange = namedList(["lower","upper","lowerInc","upperInc", "empty"]);
var _emptyInternalRange = _internalRange([null, null, false, false, true])

class DiscreteRange extends RangeClass {
    constructor(settings = {}, step) {
        super(settings);
        this.step = step;
        var lb = this.lower();
        if (this.lower() && !this.lowerInc()) {
            lb = this.next(lb);
        }

        var ub = this.upper();
        if (this.upper() && this.upperInc()) {
            ub = this.next(ub);
        }
        if (this.lower() && this.upper() && lb >= ub) {
            this._range = _emptyInternalRange;
        }
        else {
            this._range = _internalRange([lb, ub, true, false, false]);
        }
    }

    next(curr) {
        return curr + this.step;
    }

    prev(curr) {
        return curr - this.step;
    }

    last() {
        if (!this || !this.upper()) {
            return null;
        }
        else {
            return this.prev(this.upper())
        }
    }

    endsWith(other) {
        if (this.isValidScalar(other)) {
            return this.last() === other;
        }
        else {
            return super.endsWith(other);
        }
    }
}

class intRange extends DiscreteRange {
    constructor(settings = {}) {
        super(settings, 1);
        this.type = "int";
    }
}

class floatRange extends RangeClass {
    constructor(settings = {}) {
        super(settings);
        this.type = "float";
    }
}

module.exports = {
    intRange: intRange,
    floatRange: floatRange
}
