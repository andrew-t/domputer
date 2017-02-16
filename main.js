document.addEventListener('DOMContentLoaded', e => {
	const elements = document
			.querySelectorAll('.domputer-player');
	for (let i = 0; i < elements.length; ++i)
		initDominoes(elements[i],
			elements[i].getAttribute('data-dominoes'));

	function initDominoes(container, name) {
		data = boards[name];

		const scroller = document.createElement('div'),
			canvas = document.createElement('canvas');
		scroller.classList.add('canvas-scroller');
		canvas.setAttribute('width', data.width);
		canvas.setAttribute('height', data.height);
		canvas.style.width = data.width + 'px';
		canvas.style.height = data.height + 'px';
		container.appendChild(scroller);
		scroller.appendChild(canvas);

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

		const controls = document.createElement('div');
		controls.classList.add('controls');
		container.appendChild(controls);

		addButton('play', e => panel.play());
		addButton('reset', e => {
			if (confirm('Are you sure?'))
				panel.reset();
		});
		addButton('reveal', e => {
			if (confirm('Are you sure?')) {
				panel.reset();
				data.answer.forEach(domino =>
					panel.dominoes.add(new Domino(
						new Vector(domino.x, domino.y),
						new Direction(domino.theta))));
				panel.rebuildChain();
				panel.drawFrame(0);
			}
		});
		addButton('expand', e =>
			container.classList.toggle('expanded'));

		const testResults = document.createElement('div');
		testResults.classList.add('test-results');
		panel.on('update-test-results', results =>
			testResults.innerHTML =
				results.reduce((p, i) => p + +i, 0) +
				' out of ' + results.length +
				' scenarios working');
		controls.appendChild(testResults);

		function addButton(className, callback) {
			const button = document.createElement('button');
			button.classList.add(className);
			button.addEventListener('click', e => {
				callback(e);
				e.preventDefault();
			});
			controls.appendChild(button);
		}
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
