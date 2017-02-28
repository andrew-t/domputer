const Domino = require('../domino'),
	Chain = require('../chain'),
	Vector = require('../xy/vector');

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

	let nextId = 1;

	dontHit([
		{ x: 15, y: 200, theta: 0 }, // *
		{ x: 35, y: 200, theta: 0 },
		{ x: 55, y: 200, theta: 0 },
		{ x: 75, y: 200, theta: 0 },
		{ x: 95, y: 200, theta: 0 },
		{ x: 540, y: 212, theta: -1.5707963267948966 } // *
	], 0, 5);

	dontHit([
		{ x: 15, y: 200, theta: 0 },
		{ x: 35, y: 200, theta: 0 },
		{ x: 55, y: 200, theta: 0 },
		{ x: 75, y: 200, theta: 0 },
		{ x: 95, y: 200, theta: 0 },
		{ x: 112, y: 198, theta: 2.6779450445889 },
		{ x: 130, y: 189, theta: 2.4592760987150 },
		{ x: 146, y: 176, theta: 2.29377568019638 },
		{ x: 161, y: 159, theta: 2.073639537722757 },
		{ x: 172, y: 139, theta: 1.89254688119153 },
		{ x: 179, y: 118, theta: 1.862253121272763 }, // *
		{ x: 185, y: 98, theta: 1.794272927935529 },
		{ x: 190, y: 76, theta: 2.034443935795702 },
		{ x: 481, y: 118, theta: 1.2793395323170296 } // *
	], 10, 13);

	function dontHit(dominoes, trigger, target) {
		describe('should work with example ' + nextId++,
			() => {
				const example = dominoes.map(d =>
					new Domino(new Vector(d.x, d.y), d.theta));

				it('should not break the example', () => {
					const chain = new Chain(
						example[trigger], example[trigger].direction);
					example.slice(1)
						.forEach(d => chain.add(d));
					const fall = chain.recalculate();
					// console.log(fall);
					fall.forEach(frame =>
						expect(frame.has(example[target])).not.to.be.ok);
				});

				it('should not topple it from 0', () =>
					expect(example[trigger].wouldHit(
						example[target], example[trigger].direction))
						.not.to.be.ok);

				const fall = example[trigger]
						.getFallenFootprint(example[trigger].direction),
					stand = example[target].standingFootprint;
				// console.log(stand.toString(), fall.points[0].toString())

				it('should not intersect it with 0', () =>
					expect(fall.intersects(stand)).not.to.be.ok);

				it('should not contain it in 0', () =>
					expect(fall.contains(stand.points[0])).not.to.be.ok);
				it('should not contain 0 in it', () =>
					expect(stand.contains(fall.points[0])).not.to.be.ok);
				it('should not intersect edges of 0 and it', () =>
					stand.edges.forEach(s =>
						fall.edges.forEach(f =>
							expect(s.crosses(f)).not.to.be.ok)));
			});
	}
});

function printFall(fall) {
	fall.forEach((set, n) => {
		console.log(n + '.');
		set.forEach((dir, dom) => console.log(
			'  ' + dom.toString() +
			' > ' + dir.toString()));
	});
}
