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
		const trigger = new Panel.Region(
				new Vector(data.trigger.x, data.trigger.y),
				new Direction(data.trigger.theta / 180 * Math.PI)),
			panel = new Panel(canvas, trigger);
		panel.drawFrame(0);
	}
});
