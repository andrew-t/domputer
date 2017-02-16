class LineSegment {
	constructor(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
	}

	get length() {
		return this.asVector().length;
	}

	asVector() {
		return this.p2.minus(this.p1);
	}

	toString() {
		return this.p1.toString() + ' -> ' +
			this.p2.toString();
	}

	crosses(line) {
		const maxX1 = Math.max(this.p1.x, this.p2.x),
			minX1 = Math.min(this.p1.x, this.p2.x),
			maxY1 = Math.max(this.p1.y, this.p2.y),
			minY1 = Math.min(this.p1.y, this.p2.y),
			maxX2 = Math.max(line.p1.x, line.p2.x),
			minX2 = Math.min(line.p1.x, line.p2.x),
			maxY2 = Math.max(line.p1.y, line.p2.y),
			minY2 = Math.min(line.p1.y, line.p2.y);
		if (minX2 > maxX1 || minX1 > maxX2 ||
			minY2 > maxY1 || minY1 > maxY2)
			return false;

		const r1 = this._crossesFullLine(line),
			r2 = line._crossesFullLine(this);
		if (!r1 || !r2)
			return false;
		if (r1 == LineSegment.Improper ||
			r2 == LineSegment.Improper)
			return LineSegment.Improper;
		return LineSegment.Proper;
	}

	contains(point) {
		const v = this.asVector(),
			p = point.minus(this.p1);
		if (p.cross(v) != 0)
			return false;
		const d = p.dot(v),
			l2 = v.dot(v);
		if (d < 0 || d > l2)
			return false;
		return true;
	}

	_crossesFullLine(line) {
		const l1 = line.p1.minus(this.p1),
			l2 = line.p2.minus(this.p1),
			a1 = l1.cross(this.asVector()),
			a2 = l2.cross(this.asVector()),
			result = a1 * a2;
		if (result < 0)
			return LineSegment.Proper;
		if (result == 0)
			return LineSegment.Improper;
		return false;
	}
}

LineSegment.Proper = Symbol('Proper Intersection');
LineSegment.Improper = Symbol('Improper Intersection');

if (typeof module !== 'undefined') module.exports = LineSegment;
