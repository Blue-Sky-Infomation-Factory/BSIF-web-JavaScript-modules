class Notifier {
	#handlers = [];
	addHandler(handler) {
		if (typeof handler != "function") throw new TypeError("Failed to execute 'addHandler' on 'Notifier': Arguments 'handler' is not a function.");
		if (this.#handlers.includes(handler)) return;
		this.#handlers.push(handler);
	}
	removeHandler(handler) {
		if (typeof handler != "function") throw new TypeError("Failed to execute 'removeHandler' on 'Notifier': Arguments 'handler' is not a function.");
		const index = this.#handlers.indexOf(handler);
		if (index != -1) this.#handlers.splice(index, 1);
	}
	removeAllHandlers() { this.#handlers = [] }
	trigger() { for (const item of this.#handlers) try { item(...arguments) } catch (e) { console.error(e) } }
}
export default Notifier;
export { Notifier };