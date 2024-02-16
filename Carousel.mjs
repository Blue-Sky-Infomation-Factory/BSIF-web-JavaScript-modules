import { EVENT_LISTENERS, parseAndGetNodes } from "./ArrayHTML.mjs";
document.head.appendChild(parseAndGetNodes([["style", [
	".bs-carousel-box{box-sizing:border-box;width:100%;height:100%;border:1px solid black;position:relative;border-radius:1rem;background-color:black;overflow:hidden;transition:none 0.4s ease-in-out}",
	".bs-carousel-scroll,.bs-carousel-item{width:100%;height:100%}",
	".bs-carousel-scroll{left:0;position:absolute;top:0;display:grid;grid-auto-flow:column;grid-auto-columns:100%;transition-property:left;transition-duration:inherit;transition-timing-function:inherit;z-index:1}",
	".bs-carousel-item{position:relative;display:block;background-color:white}",
	".bs-carousel-item-image{width:100%;height:100%;background-position:center;background-size:cover;transition:transform 0.2s ease-in}",
	".bs-carousel-item.action{cursor:pointer}",
	".bs-carousel-item.action:hover>.bs-carousel-item-image{transform:scale(1.05)}",
	".bs-carousel-item.action:active>.bs-carousel-item-image{transition-duration:0s;transform:scale(1.025)}",
	".bs-carousel-item-text{box-sizing:border-box;width:100%;padding:0.5em;position:absolute;left:0;bottom:0;background-color:rgba(0,0,0,0.5);color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
	".bs-carousel-paginations{width:min-content;height:0.25rem;margin:0 auto;padding:0.25rem 0.5rem;position:absolute;top:0;left:0;right:0;opacity:0.5;background-color:rgba(0,0,0,50%);display:grid;grid-auto-flow:column;grid-auto-columns:1rem;gap:0.5rem;transition-property:opacity,padding,height;transition-duration:inherit;transition-timing-function:inherit;border-radius:0 0 0.5rem 0.5rem;overflow:hidden;z-index:3}",
	".bs-carousel-paginations:hover{height:1rem;padding:0.5rem;opacity:1}",
	".bs-carousel-paginations-item{box-sizing:border-box;width:1rem;margin:0;display:block;border-radius:0.125rem;outline:none;appearance:none;background-color:#DDDDDD;overflow:hidden;transition-property:background-color,border-radius;transition-duration:inherit;transition-timing-function:inherit;cursor:pointer}",
	".bs-carousel-paginations-item:hover{background-color:#FFC000}",
	".bs-carousel-paginations-item:active{background-color:#00C000}",
	".bs-carousel-paginations:hover>.bs-carousel-paginations-item{border-radius:0.25rem}",
	".bs-carousel-paginations-float,.bs-carousel-paginations-item:checked{background-color:#00C0FF}",
	".bs-carousel-paginations-float{width:1rem;height:0.25rem;border-radius:0.125rem;position:absolute;left:0.5rem;top:0.25rem;transition-property:top,height,border-radius,transform;transition-duration:inherit;transition-timing-function:inherit}",
	".bs-carousel-paginations:hover>.bs-carousel-paginations-float{height:1rem;top:0.5rem;border-radius:0.25rem}",
	".bs-carousel-arrow{height:2rem;width:1.5rem;margin:auto 0;border:none;position:absolute;top:0;bottom:0;opacity:0;background-color:rgba(0,0,0,0.5);color:white;font-size:1rem;line-height:2rem;text-align:center;z-index:2;transition:opacity 0.2s ease-in;cursor:pointer}",
	".bs-carousel-box.single>.bs-carousel-paginations,.bs-carousel-box.single>.bs-carousel-arrow{display:none}",
	".bs-carousel-arrow.prev{border-radius:0 0.5rem 0.5rem 0;left:0}",
	".bs-carousel-arrow.next{border-radius:0.5rem 0 0 0.5rem;right:0}",
	".bs-carousel-box:hover>.bs-carousel-arrow{opacity:1}"
]]]));
function buildItem(data) {
	const temp = [];
	if ("image" in data) temp.push(["div", null, { class: "bs-carousel-item-image", style: `background-image:url("${data.image}")` }]);
	if ("text" in data) temp.push(["div", data.text, { class: "bs-carousel-item-text", title: data.text }]);
	const item = ["div", temp, { class: "bs-carousel-item" }, "item"], action = data.action, attribute = item[2];
	switch (typeof action) {
		case "function":
			attribute.class += " action";
			attribute[EVENT_LISTENERS] = [["click", action]];
			break;
		case "string":
			item[0] = "a";
			attribute.href = action;
			attribute.class += " action";
			attribute.target = "-blank";
		default:
	}
	return item;
}
function filter(item) { return item instanceof Object }
class Carousel {
	#waitTime = 10000;
	get waitTime() { return this.#waitTime }
	set waitTime(value) {
		const temp = Number(value);
		if (!isFinite(temp) || temp < 1000) return;
		this.#waitTime = temp;
		this.#resetInterval();
	}
	#running = false;
	get running() { return this.#running }
	#intervalId = null;
	#size;
	#box;
	#float;
	#navi;
	#pagination;
	#scroll;
	#formChange() {
		const number = Number(this.#pagination.value);
		this.#scroll.left = -number * 100 + "%";
		this.#float.transform = `translateX(${number * 1.5}rem)`;
	}
	#change(page) {
		this.#pagination[page].checked = true;
		this.#navi.dispatchEvent(new Event("change"));
	}
	#next() {
		const next = Number(this.#pagination.value) + 1;
		this.#change(next > -1 && next < this.#size ? next : 0);
	}
	#prev() {
		const prev = Number(this.#pagination.value) - 1, size = this.#size;
		this.#change(prev > -1 && prev < size ? prev : size - 1);
	}
	#resetInterval() {
		if (!this.#running) return;
		clearInterval(this.#intervalId);
		this.#intervalId = setInterval(this.#next.bind(this), this.#waitTime);
	}
	#resume() {
		if (!this.#running) return;
		this.#intervalId = setInterval(this.#next.bind(this), this.#waitTime);
	}
	#pause() {
		if (!this.#running) return;
		clearInterval(this.#intervalId);
	}
	#start() {
		if (this.#running) return;
		this.#running = true;
		this.#intervalId = setInterval(this.#next.bind(this), this.#waitTime);
	}
	#stop() {
		if (!this.#running) return;
		this.#running = false;
		clearInterval(this.#intervalId);
	}
	constructor(data, start = false) {
		if (!Array.isArray(data)) throw new TypeError("Failed to construct 'Carousel': Argument 'data' is not an array.");
		const items = data.filter(filter).map(buildItem);
		const number = this.#size = items.length;
		const paginations = [["div", null, { class: "bs-carousel-paginations-float" }, "float"]];
		for (let i = 0; i < number; ++i) paginations.push(["input", null, { type: "radio", class: "bs-carousel-paginations-item", name: "bs-carousel-page", value: i }]);
		const nodes = parseAndGetNodes([["div", [
			["div", items, { class: "bs-carousel-scroll" }, "scroll"],
			["form", paginations, { class: "bs-carousel-paginations", [EVENT_LISTENERS]: [["change", this.#formChange.bind(this), { passive: true }]] }, "navi"],
			["button", "<", { class: "bs-carousel-arrow prev", [EVENT_LISTENERS]: [["click", this.#prev.bind(this), { passive: true }]] }],
			["button", ">", { class: "bs-carousel-arrow next", [EVENT_LISTENERS]: [["click", this.#next.bind(this), { passive: true }]] }]
		], {
			class: "bs-carousel-box", [EVENT_LISTENERS]: [
				["mouseenter", this.#pause.bind(this), { passive: true }],
				["mouseleave", this.#resume.bind(this), { passive: true }]
			]
		}, "box"]]).nodes;
		const box = this.#box = nodes.box;
		if (number < 2) {
			box.className += "single";
			return;
		}
		this.#float = nodes.float.style;
		const navi = this.#navi = nodes.navi;
		this.#pagination = navi.elements["bs-carousel-page"];
		this.#scroll = nodes.scroll.style;
		if (start) this.#start();
	}
	get element() { return this.#box }
	start() { if (this.#size > 1) this.#start() }
	stop() { this.#stop() }
	static create(data, target) {
		if (!(target instanceof HTMLElement || target instanceof DocumentFragment || target instanceof Document)) throw new TypeError("Failed to execute 'create' on 'Carousel': Argument 'target' cannot append elements.")
		const temp = new Carousel(data, true);
		target.appendChild(temp.#box);
		return temp;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
export default Carousel;