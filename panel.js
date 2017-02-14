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

		canvas.addEventListener('mousedown',
			e => this.startDrag(e));
		canvas.addEventListener('mousemove',
			e => this.continueDrag(e));
		canvas.addEventListener('mouseout',
			e => this.endDrag(e));
		canvas.addEventListener('mouseup',
			e => this.endDrag(e));
		setInterval(() => this.frameAdvance(),
			1000 / Panel.framerate);
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

	startDrag(e) {
		if (this.playing)
			this.stop();
		else {
			const mouse = this._mouseVector(e);
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
		e.preventDefault();
	}

	continueDrag(e) {
		if (!this.dragging)
			return;
		const mouse = this._mouseVector(e),
			motion = (this.currentDragDomino
				? this.currentDragDomino.location
				: this.dragStart).minus(mouse),
			direction = motion.direction.opposite();
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
		e.preventDefault();
		this.drawFrame(0);
		this.chain.markDirty();
	}

	endDrag(e) {
		if (this.dragging) {
			this.currentDragDomino = null;
			this.dragging = false;
			this.drawFrame(0);
		}
		if (e)
			e.preventDefault();
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
		this.dominoes.forEach(domino => {
			let fallen = false;
			this.fallSequence.slice(0, n)
				.forEach(frame => {
					if (frame.has(domino))
						fallen = frame.get(domino);
				});
			if (fallen)
				this.drawFallenDomino(domino, fallen);
			else
				this.drawUprightDomino(domino);
		});
	}

	addDomino(domino) {
		this.dominoes.add(domino);
	}

	removeDomino(domino) {
		if (domino === this.trigger)
			throw new Error('Cannot remove trigger');
		this.dominoes.delete(domino);
	}

	drawUprightDomino(domino) {
		this.ctx.save();
		this.ctx.translate(
			domino.location.x,
			domino.location.y);
		this.ctx.rotate(
			domino.direction.theta);
		this.ctx.strokeStyle = '1px solid black';
		this.ctx.strokeRect(
			-Domino.thickness / 2,
			-Domino.width / 2,
			Domino.thickness,
			Domino.width);
		this.ctx.restore();
	}

	drawFallenDomino(domino, direction) {
		this.ctx.save();
		this.ctx.translate(
			domino.location.x,
			domino.location.y);
		this.ctx.rotate(direction.theta);
		this.ctx.strokeStyle = '1px solid black';
		this.ctx.strokeRect(
			-Domino.thickness / 2,
			-Domino.width / 2,
			-Domino.height,
			Domino.width);
		this.ctx.restore();
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
Panel.framerate = 1;
