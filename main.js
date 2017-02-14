document.addEventListener('DOMContentLoaded', e => {
	const canvases = document.getElementsByTagName('canvas');
	for (let i = 0; i < canvases.length; ++i) {
		const canvas = canvases[i],
			data = canvas.getAttribute('data-dominoes');
		if (data)
			initDominoes(canvas, data);
	}

	function initDominoes(canvas, data) {
		// I know, I know, but I'm writing the HTML:
		data = eval('(' + data + ')');
		const trigger = new Domino(new Vector(
					data.trigger.x, data.trigger.y),
				data.trigger.theta / 180 * Math.PI),
			panel = new Panel(canvas, trigger);
		panel.addDomino(new Domino(
			trigger.location
				.plus(trigger.direction
					.asVector()
					.times(10)),
			trigger.direction.theta + 0.1));
		panel.drawFrame(0);
	}
});
