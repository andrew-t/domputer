class Panel {
	constructor(canvas, trigger) {
		this.canvas = canvas;
		this.trigger = trigger;
		this.ctx = canvas.getContext('2d');
		this.dominoes = new Set([ trigger ]);

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
		if (!this.wouldObstructAny(domino)) {
			this.currentDragDomino = domino;
			this.addDomino(domino);
			this.fallSequence = null;
			this.chain = null;
			return domino;
		}
		else return null;
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
		if (this.playing)
			this.stop();
		else {
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
			} else if (clicked == this.trigger)
				this.play();
			else
				this.removeDomino(clicked);
			if (!this.playing)
				this.drawFrame(0);
		}
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

	rebuildChain() {
		this.chain = new Chain(
			this.trigger,
			this.trigger.direction.theta);
		this.dominoes.forEach(domino => {
			if (domino != this.trigger)
				this.chain.add(domino);
		});
		this.fallSequence = this.chain.recalculate();
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

		this.ctx.strokeStyle = '1px solid black';
		this.ctx.fillStyle = '#ddd';
		back(frame => frame.forEach(
			(direction, domino) => {
				this.drawFallenDomino(domino, direction);
				fallen.add(domino);
			}));

		this.ctx.strokeStyle = '1px solid black';
		this.ctx.fillStyle = '#fff';
		this.dominoes.forEach(domino => {
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
		if (domino === this.trigger)
			throw new Error('Cannot remove trigger');
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

Panel.clickRadius = 10;
Panel.dominoSpacing = Domino.height / 2;
Panel.framerate = 5;
