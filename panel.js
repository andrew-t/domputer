if (typeof require !== 'undefined') {
	Domino = require('./domino');
	Polygon = require('./polygon');
	eventise = require('./events');
}

class Panel {
	constructor(canvas, trigger, inputs, outputs, tests) {
		this.canvas = canvas;
		this.trigger = trigger;
		this.inputs = inputs;
		this.outputs = outputs;
		this.tests = tests;
		this.inputStates = inputs.map(i => true);
		this.ctx = canvas.getContext('2d');
		this.dominoes = new Set([]);

		console.log(this.ctx);

		this.currentDragDomino = null;
		this.dragStart = null;
		this.dragging = false;
		this.playing = false;

		this.listen('mousedown', this.startDrag.bind(this));
		this.listen('mousemove', this.continueDrag.bind(this));
		this.listen('mouseout', this.endDrag.bind(this));
		this.listen('mouseup', this.endDrag.bind(this));
		setInterval(() => this.frameAdvance(),
			1000 / Panel.framerate);
	}

	listen(event, cb) {
		this.canvas.addEventListener(event, e => {
			cb(e, this._mouseVector(e));
			e.preventDefault();
		});
	}

	createDragDomino(location, direction) {
		const domino = new Domino(location, direction);

		if (this.wouldObstructAny(domino) ||
			this.trigger.polygon.contains(location))
			return null;
		for (let i = 0; i < this.inputs.length; ++i)
			if (this.inputs[i].polygon.contains(location))
				return null;
		for (let i = 0; i < this.outputs.length; ++i)
			if (this.outputs[i].polygon.contains(location))
				return null;

		this.currentDragDomino = domino;
		this.addDomino(domino);
		this.fallSequence = null;
		this.chain = null;
		return domino;
	}

	wouldObstructAny(domino) {
		let result = false;
		this.dominoes.forEach(candidate => {
			if (domino != candidate &&
				candidate.wouldObstruct(domino))
					result = true;
		});
		return result;
	}

	startDrag(e, mouse) {
		if (this.playing) {
			this.stop();
			return;
		}
		if (this.trigger.polygon.contains(mouse)) {
			this.play();
			return;
		}
		for (let i = 0; i < this.inputs.length; ++i) {
			const input = this.inputs[i];
			if (input.polygon.contains(mouse)) {
				this.inputStates[i] =! this.inputStates[i];
				this.rebuildChain();
				this.drawFrame(0);
				return;
			}
		}

		let clicked = null;
		this.dominoes.forEach(domino => {
			if (domino.location.minus(mouse).length <
					Panel.clickRadius)
				clicked = domino;
		});
		if (!clicked) {
			this.dragging = true;
			this.dragStart = mouse;
			this.createDragDomino(mouse, Direction.zero);
		} else
			this.removeDomino(clicked);
		if (!this.playing)
			this.drawFrame(0);
	}

	continueDrag(e, mouse) {
		if (!this.dragging)
			return;
		const motion = (this.currentDragDomino
				? this.currentDragDomino.location
				: this.dragStart).minus(mouse),
			direction = motion.direction;
		if (this.currentDragDomino != null ||
			this.createDragDomino(mouse, motion)) {
			// Rotate the current domino if it won't hit anything:
			const oldCurrentDragDirection =
					this.currentDragDomino.direction;
			this.currentDragDomino.direction = direction;
			if (this.wouldObstructAny(this.currentDragDomino))
				this.currentDragDomino.direction =
					oldCurrentDragDirection;
			// Try to add a new domino if we've moved far enough.
			if (motion.length >= Panel.dominoSpacing)
				this.createDragDomino(mouse, direction);
		}
		this.drawFrame(0);
		this.chain.markDirty();
	}

	endDrag() {
		if (this.dragging) {
			this.currentDragDomino = null;
			this.dragging = false;
			this.drawFrame(0);
		}
		this.rebuildChain();
	}

	_mouseVector(e) {
		return new Vector(e.offsetX, e.offsetY);
	}

	getResultForInputs(inputStates) {
		const triggerDominoes = this.trigger.dominoes,
			chain = new Chain(
				triggerDominoes[0],
				this.trigger.direction.theta),
			outputStates = this.outputs.map(o => false);
		triggerDominoes.slice(1).forEach(domino =>
			chain.add(domino));

		for (let i = 0; i < this.inputs.length; ++i)
			if (inputStates[i])
				include(this.inputs[i]);
		this.outputs.forEach(include);2

		this.dominoes.forEach(domino =>
			chain.add(domino));

		this.fallSequence = chain.recalculate();

		return { chain, outputStates };

		function include(region) {
			region.dominoes.forEach(
				domino => chain.add(domino));
		}
	}

	rebuildChain() {
		this.testResults = this.tests.map(test => {
			const actual = this.getResultForInputs(
					test.inputStates),
				expected = test.outputStates;
			for (let i = 0; i < actual.length; ++i)
				if (expected[i] != '?' &&
					expected[i] != actual[i])
						return false;
			return true;
		});

		this.chain = this
			.getResultForInputs(this.inputStates)
			.chain;

		this.canvas.setAttribute('data-test-results',
			stringifyDominoes(this.testResults.join(', ')));
		this.canvas.setAttribute('data-chain-dominoes',
			stringifyDominoes(this.chain.dominoes));
		this.canvas.setAttribute('data-user-dominoes',
			stringifyDominoes(this.dominoes));

		function stringifyDominoes(dominoes) {
			return JSON.stringify(dominoes.map(d => ({
				x: d.location.x,
				y: d.location.y,
				theta: d.direction.theta
			})));
		}
	}

	drawFrame(n) {
		console.log('drawing frame ' + n)
		this.blank();
		if (!this.fallSequence)
			this.rebuildChain();
		const fs = this.fallSequence;

		const fallen = new Set();
		back(frame => frame.forEach(domino =>
			fallen.add(domino)));

		this.ctx.strokeStyle = '1px solid #00f';
		this.ctx.fillStyle = '#fdd';
		this.trigger.polygon.draw(this.ctx);

		this.ctx.strokeStyle = '1px solid #00f';
		for (let i = 0; i < this.inputs.length; ++i) {
			this.ctx.fillStyle = this.inputStates[i]
				? '#ffe'
				: '#880';
			this.inputs[i].polygon.draw(this.ctx);
		}

		let test = null;
		this.tests.forEach(t => {
			if (t.inputs.join(',') ==
					this.inputStates.join(','))
				test = t;
		});
		for (let i = 0; i < this.outputs.length; ++i) {
			this.ctx.strokeStyle = '1px solid #00f';
			this.ctx.fillStyle = test
				? test.outputs[i]
					? '#dfd'
					: '#fdd'
				: '#888';
			this.outputs[i].polygon.draw(this.ctx);
		}

		this.ctx.strokeStyle = '1px solid black';
		this.ctx.fillStyle = '#ddd';
		back(frame => frame.forEach(
			(direction, domino) => {
				this.drawFallenDomino(domino, direction);
				fallen.add(domino);
			}));

		this.ctx.strokeStyle = '1px solid black';
		this.ctx.fillStyle = '#fff';
		this.chain.dominoes.forEach(domino => {
			if (!fallen.has(domino))
				this.drawUprightDomino(domino);
		});

		function back(cb) {
			for (let f = n; f >= 0; --f) {
				const frame = fs[f - 1];
				if (frame)
					cb(frame);
			}
		}
	}

	addDomino(domino) {
		this.dominoes.add(domino);
		this.rebuildChain();
	}

	removeDomino(domino) {
		this.dominoes.delete(domino);
		this.rebuildChain();
	}

	drawUprightDomino(domino) {
		domino.standingFootprint.draw(this.ctx);
	}

	drawFallenDomino(domino, direction) {
		domino.getFallenFootprint(direction)
			.draw(this.ctx);
	}

	blank() {
		this.ctx.fillStyle = '#fc8';
		this.ctx.fillRect(-10, -10, this.canvas.width + 10, this.canvas.height + 10);
	}

	play() {
		this.endDrag();
		this.playing = true;
		this.paused = false;
		this.frame = 0;
	}

	pause() {
		this.paused = true;
	}

	stop() {
		this.playing = false;
		this.paused = false;
		this.frame = 0;
		this.drawFrame(0);
	}

	frameAdvance() {
		if (this.playing && !this.paused) {
			if (!this.fallSequence)
				this.rebuildChain();
			this.drawFrame(this.frame++);
			if (this.frame > this.fallSequence.length)
				this.pause();
		}
	}
}

Panel.Region = class {
	constructor(location, direction) {
		this.location = location;
		this.direction = direction;
	}

	get polygon() {
		const hs = Panel.regionSize * Panel.dominoSpacing / 2,
			v = this.direction.asVector().times(hs),
			u = v.perpendicular();
		return new Polygon([
			this.location.minus(u).minus(v),
			this.location.plus(u).minus(v),
			this.location.plus(u).plus(v),
			this.location.minus(u).plus(v)
		]);
	}
	
	get dominoes() {
		const dominoes = [],
			s = this.direction
					.asVector()
					.times(Panel.dominoSpacing);
		for (let i = Panel.regionSize - 1; i >= 0; --i)
			dominoes.push(new Domino(
				this.location.minus(s.times(
					i - (Panel.regionSize / 2) + 0.5)),
				this.direction));
		return dominoes;
	}
};

eventise(Panel);

Panel.clickRadius = 10;
Panel.dominoSpacing = Domino.height / 2;
Panel.regionSize = 5;
Panel.framerate = 8;
