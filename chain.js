if (typeof require !== 'undefined') {
	Vector = require('./vector');
	Direction = require('./direction');
	Domino = require('./domino');
}

class Chain {
	constructor(trigger, triggerTheta) {
		this.trigger = trigger;
		this.triggerDirection = new Direction(triggerTheta);
		this.dominoes = [ trigger ];
		this.fallSequence = null;
	}

	add(domino) {
		if (!(domino instanceof Domino))
			throw new Error('Set up a non-domino')
		this.dominoes.push(domino);
	}

	remove(domino) {
		if (domino == trigger)
			throw new Error('Cannot remove trigger');
		this.dominoes.splice(x.indexOf(domino), 1);
	}

	markDirty() {
		this.fallSequence = null;
	}

	isDirty() {
		return this.fallSequence == null;
	}

	recalculate() {
		let fallen = new Set([ this.trigger ]),
			thisFrame = new Map();
		thisFrame.set(this.trigger, this.triggerDirection);
		this.fallSequence = [];
		while (thisFrame.size > 0) {
			this.fallSequence.push(thisFrame);
			let lastFrame = thisFrame;
			thisFrame = new Map();
			lastFrame.forEach((fallDirection, faller) =>
				this.dominoes.forEach(target => {
					if (fallen.has(target)) // Yoda I am
						return;
					let topple = faller.wouldHit(target, fallDirection);
					if (topple) {
						thisFrame.set(target, topple);
						fallen.add(target);
					}
				}));
		}
		return this.fallSequence;
	}
}

if (typeof module !== 'undefined') module.exports = Chain;
