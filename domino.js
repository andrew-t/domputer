if (typeof require !== 'undefined') {
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
		// Loop over a net of points in
		// the fallen domino's footprint:
		const v = direction.asVector(),
			u = v.perpendicular();
		for (let x = -hw; x <= hw; x += Domino.collisionResolution)
			for (let y = ht; y <= ht + Domino.height; y += Domino.collisionResolution) {
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
				if (Math.abs(p2.x) < hw &&
					Math.abs(p2.y) < ht)
					// The dominoes do collide, but which way
					// should we fall? For now, only fall
					// directly forward or backward. It's easier
					// and might be fine?
					return (this.location.changeOfBasis(
						targetU, targetV,
						target.location).y < 0)
							? target.direction
							: target.direction.opposite();
			}
		return null;
	}

	wouldObstruct(target) {
		// As above, but simpler.
		const hw = Domino.width / 2,
			ht = Domino.thickness / 2;
		const v = this.direction.asVector(),
			u = v.perpendicular();
		for (let x = -hw; x <= hw; x += Domino.collisionResolution)
			for (let y = -ht; y <= ht; y += Domino.collisionResolution) {
				const p = this.location
						.plus(u.times(x))
						.plus(v.times(y)),
					targetV = target.direction.asVector(),
					targetU = targetV.perpendicular();
				const p2 = p.changeOfBasis(
					targetU, targetV,
					target.location);
				if (Math.abs(p2.x) <= hw &&
					Math.abs(p2.y) <= ht)
					return true;
			}
		return false;
	}

	toString() {
		return 'Domino + ' + this._id + ': ['
			+ this.location.toString()
			+ '; ' + this.direction.toString()
			+ ']';
	}
}

// Dimensions the same for all dominoes:
Domino.width = 20;
Domino.thickness = 4;
Domino.height = 2 * Domino.width;

Domino.collisionResolution = 0.2;

Domino._nextId = 1;

if (typeof module !== 'undefined') module.exports = Domino;
