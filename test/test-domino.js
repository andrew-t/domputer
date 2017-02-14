const Domino = require('../domino'),
	Vector = require('../vector'),
	Direction = require('../direction');

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
});