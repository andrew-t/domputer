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
		const panel = new Panel(
			canvas,
			region(data.trigger),
			data.inputs.map(region));
		panel.drawFrame(0);
	}

	function region(data) {
		return new Panel.Region(
			new Vector(data.x, data.y),
			new Direction(data.theta / 180 * Math.PI));
	}
});
