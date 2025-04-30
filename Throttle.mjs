class VerticalSyncThrottle {
	data = null;

	#callback = null;
	get callback() { return this.#callback }
	set callback(value) {
		if (typeof value != "function") throw new TypeError("Callback must be a function.");
		this.#callback = value;
	}

	#pending = false;
	#caller() {
		this.#pending = false;
		this.#callback(this);
	}
	#boundCaller = this.#caller.bind(this);

	trigger() {
		if (this.#pending) return;
		this.#pending = true;
		requestAnimationFrame(this.#boundCaller);
	}

	constructor(callback) { this.callback = callback }
}

export { VerticalSyncThrottle };