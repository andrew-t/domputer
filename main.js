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
			data.inputs.map(region),
			data.outputs.map(region),
			data.tests.map(t => ({
				inputs: text2bools(t.in),
				outputs: text2bools(t.out)
			})));
		panel.drawFrame(0);
	}

	function region(data) {
		return new Panel.Region(
			new Vector(data.x, data.y),
			new Direction(data.theta / 180 * Math.PI));
	}

	function text2bools(text) {
		const key = { '0': false, '1': true, '?': null }
		return text.split('').map(t => key[t]);
	}
});
