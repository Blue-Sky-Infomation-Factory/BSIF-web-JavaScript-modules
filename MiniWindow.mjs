import { parse, parseAndGetNodes, EVENT_LISTENERS } from "./array_HTML.mjs";

const { layer, windowBody, windowTitle, windowQueue, windowClose, windowContent, contentFrame, subLayer, subTitle, subFrame, subBody } = parseAndGetNodes([
	["div", [
		["style", [
			"#mini-window-layer,#mini-window-sub-layer{top:0;bottom:0;left:0;right:0;z-index:1073741824;display:none}",
			"#mini-window-layer{position:fixed;background-color:rgba(0,0,0,0.7)}",
			"#mini-window-sub-layer{position:absolute}",
			"#mini-window,#mini-window-sub{box-sizing:border-box;place-self:center;min-width:16rem;min-height:8rem;max-width:80%;max-height:80%;overflow:hidden;border-radius:0.75rem;padding:0.75rem;display:grid;grid-template-rows:1.25rem auto 1fr;background-color:var(--mini-window-background-color);color:var(--mini-window-text-color);font-size:0.9375rem;user-select:text}",
			"#mini-window-layer,#mini-window,#mini-window-sub{animation-duration:0.5s;animation-fill-mode:forwards}",
			"#mini-window{--mini-window-background-color:#FFFFFF;--mini-window-text-color:#404040;--mini-window-interactive-color:#CCCCCC;--mini-window-interactive-hover-color:#7FBFFF;--mini-window-interactive-active-color:#0080FF;--mini-window-interactive-text-color:#000000;--mini-window-interactive-hover-text-color:#000000;--mini-window-interactive-active-text-color:#FFFFFF}",
			"@keyframes mini-window-fade-in{from{opacity:0}}",
			"@keyframes mini-window-fade-out{to{opacity:0}}",
			"#mini-window-layer.in,#mini-window.in{animation-name:mini-window-fade-in}",
			"#mini-window-layer.out,#mini-window.out{animation-name:mini-window-fade-out}",
			"@keyframes mini-window-sub-window-in{from{opacity:0;transform:translateY(-1rem)}}",
			"#mini-window-sub{box-shadow:#000000 0 0 0.5rem}",
			"#mini-window-sub.in{animation:mini-window-sub-window-in 0.2s forwards}",
			"#mini-window-sub.out{animation:mini-window-fade-out 0.2s forwards}",
			"#mini-window-top{overflow:hidden;display:grid;grid-template-columns:1fr;grid-auto-columns:auto;grid-auto-flow:column;gap:0.25rem}",
			"#mini-window-title,#mini-window-sub-title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}",
			"#mini-window-queue{box-sizing:border-box;border:solid 0.125rem var(--mini-window-interactive-text-color);border-radius:0.25rem;overflow:hidden;place-content:center;font-size:0.75rem;width:2.5em;display:none}",
			"#mini-window-close{position:relative;width:1.25rem;height:1.25rem}",
			"#mini-window-close::before,#mini-window-close::after{content:'';position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;border-radius:0.0625rem;width:0.125rem;height:1rem;background-color:var(--mini-window-interactive-text-color);transform:rotate(45deg)}",
			"#mini-window-close::before{transform:rotate(-45deg)}",
			"#mini-window-close:hover::before,#mini-window-close:hover::after{background-color:var(--mini-window-interactive-hover-text-color)}",
			"#mini-window-close:active::before,#mini-window-close:active::after{background-color:var(--mini-window-interactive-active-text-color)}",
			"#mini-window-content-frame{position:relative;width:100%;height:100%;overflow:hidden}",
			"#mini-window-layer.in>#mini-window::after,#mini-window-layer.out>#mini-window::after,#mini-window.in::after,#mini-window.out::after,#mini-window-sub.in::after,#mini-window-sub.out::after,#mini-window-content-frame.blocked::after{content:'';position:absolute;z-index:2147483647;left:0;right:0;top:0;bottom:0;display:block;opacity:0}",
			"#mini-window-content{position:relative;max-width:100%;max-height:100%;width:100%;height:100%;box-sizing:border-box;overflow:auto;word-wrap:break-word;word-break:normal;color:var(--mini-window-text-color);user-select:text}",
			// build-in elements
			"#mini-window .mini-window-button{border:none;border-radius:0.25rem;padding:0.5em}",
			"#mini-window .mini-window-button,#mini-window-queue{background-color:var(--mini-window-interactive-color);color:var(--mini-window-interactive-text-color);user-select:none}",
			"#mini-window .mini-window-button:hover{background-color:var(--mini-window-interactive-hover-color);color:var(--mini-window-interactive-hover-text-color)}",
			"#mini-window .mini-window-button:active:focus{background-color:var(--mini-window-interactive-active-color);color:var(--mini-window-interactive-active-text-color)}",
			"#mini-window .mini-window-hr{box-sizing:border-box;width:100%;border:0;height:0.0625rem;border-radius:0.03125rem;background-color:var(--mini-window-text-color)}",
			"#mini-window .mini-window-input{box-sizing:border-box;height:2rem;border: 0.0625rem solid var(--mini-window-interactive-color);border-radius:0.25rem;color:var(--mini-window-text-color);font-size:inherit;padding-inline:0.375rem;background-color:var(--mini-window-background-color)}",
			"#mini-window .mini-window-input:focus{outline:var(--mini-window-interactive-active-color) 0.125rem auto}",
			// build-in components
			"#mini-window-sub-content-frame,#mini-window-content.mini-window-dialog-frame{display:grid;gap:0.5rem;grid-template-rows:1fr}",
			"#mini-window-sub-content-frame.wait,#mini-window-content.mini-window-dialog-frame.wait{grid-template-columns:2rem 1fr;place-items:center start}",
			".mini-window-message{overflow:hidden auto;word-break:break-word}",
			".mini-window-buttons{display:grid;grid-auto-columns:minmax(auto,6rem);grid-auto-flow:column;gap:0.5rem;justify-self:end}",
			".mini-window-buttons>.mini-window-button{font-weight:bold}",
			"@keyframes mini-window-cycle{from{transform:rotate(0)}to{transform:rotate(1turn)}}",
			".mini-window-cycle{width:2rem;height:2rem;box-sizing:border-box;background-color:transparent;border:solid 0.125rem;border-color:#0080FF #0080FF transparent transparent;border-radius:50%;transform-origin:center;animation:mini-window-cycle 1s linear infinite forwards running}"
		]],
		["div", [
			["div", [
				["span", null, { id: "mini-window-title" }, "windowTitle"],
				["span", "0", { id: "mini-window-queue", title: "正在排队的弹窗数量" }, "windowQueue"],
				["button", null, { id: "mini-window-close", class: "mini-window-button", title: "关闭" }, "windowClose"]
			], { id: "mini-window-top" }],
			["hr", null, { class: "mini-window-hr" }],
			["div", [
				["div", null, { id: "mini-window-content" }, "windowContent"]
			], { id: "mini-window-content-frame" }, "contentFrame"],
			["div", [
				["div", [
					["span", null, { id: "mini-window-sub-title" }, "subTitle"],
					["hr", null, { class: "mini-window-hr" }],
					["div", null, { id: "mini-window-sub-content-frame" }, "subFrame"]
				], { id: "mini-window-sub" }, "subBody"]
			], { id: "mini-window-sub-layer" }, "subLayer"]
		], { id: "mini-window" }, "windowBody"]
	], { id: "mini-window-layer" }, "layer"]
], document.body), STYLE_NAMES = {
	backgroundColor: "background-color",
	textColor: "text-color",
	interactiveColor: "interactive-color",
	interactiveHoverColor: "interactive-hover-color",
	interactiveActiveColor: "interactive-active--color",
	interactiveTextColor: "interactive-text-color",
	interactiveHoverTextColor: "interactive-hover-text-color",
	interactiveActiveTextColor: "interactive-active-text-color"
}, queue = [], windowStyle = windowBody.style;
var pending = false, subWindowPending = false, closeCurrent = null, abortCurrentSub = null, unshiftMode = false;
function preventBubble(event) { event.stopPropagation() }
class MiniWindowController {
	instance;
	data;
	constructor(instance, data) {
		this.instance = instance;
		this.data = data;
	}
	pending = true;
	active = false;
	closed = false;
	blocked = true;
	subWindows = [];
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class SubWindowController {
	promise = Promise.withResolvers();
	type;
	title;
	content;
	shown = false;
	constructor(type, title, content) {
		this.type = type;
		this.title = title;
		this.content = content;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class MiniWindow extends EventTarget {
	static #checkInstance(instance) { if (!(instance instanceof this)) throw new TypeError("Illegal invocation") }
	#onshow = null;
	#onshown = null;
	#onclose = null;
	#onclosed = null;
	get onshow() { return this.#onshow }
	get onshown() { return this.#onshown }
	get onclose() { return this.#onclose }
	get onclosed() { return this.#onclosed }
	#onshowHandler(event) { if (this.#onshow) this.#onshow(event) }
	set onshow(value) {
		super.removeEventListener("show", this.#onshowHandler);
		if (typeof value == "function") {
			super.addEventListener("show", this.#onshowHandler);
			this.#onshow = value
		} else this.#onshow = null;
	}
	#onshownHandler(event) { if (this.#onshown) this.#onshown(event) }
	set onshown(value) {
		super.removeEventListener("shown", this.#onshownHandler);
		if (typeof value == "function") {
			super.addEventListener("shown", this.#onshownHandler);
			this.#onshown = value
		} else this.#onshown = null;
	}
	#oncloseHandler(event) { if (this.#onclose) this.#onclose(event) }
	set onclose(value) {
		super.removeEventListener("close", this.#oncloseHandler);
		if (typeof value == "function") {
			super.addEventListener("close", this.#oncloseHandler);
			this.#onclose = value
		} else this.#onclose = null;
	}
	#onclosedHandler(event) { if (this.#onclosed) this.#onclosed(event) }
	set onclosed(value) {
		super.removeEventListener("closed", this.#onclosedHandler);
		if (typeof value == "function") {
			super.addEventListener("closed", this.#onclosedHandler);
			this.#onclosed = value
		} else this.#onclosed = null;
	}
	#controller;
	get active() { return this.#controller.active }
	get closed() { return this.#controller.closed }
	get blocked() { return this.#controller.blocked }
	constructor(content, title = undefined, options = null) {
		if (arguments.length < 1) throw new TypeError("Failed to construct 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof content != "string" && !(content instanceof Node)) throw new TypeError("Failed to construct 'MiniWindow': Argument 'content' is not a string or HTML node.");
		if (typeof options != "object") throw new TypeError("Failed to construct 'MiniWindow': Argument 'options' is not an object.");
		super();
		queueUp(this.#controller = new MiniWindowController(this, { content, title, options }));
	}
	blockSwitch(toState = undefined) {
		MiniWindow.#checkInstance(this);
		return blockContentSwitch(this.#controller, toState);
	}
	close() {
		MiniWindow.#checkInstance(this);
		closeInstance(this.#controller);
	}
	after(content, title = undefined, options = null) {
		MiniWindow.#checkInstance(this);
		if (arguments.length < 1) throw new TypeError("Failed to execute 'after' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof content != "string" && !(content instanceof Node)) throw new TypeError("Failed to execute 'after' on 'MiniWindow': Argument 'content' is not a string or HTML node.");
		if (typeof options != "object") throw new TypeError("Failed to execute 'after' on 'MiniWindow': Argument 'options' is not an object.");
		if (!this.#controller.active) throw new Error("Failed to execute 'after' on 'MiniWindow': The instance is not active.");
		unshiftMode = true;
		const temp = new MiniWindow(content, title, options);
		unshiftMode = false;
		return temp;
	}
	#subWindowCheck() { if (this.#controller.closed) throw new Error(`Failed to execute 'subWindowCheck' on 'MiniWindow': The instance is closed.`) }
	async #createSub(controller) {
		const main = this.#controller, queue = main.subWindows;
		queue.push(controller);
		if (main.active && !subWindowPending) subWindowWorkflow(queue);
		try { await controller.promise.promise } catch (_ignore) { return }
		if (!controller.shown) queue.splice(queue.indexOf(controller), 1);
	}
	alert(message) {
		MiniWindow.#checkInstance(this);
		if (arguments.length < 1) throw new TypeError("Failed to execute 'alert' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof message != "string") throw new TypeError("Failed to execute 'alert' on 'MiniWindow': Argument 'message' is not a string.");
		this.#subWindowCheck();
		const controller = new SubWindowController("alert", "提示", parse([
			["div", message, { class: "mini-window-message" }],
			["div", [["button", "确认", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve() }, { once: true, passive: true }]] }]], { class: "mini-window-buttons" }]
		])), { promise, resolve } = controller.promise;
		this.#createSub(controller);
		return promise;
	}
	confirm(message, textOfYes = null, textOfNo = null) {
		MiniWindow.#checkInstance(this);
		if (arguments.length < 1) throw new TypeError("Failed to execute 'confirm' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof message != "string") throw new TypeError("Failed to execute 'confirm' on 'MiniWindow': Argument 'message' is not a string.");
		this.#subWindowCheck();
		const controller = new SubWindowController("confirm", "确认", parse([
			["div", message, { class: "mini-window-message" }],
			["div", [
				["button", typeof textOfYes == "string" ? textOfYes : "是", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve(true) }, { once: true, passive: true }]] }],
				["button", typeof textOfNo == "string" ? textOfNo : "否", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve(false) }, { once: true, passive: true }]] }]
			], { class: "mini-window-buttons" }]
		])), { resolve, promise } = controller.promise;
		this.#createSub(controller);
		return promise;
	}
	wait(message) {
		MiniWindow.#checkInstance(this);
		if (arguments.length < 1) throw new TypeError("Failed to execute 'wait' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof message != "string") throw new TypeError("Failed to execute 'wait' on 'MiniWindow': Argument 'message' is not a string.");
		this.#subWindowCheck();
		const controller = new SubWindowController("wait", "请等待", parse([
			["div", null, { class: "mini-window-cycle" }],
			["div", message, { class: "mini-window-message" }]
		]));
		this.#createSub(controller);
		return controller.promise.resolve;
	}
	prompt(message, defaultText = "") {
		MiniWindow.#checkInstance(this);
		if (arguments.length < 1) throw new TypeError("Failed to execute 'prompt' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof message != "string") throw new TypeError("Failed to execute 'prompt' on 'MiniWindow': Argument 'message' is not a string.");
		if (typeof defaultText != "string") throw new TypeError("Failed to execute 'prompt' on 'MiniWindow': Argument 'defaultText' is not a string.");
		this.#subWindowCheck();
		const { documentFragment, nodes: { input } } = parseAndGetNodes([
			["div", message, { class: "mini-window-message" }],
			["input", null, { class: 'mini-window-input', value: defaultText }, 'input'],
			["div", [
				["button", "确定", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve(input.value) }, { once: true, passive: true }]] }],
				["button", "取消", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { reject(new DOMException("User canceled.", "UserCanceled")) }, { once: true, passive: true }]] }]
			], { class: "mini-window-buttons" }]
		])
		const controller = new SubWindowController("prompt", "输入", documentFragment), { resolve, reject, promise } = controller.promise;
		this.#createSub(controller);
		return promise;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
	static alert(content, title = null) {
		if (arguments.length < 1) throw new TypeError("Failed to execute 'alert': 1 argument required, but only 0 present.");
		if (typeof content != "string" && !(content instanceof Node)) throw new TypeError("Failed to execute 'alert': Argument 'content' is not a string or HTML node.");
		const { promise, resolve } = Promise.withResolvers(), miniWindow = new MiniWindow(parse([
			["div", content, { class: "mini-window-message" }],
			["div", [["button", "确认", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve(); miniWindow.close() }, { once: true, passive: true }]] }]], { class: "mini-window-buttons" }]
		], true), typeof title == "string" ? title : "提示", { noManualClose: true, size: { width: "384px" }, containerClassName: "mini-window-dialog-frame" });
		return promise;
	}
	static confirm(content, title = null, textOfYes = null, textOfNo = null) {
		if (arguments.length < 1) throw new TypeError("Failed to execute 'confirm': 1 argument required, but only 0 present.");
		if (typeof content != "string" && !(content instanceof Node)) throw new TypeError("Failed to execute 'confirm': Argument 'content' is not a string or HTML node.");
		const { promise, resolve } = Promise.withResolvers(), miniWindow = new MiniWindow(parse([
			["div", content, { class: "mini-window-message" }],
			["div", [
				["button", typeof textOfYes == "string" ? textOfYes : "是", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve(true); miniWindow.close() }, { once: true, passive: true }]] }],
				["button", typeof textOfNo == "string" ? textOfNo : "否", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { resolve(false); miniWindow.close() }, { once: true, passive: true }]] }]
			], { class: "mini-window-buttons" }]
		], true), typeof title == "string" ? title : "确认", { noManualClose: true, size: { width: "384px" }, containerClassName: "mini-window-dialog-frame" });
		return promise;
	}
	static wait(message, title = null) {
		if (arguments.length < 1) throw new TypeError("Failed to execute 'wait' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof message != "string") throw new TypeError("Failed to execute 'wait' on 'MiniWindow': Argument 'message' is not a string.");
		return closeInstance.bind(null, new MiniWindow(parse([
			["div", null, { class: "mini-window-cycle" }],
			["div", message, { class: "mini-window-message" }]
		]), typeof title == "string" ? title : "请等待", { noManualClose: true, containerClassName: "mini-window-dialog-frame wait" }).#controller);
	}
	static prompt(message, defaultText = "") {
		if (arguments.length < 1) throw new TypeError("Failed to execute 'prompt' on 'MiniWindow': 1 argument required, but only 0 present.");
		if (typeof message != "string") throw new TypeError("Failed to execute 'prompt' on 'MiniWindow': Argument 'message' is not a string.");
		if (typeof defaultText != "string") throw new TypeError("Failed to execute 'prompt' on 'MiniWindow': Argument 'defaultText' is not a string.");
		const { documentFragment, nodes: { input } } = parseAndGetNodes([
			["div", message, { class: "mini-window-message" }],
			["input", null, { class: 'mini-window-input', value: defaultText }, 'input'],
			["div", [
				["button", "确定", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { miniWindow.close(); resolve(input.value) }, { once: true, passive: true }]] }],
				["button", "取消", { class: "mini-window-button", [EVENT_LISTENERS]: [["click", () => { miniWindow.close(); reject(new DOMException("User canceled.", "AbortError")) }, { once: true, passive: true }]] }]
			], { class: "mini-window-buttons" }]
		]), { resolve, reject, promise } = Promise.withResolvers(), miniWindow = new MiniWindow(documentFragment, "输入", { noManualClose: true, size: { width: "384px" }, containerClassName: "mini-window-dialog-frame" });
		return promise;
	}
}
function clearContent() {
	windowBody.style = windowClose.style = windowContent.style = windowTitle.innerHTML = windowContent.innerHTML = contentFrame.className = windowContent.className = "";
	for (const i in STYLE_NAMES) windowStyle.setProperty(`--mini-window-${STYLE_NAMES[i]}`, null);
}
function setStyle(data) {
	if (!(data instanceof Object)) return;
	for (const i in STYLE_NAMES) if (i in data) windowStyle.setProperty(`--mini-window-${STYLE_NAMES[i]}`, data[i]);
}
const sizeFormat = /^\d+%$/;
function setSize(data) {
	if (!(data instanceof Object)) return;
	if ("width" in data) {
		const width = data.width;
		(sizeFormat.test(width) ? windowBody : windowContent).style.width = width;
	}
	if ("height" in data) {
		const height = data.height;
		(sizeFormat.test(height) ? windowBody : windowContent).style.height = height;
	}
}
function setContent(data) {
	const { content, title, options } = data;
	windowTitle.innerText = title ?? "提示";
	windowContent.innerHTML = "";
	switch (typeof content) {
		case "string":
			windowContent.innerText = content;
			break;
		case "object":
			windowContent.appendChild(content);
			break;
	}
	windowContent.scrollTo(0, 0);
	if (!options) return;
	if (options.noManualClose) windowClose.style.display = "none";
	if ("size" in options) setSize(options.size);
	if ("style" in options) setStyle(options.style);
	if ("containerClassName" in options) windowContent.className = options.containerClassName;
}
function fadeIn(target) {
	return new Promise(function (resolve) {
		target.addEventListener("animationend", function (event) { preventBubble(event); target.className = ""; resolve() }, { once: true, passive: true });
		target.className = "in";
	})
}
function fadeOut(target) {
	return new Promise(function (resolve) {
		target.addEventListener("animationend", function (event) { preventBubble(event); target.className = ""; resolve() }, { once: true, passive: true });
		target.className = "out";
	})
}
async function workflow() {
	if (!queue.length) {
		pending = false;
		return;
	}
	layer.style.display = "grid";
	var target = layer;
	while (true) {
		const controller = queue.shift(), { instance, subWindows } = controller;
		controller.pending = false;
		updateQueueNumber();
		setContent(controller.data);
		controller.data = null;
		const close = new Promise(waitClose);
		controller.active = true;
		instance.dispatchEvent(new Event("show"));
		if (subWindows.length) subWindowWorkflow(subWindows);
		await fadeIn(target);
		instance.dispatchEvent(new Event("shown"));
		await close;
		closeCurrent = null;
		controller.active = false;
		controller.closed = true;
		if (subWindowPending) clearSubWindows(controller);
		instance.dispatchEvent(new Event("close"));
		await fadeOut(target = queue.length ? windowBody : layer);
		instance.dispatchEvent(new Event("closed"));
		clearContent();
		if (target == windowBody && !queue.length) {
			windowStyle.display = "none";
			await fadeOut(target = layer);
			windowStyle.display = null;
		}
		if (!queue.length) break;
	}
	layer.style.display = null;
	pending = false;
}
function updateQueueNumber() { windowQueue.innerText = queue.length > 99 ? "99+" : queue.length }
function queueUp(controller) {
	if (unshiftMode) {
		queue.unshift(controller);
		updateQueueNumber();
		return;
	}
	queue.push(controller);
	updateQueueNumber();
	if (pending) return;
	pending = true;
	queueMicrotask(workflow);
}
function waitClose(resolve) { closeCurrent = resolve }
function closeInstance(controller) {
	if (controller.closed) return;
	controller.closed = true;
	if (controller.pending) {
		queue.splice(queue.indexOf(controller), 1);
		updateQueueNumber();
	} else closeCurrent();
}
function blockContentSwitch(controller, toState) {
	if (!controller.active) return false;
	contentFrame.className = (controller.blocked = toState ?? !controller.blocked) ? "blocked" : "";
	return true;
}
function close(event) {
	if (!event.isTrusted) throw new Error("MiniWindow only accept user gesture!");
	if (closeCurrent) closeCurrent();
}
async function showSub(type, title, content) {
	subTitle.innerText = title;
	subFrame.className = type;
	subFrame.appendChild(content);
	subLayer.style.display = "grid";
	await fadeIn(subBody);
}
async function closeSub() {
	await fadeOut(subBody);
	clearSubContent();
}
function clearSubContent() {
	subLayer.style.display = null;
	subTitle.innerText = subFrame.className = subFrame.innerHTML = "";
}
function clearSubWindows(controller) {
	if (abortCurrentSub) abortCurrentSub(new Error("MiniWindow closed"));
	for (const item of controller.subWindows.splice(0)) item.promise.reject(new Error("MiniWindow closed"));
}
async function subWindowWorkflow(queue) {
	subWindowPending = true;
	while (queue.length) {
		const instance = queue.shift(), promise = instance.promise;
		abortCurrentSub = promise.reject;
		instance.shown = true;
		showSub(instance.type, instance.title, instance.content);
		try { await promise.promise } catch (_ignore) { }
		abortCurrentSub = null;
		await closeSub();
	}
	subWindowPending = false;
}
function remove() { layer.remove() }
function reload() { document.body.appendChild(layer) }
function setCounterEnabled(enabled) { windowQueue.style.display = enabled ? "grid" : null }
windowClose.addEventListener("click", close, { passive: true });
contentFrame.addEventListener("animationend", preventBubble, { passive: true });
export default MiniWindow;
export { MiniWindow, remove, reload, setCounterEnabled }