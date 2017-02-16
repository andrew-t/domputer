document.addEventListener('DOMContentLoaded', e => {
	const elements = document
			.querySelectorAll('.domputer-player');
	for (let i = 0; i < elements.length; ++i)
		initDominoes(elements[i],
			elements[i].getAttribute('data-dominoes'));

	function initDominoes(container, name) {
		data = boards[name];
		const canvas = document.createElement('canvas');
		canvas.setAttribute('width', data.width);
		canvas.setAttribute('height', data.height);
		canvas.style.width = data.width + 'px';
		canvas.style.height = data.height + 'px';
		container.appendChild(canvas);
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
