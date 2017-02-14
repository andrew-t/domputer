if (require) {
	Vector = require('./vector');
	Direction = require('./direction');
}

class Domino {
	constructor(location, theta) {
		this.location = location;
		this.direction = theta instanceof Direction
			? theta
			: new Direction(theta);
		this._id = Domino._nextId++;
	}

	// Return a Direction if it will fall,
	// otherwise something falsey
	wouldHit(target, direction) {
		const hw = Domino.width / 2,
			ht = Domino.thickness / 2;
		// Loop over every (integer) point in
		// the fallen domino's footprint:
		const v = this.direction.asVector(),
			u = v.perpendicular();
		for (let x = -hw; x <= hw; ++x)
			for (let y = 1; y <= 1 + Domino.height; ++y) {
				const p = this.location
						.plus(u.times(x))
						.plus(v.times(y)),
					targetV = target.direction.asVector(),
					targetU = targetV.perpendicular();
				// If that point is in the target domino's
				// (standing) footprint, it's falling.
				// We find the coordinates of p relative
				// to the target domino, and check if it's
				// within the expected range:
				const p2 = p.changeOfBasis(
					targetU, targetV,
					target.location);
				if (Math.abs(p2.x) > hw ||
					Math.abs(p2.y) > ht)
					continue;
				// The dominoes do collide, but which way
				// should we fall? For now, only fall
				// directly forward or backward. It's easier
				// and might be fine?
				return (this.location.changeOfBasis(
					targetU, targetV,
					target.location) > 0)
						? this.direction
						: this.direction.opposite();
			}
		return null;
	}

	toString() {
		return 'Domino + ' + this._id + ': ['
			+ this.location.toString()
			+ '; ' + this.direction.toString()
			+ ']';
	}
}

// Dimensions the same for all dominoes:
Domino.width = 10;
Domino.thickness = 2;
Domino.height = 2 * Domino.width;

Domino._nextId = 1;

if (module) module.exports = Domino;
