if (typeof require !== 'undefined') {
	LineSegment = require('./line-segment');
	Vector = require('./vector');
}

class Polygon {
	constructor(points) {
		if (!points.length)
			throw new Error('No points');
		for (let i = 0; i < points.length; ++i)
			if (!(points[i] instanceof Vector))
				throw new Error('Not vectors');
		this.points = points;
		this.edges = points.map((p1, i) =>
			new LineSegment(
				p1,
				points[(i + 1) % points.length]));
		this.n = points.length;
	}

	contains(point) {
		// Create a line that definitely ends outside the polygon:
		const maxX = Math.max(...this.points.map(p => p.x));
		if (maxX < point.x)
			return false;
		const testLine = new LineSegment(point,
			new Vector(maxX * 2, point.y));
		// If it crosses an odd number of edges, it starts inside:
		let intersections = 0,
			onEdge = false;
		this.edges.forEach(edge => {
			const result = edge.crosses(testLine);
			if (result == LineSegment.Improper)
				onEdge = true;
			else if (result)
				++intersections;
		});
		return onEdge || !!(intersections & 1);
	}

	intersects(that) {
		// Check if one polygon is actually within the other:
		if (this.contains(that.points[0]) ||
			that.contains(this.points[0]))
			return true;
		// Check if any edges cross:
		for (let i = 0; i < this.n; ++i)
			for (let j = 0; j < that.n; ++j)
				if (this.edges[i].crosses(that.edges[j]))
					return true;
		return false;
	}

	draw(ctx) {
		const p = this.points[this.n - 1];
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		this.points.forEach(p => ctx.lineTo(p.x, p.y));
		ctx.stroke();
		ctx.fill();
	}
}

if (typeof module !== 'undefined') module.exports = Polygon;
