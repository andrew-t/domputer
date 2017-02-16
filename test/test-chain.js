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

	it('should not topple a row that is too spaced out', () => {
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

	const example = [
		{ x: 15, y: 200, theta: 0 },
		{ x: 35, y: 200, theta: 0 },
		{ x: 55, y: 200, theta: 0 },
		{ x: 75, y: 200, theta: 0 },
		{ x: 95, y: 200, theta: 0 },
		{ x: 540, y: 212, theta: -1.5707963267948966 }
	].map(d =>
			new Domino(new Vector(d.x, d.y), d.theta));

	it('should not break the example', () => {
		const chain = new Chain(
			example[0], example[0].direction);
		example.slice(1).forEach(d => chain.add(d));
		const fall = chain.recalculate();
		// console.log(fall);
		fall.forEach(frame =>
			expect(frame.has(example[5])).not.to.be.ok);
	});

	it('should not topple 5 from 0', () =>
		expect(example[0].wouldHit(
			example[5], example[0].direction))
			.not.to.be.ok);

	const fall = example[0]
			.getFallenFootprint(example[0].direction),
		stand = example[5].standingFootprint;
	// console.log(stand.toString(), fall.points[0].toString())

	it('should not intersect 5 with 0', () =>
		expect(fall.intersects(stand)).not.to.be.ok);

	it('should not contain 5 in 0', () =>
		expect(fall.contains(stand.points[0])).not.to.be.ok);
	it('should not contain 0 in 5', () =>
		expect(stand.contains(fall.points[0])).not.to.be.ok);
	it('should not intersect edges of 0 and 5', () =>
		stand.edges.forEach(s =>
			fall.edges.forEach(f =>
				expect(s.crosses(f)).not.to.be.ok)));
});

function printFall(fall) {
	fall.forEach((set, n) => {
		console.log(n + '.');
		set.forEach((dir, dom) => console.log(
			'  ' + dom.toString() +
			' > ' + dir.toString()));
	});
}