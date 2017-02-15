const TAU = Math.PI * 2;

if (typeof require !== 'undefined') {
	Vector = require('./vector');
}

class Direction {
	constructor(theta) {
		if (theta instanceof Direction)
			this.theta = theta.theta;
		else if (theta instanceof Vector)
			this.theta = theta.direction;
		else if (isNaN(theta))
			throw new Error('Invalid theta');
		else
			this.theta = theta % TAU;
	}

	asVector() {
		return Vector.fromAngle(this.theta);
	}

	perpendicular() {
		// TODO - test that this rotates the same way as Vector#perpendicular()
		return new Direction(this.theta - Math.PI / 2);
	}

	opposite() {
		return new Direction(this.theta + Math.PI);
	}

	get degrees() {
		return this.theta * 180 / Math.PI;
	}

	toString() {
		const v = this.asVector();
		return t(this.degrees) +
			'º (' + t(v.x) + ', ' + t(v.y) + ')';

		function t(n) {
			return n.toString().substr(0, 5);
		}
	}
}

Direction.zero = new Direction(0);

if (typeof module !== 'undefined') module.exports = Direction;
