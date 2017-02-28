if (typeof require !== 'undefined') {
	Vector = require('./xy/vector');
	Direction = require('./xy/direction');
	Polygon = require('./xy/polygon');
}

class Domino {
	constructor(location, theta) {
		this.location = location;
		this.direction = theta instanceof Direction
			? theta
			: new Direction(theta);
		this._id = Domino._nextId++;
	}

	get standingFootprint() {
		const tdv = this.direction.asVector(),
			u = tdv.perpendicular()
					.times(Domino.width / 2),
			v = tdv.times(Domino.thickness / 2);
		return new Polygon([
			this.location.minus(u).minus(v),
			this.location.plus(u).minus(v),
			this.location.plus(u).plus(v),
			this.location.minus(u).plus(v)
		]);
	}

	getFallenFootprint(direction) {
		const dv = direction.asVector(),
			u = dv.perpendicular()
					.times(Domino.width / 2);
		return new Polygon([
			this.location.minus(u)
				.plus(dv.times(Domino.thickness / 2)),
			this.location.plus(u)
				.plus(dv.times(Domino.thickness / 2)),
			this.location.plus(u)
				.plus(dv.times(Domino.height +
					Domino.thickness / 2)),
			this.location.minus(u)
				.plus(dv.times(Domino.height +
					Domino.thickness / 2))
		]);
	}

	// Return a Direction if it will fall,
	// otherwise something falsey
	wouldHit(target, direction) {
		if (!this.isAnywhereNear(target) ||
			!this.getFallenFootprint(direction)
				.intersects(target.standingFootprint))
			return false;
		const behind = this.location
				.minus(target.location)
				.cross(target.direction
					.perpendicular()
					.asVector()) < 0;
		return behind
			? target.direction.opposite()
			: target.direction;
	}

	wouldObstruct(target) {
		return this.isAnywhereNear(target) &&
			this.standingFootprint
				.intersects(target.standingFootprint);
	}

	isAnywhereNear(target) {
		const dx = this.location.x - target.location.x,
			dy = this.location.y - target.location.y;
		return (Math.abs(dx) < Domino.safetyMargin &&
			Math.abs(dy) < Domino.safetyMargin)
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

Domino.safetyMargin = Domino.height + Domino.width + Domino.thickness;

Domino._nextId = 1;

if (typeof module !== 'undefined') module.exports = Domino;
