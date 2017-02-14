const Direction = require('../direction'),
	Vector = require('../vector');

const expect = require('chai').expect;

describe('vector', () => {
	it('should add and multiply', () => {
		const a = new Vector(1.4, 2.7);
		expect(a.plus(a).equals(a.times(2))).to.be.ok;
	});
});