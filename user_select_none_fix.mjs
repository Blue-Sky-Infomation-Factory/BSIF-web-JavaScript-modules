const BYPASS = Symbol("bypass");

/**
 * @param {Event} event
 */
function setEventBypass(event) {
	if (!(event instanceof Event))
		throw new TypeError("Argument 'event' is not instance of Event.");
	event[BYPASS] = true;
}

/**
 * @param {Element} element
 */
function isUserSelectable(element) {
	while (element) {
		const { userSelect } = getComputedStyle(element);
		if (userSelect != "auto")
			return userSelect != "none";
		element = element.parentElement;
	}
	return true;
}

class UserSelectNoneFixController {
	#node;
	get node() { return this.#node }

	/**
	 * @param {Event} event
	 */
	#handler(event) {
		if (event[BYPASS]) return;
		event[BYPASS] = true;
		if (event.defaultPrevented || !(
			event instanceof PointerEvent && event.isTrusted
			&& event.pointerType && event.button === 0
		)) return;
		const { target } = event;
		if (!(target instanceof Element)) return;
		const selection = document.getSelection();
		if (!selection || selection.isCollapsed || isUserSelectable(target)) return;
		selection.removeAllRanges();
	}
	#handlerFunction = this.#handler.bind(this);

	#enabled;
	get enabled() { return this.#enabled }
	set enabled(value) {
		const node = this.#node;
		if (!node) throw new Error("Instance has been destroyed.")
		value = Boolean(value);
		if (value == this.#enabled) return;
		if (value) {
			node.addEventListener("pointerdown", this.#handlerFunction);
		} else {
			node.removeEventListener("pointerdown", this.#handlerFunction);
		}
		this.#enabled = value;
	}
	destroy() {
		const node = this.#node;
		if (!node) return;
		if (this.#enabled) {
			node.removeEventListener("pointerdown", this.#handlerFunction);
			this.#enabled = false;
		}
		this.#node = this.#handlerFunction = null;
	}
	/**
	 * @param {Element | Document} node
	 */
	constructor(node, enabled = true) {
		if (!(node instanceof Element || node instanceof Document))
			throw new TypeError("Argument 'node' is not instance of Element or Document.");
		this.#node = node;
		if (this.#enabled = Boolean(enabled))
			node.addEventListener("pointerdown", this.#handlerFunction);
	}
}

const defaultDocumentController = new UserSelectNoneFixController(document);

export default UserSelectNoneFixController;
export { UserSelectNoneFixController, defaultDocumentController, setEventBypass };