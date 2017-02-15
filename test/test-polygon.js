const Polygon = require('../polygon'),
	Vector = require('../vector');

const expect = require('chai').expect;

describe('polygon', () => {
	
	testIntersect(
		'2 inside 1',
		[ 1, 1,  1, 5,  5, 5,  5, 1 ],
		[ 2, 2,  2, 4,  4, 4,  4, 2 ],
		true);
	
	testIntersect(
		'1 inside 2',
		[ 2, 2,  2, 4,  4, 4,  4, 2 ],
		[ 1, 1,  1, 5,  5, 5,  5, 1 ],
		true);
	
	/*
	        ___
	        | |
	      --+-+--
	      | | | |
	      --+-+--
	        |_|
	*/

	testIntersect(
		'1 crosses 2',
		[ 1, 4,  1, 5,  9, 5,  9, 4 ],
		[ 4, 1,  5, 1,  5, 9,  4, 9 ],
		true);

	testIntersect(
		'2 beside 1',
		[ 1, 1,  1, 5,  5, 5,  5, 1 ],
		[ 6, 2,  6, 4,  9, 4,  9, 2 ],
		false);

	testIntersect(
		'1 beside 2',
		[ 6, 2,  6, 4,  9, 4,  9, 2 ],
		[ 1, 1,  1, 5,  5, 5,  5, 1 ],
		false);

	function testIntersect(name, vals1, vals2, result) {
		it('should ' + (result ? '': 'not ') +
			'intersect when ' + name,
				() => expect(
			p2p(vals1).intersects(p2p(vals2)))
				.to.be.equal(result));
	}

	testContain(
		4, 1,
		[ 1, 4,  1, 5,  9, 5,  9, 4 ],
		false);

	testContain(
		1, 4,
		[ 4, 1,  5, 1,  5, 9,  4, 9 ],
		false);

	function testContain(x, y, vals, result) {
		it('should ' + (result ? '': 'not ') +
			'contain ' + x + ', ' + y,
				() => expect(
					p2p(vals)
						.contains(new Vector(x, y)))
					.to.be.equal(result));
	}

	function p2p(vals) {
		const points = [];
		while (vals.length)
			points.push(new Vector(vals.shift(), vals.shift()));
		return new Polygon(points);
	}
});