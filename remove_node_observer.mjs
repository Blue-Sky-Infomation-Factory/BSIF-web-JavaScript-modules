function observe(node, callback, once = true) {
	if (arguments.length < 2) throw new TypeError(`Failed to execute 'observe': 2 arguments required, but only ${arguments} present.`);
	if (!(node instanceof Node)) throw new TypeError("Failed to execute 'observe': Argument 'node' is not type of Node.");
	if (node instanceof DocumentFragment) throw new TypeError("Failed to execute 'observe': Argument 'node' cannot be a document fragment.");
	if (typeof callback != "function") throw new TypeError("Failed to execute 'observe': Argument 'callback' is not a function.");
	if (typeof once != "boolean") throw new TypeError("Failed to execute 'observe': Argument 'once' is not a boolean.");
	checkNodes.set(node, { once, callback, bypass: !document.contains(node) });
}
function unobserve(node) {
	if (arguments.length < 1) throw new TypeError("Failed to execute 'unobserve': 1 arguments required, but only 0 present.");
	if (!(node instanceof Node)) throw new TypeError("Failed to execute 'unobserve': Argument 'node' is not type of Node.");
	checkNodes.delete(node);
}
function getObservingNodes() { return checkNodes.keys() }
const checkNodes = new Map,
	observer = new MutationObserver(() => {
		for (const [node, data] of checkNodes.entries()) {
			if (document.contains(node)) {
				if (data.bypass) data.bypass = false;
			} else {
				if (data.bypass) continue;
				if (data.once) { checkNodes.delete(node) } else data.bypass = true;
				try { data.callback.call(null, node) } catch (e) { console.error(e) }
			}
		}
	});
observer.observe(document, { childList: true, subtree: true });
export { observe, unobserve, getObservingNodes }