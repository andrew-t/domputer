const Direction = require('../direction'),
	Vector = require('../vector');

const expect = require('chai').expect;

describe('direction', () => {
	it('should go back and forth', () => {
		const a = new Vector(
				Math.random() - 0.5,
				Math.random() - 0.5).normalise(),
			d = a.direction,
			b = d.asVector();
		// console.log(a)
		// console.log(d)
		// console.log(b)
		expect(Math.abs(a.x - b.x)).to.be.lessThan(0.05);
		expect(Math.abs(a.y - b.y)).to.be.lessThan(0.05);
	});
});