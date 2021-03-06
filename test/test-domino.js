const Domino = require('../domino'),
	Vector = require('../xy/vector'),
	Direction = require('../xy/direction');

const expect = require('chai').expect;

describe('domino', () => {
	let trigger,
		direction;
	before(() => direction = Math.random() * Math.PI * 2);
	before(() => trigger = new Domino(new Vector(1, 1), direction));

	it('should topple a nearby domino', () => {
		const topple = trigger.wouldHit(new Domino(
				trigger.location
					.plus(trigger.direction
						.asVector()
						.times(Domino.height / 2)),
				trigger.direction),
			trigger.direction);
		expect(topple).to.be.ok;
	});

	it('should not topple a distant domino', () => {
		const topple = trigger.wouldHit(new Domino(
				trigger.location
					.plus(trigger.direction
						.asVector()
						.times(Domino.height * 1.5)),
				trigger.direction),
			trigger.direction);
		expect(topple).not.to.be.ok;
	});

	it('should not topple a distant domino II', () => {
		const topple = new Domino(
				new Vector(0, 0),
				new Direction(0))
			.wouldHit(new Domino(
					new Vector(Domino.height * 10,
						(Domino.width) * -0.5),
					new Direction(0)),
				new Direction(0));
		expect(topple).not.to.be.ok;
	});
});