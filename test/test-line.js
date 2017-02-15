const LineSegment = require('../line-segment'),
	Vector = require('../vector');

const expect = require('chai').expect;

describe('line segment', () => {
	
	testCross(
		1, 1, 10, 10,
		1, 10, 10, 1,
		LineSegment.Proper);

	testCross(
		1, 1, 10, 10,
		1, 2, 10, 11,
		false);

	testCross(
		1, 1, 10, 10,
		5, 5, 5, 10,
		LineSegment.Improper);

	testCross(
		1, 4, 19, 4,
		4, 1, 5, 1,
		false);
	testCross(
		1, 4, 19, 4,
		5, 1, 5, 9,
		LineSegment.Proper);
	testCross(
		1, 4, 19, 4,
		5, 9, 4, 9,
		false);
	testCross(
		1, 4, 19, 4,
		4, 9, 4, 1,
		LineSegment.Proper);

	testCross(
		4, 1, 19, 1,
		1, 4, 1, 5,
		false);
	testCross(
		1, 4, 1, 5,
		4, 1, 19, 1,
		false);
	testCross(
		4, 1, 19, 1,
		1, 5, 9, 5,
		false);
	testCross(
		4, 1, 18, 1,
		9, 5, 9, 4,
		false);
	testCross(
		9, 5, 9, 4,
		4, 1, 18, 1,
		false);
	testCross(
		4, 1, 19, 1,
		9, 4, 1, 4,
		false);

		[ 1, 4,  1, 5,  9, 5,  9, 4 ],
		[ 4, 1,  5, 1,  5, 9,  4, 9 ]

	function testCross(
			x11, y11, x12, y12,
			x21, y21, x22, y22,
			result) {
		it('should ' + (result ? '': 'not ') +
			'cross (' +
				x11 + ', ' + y11 + ') - (' +
				x12 + ', ' + y12 + ') and (' +
				x21 + ', ' + y21 + ') - (' +
				x22 + ', ' + y22 + ')',
				() => {
			expect(
				new LineSegment(
					new Vector(x11, y11),
					new Vector(x12, y12))
				.crosses(
					new LineSegment(
						new Vector(x21, y21),
						new Vector(x22, y22)
					)))
				.to.be.equal(result)
		});
	}
});