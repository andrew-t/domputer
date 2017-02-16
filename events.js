function eventise(targetClass) {
	targetClass.prototype.addEventListener =
	targetClass.prototype.on =
		function on(event, callback) {
			if (!this._eventListeners)
				this._eventListeners = {};
			if (!this._eventListeners[event])
				this._eventListeners[event] = [];
			this._eventListeners[event]
				.push(callback);
		};

	targetClass.prototype.removeEventListener =
	targetClass.prototype.off =
		function off(event, callback) {
			if (!this._eventListeners ||
				!this._eventListeners[event])
				return;
			this._eventListeners[event].splice(
				this._eventListeners[event]
					.indexOf(callback),
				1);
		};

	targetClass.prototype._triggerEvent =
		function _triggerEvent(event, ...args) {
			if (!this._eventListeners ||
				!this._eventListeners[event])
				return;
			this._eventListeners[event].forEach(
				callback => callback(...args));
		};
}

if (typeof module !== 'undefined') module.exports = eventise;
