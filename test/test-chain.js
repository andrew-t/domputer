const Domino = require('../domino'),
	Chain = require('../chain'),
	Vector = require('../vector');

const expect = require('chai').expect;


describe('chain', () => {
	let chain,
		trigger,
		direction;
	beforeEach(() => direction = Math.random() * Math.PI * 2);
	beforeEach(() => trigger = new Domino(new Vector(1, 1), direction));
	beforeEach(() => chain = new Chain(trigger, direction));

	it('should topple a row', () => {
		for (let n = 1; n < 10; ++n)
			chain.add(new Domino(
				trigger.location
					.plus(trigger.direction
						.asVector()
						.times(n * Domino.height / 2)),
				trigger.direction));
		const fall = chain.recalculate();
		expect(fall.length).to.be.greaterThan(1);
		expect(fall.reduce((n, frame) => n + frame.size, 0))
			.to.be.equal(chain.dominoes.length);
	});

	it('should not topple a that are too spaced out', () => {
		for (let n = 1; n < 10; ++n)
			chain.add(new Domino(
				trigger.location
					.plus(trigger.direction
						.asVector()
						.times(n * Domino.height * 1.5)),
				trigger.direction));
		const fall = chain.recalculate();
		expect(fall.length).to.be.equal(1);
	});
});

function printFall(fall) {
	fall.forEach((set, n) => {
		console.log(n + '.');
		set.forEach((dir, dom) => console.log(
			'  ' + dom.toString() +
			' > ' + dir.toString()));
	});
}