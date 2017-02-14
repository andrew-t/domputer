class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	static fromAngle(theta) {
		return new Vector(Math.sin(theta), Math.cos(theta));
	}

	get angle() {
		return Math.atan2(this.y, this.x);
	}

	get direction() {
		return new Direction(this.angle);
	}

	plus(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	minus(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	cross(v) {
		return this.x * v.y - this.y * v.x; 
	}

	get length() {
		return Math.sqrt(this.dot(this));
	}

	equals(v) {
		return (this.x == v.x) && (this.y == v.y);
	}

	normalise() {
		if (this.length == 0) {
			console.warn('Normalised a zero vector.');
			return this;
		}
		return this.over(this.length);
	}

	perpendicular() {
		return new Vector(this.y, -this.x);
	}

	over(s) {
		return new Vector(this.x / s, this.y / s);
	}

	times(s) {
		return new Vector(this.x * s, this.y * s);
	}

	changeOfBasis(x, y, origin) {
		let c = origin ? this.minus(origin) : this;
		// TODO - is this right??
		return new Vector(
			c.dot(x) / x.dot(x),
			c.dot(y) / y.dot(y));
	}

	toString() {
		return `(${this.x}, ${this.y})`;
	}
}

Vector.zero = new Vector(0, 0);

if (module) module.exports = Vector;
