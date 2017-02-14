class Panel {
	constructor(canvas, trigger) {
		this.canvas = canvas;
		this.trigger = trigger;
		this.ctx = canvas.getContext('2d');
		this.dominoes = new Set([ trigger ]);

		console.log(this.ctx);

		this.currentDragDomino = null;

		canvas.addEventListener('mousedown',
			e => this.startDrag(e));
		canvas.addEventListener('mousemove',
			e => this.continueDrag(e));
		canvas.addEventListener('mouseout',
			e => this.endDrag(e));
		canvas.addEventListener('mouseup',
			e => this.endDrag(e));
	}

	createDragDomino(location, direction) {
		this.currentDragDomino = new Domino(
			location, direction);
		this.addDomino(this.currentDragDomino);
	}

	startDrag(e) {
		const mouse = this._mouseVector(e);
		let clicked = null;
		this.dominoes.forEach(domino => {
			if (domino.location.minus(mouse).length <
					Panel.clickRadius)
				clicked = domino;
		});
		if (!clicked)
			this.createDragDomino(mouse, Direction.zero);
		else if (clicked == this.trigger)
			this.play();
		else
			this.removeDomino(clicked);
		e.preventDefault();
		this.drawFrame(0);
	}

	continueDrag(e) {
		if (!this.currentDragDomino)
			return;
		const mouse = this._mouseVector(e),
			motion = this.currentDragDomino
				.location.minus(mouse),
			direction = motion.direction.opposite();
		this.currentDragDomino.direction = direction;
		if (motion.length >= Panel.clickRadius)
			this.createDragDomino(mouse, direction);
		e.preventDefault();
		this.drawFrame(0);
		console.log(this.currentDragDomino.toString())
	}

	endDrag(e) {
		this.currentDragDomino = null;
		e.preventDefault();
		this.drawFrame(0);
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
			Domino.thickness / 2,
			-Domino.width / 2,
			Domino.height,
			Domino.width);
		this.ctx.restore();
	}

	blank() {
		this.ctx.fillStyle = '#fc8';
		this.ctx.fillRect(-10, -10, this.canvas.width + 10, this.canvas.height + 10);
	}
}

Panel.clickRadius = 10;
Panel.dominoSpacing = Domino.height / 2;
