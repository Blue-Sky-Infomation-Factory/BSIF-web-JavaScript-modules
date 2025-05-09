import getStorage from "./SettingStorage.mjs";
import { IndexedDatabaseObjectStore } from "../IndexedDatabase.mjs";
import { parseAndGetNodes, parse } from "../array_HTML.mjs";
const style = document.createElement("style");
style.textContent = [
	".bs-setting-frame,.bs-setting-frame-sub{width:100%;height:100%;background-color:#FFF;overflow:hidden;display:grid;grid-template-rows:2.5rem 1fr;box-sizing:border-box}",
	".bs-setting-frame{position:relative;user-select:none}",
	".bs-setting-frame.blocked::after{content:\"\";position:absolute;height:100%;width:100%}",
	".bs-setting-frame-sub{position:absolute;transition:transform 0.2s ease-in;top:0;box-shadow:black 0 0 1rem}",
	".bs-setting-frame-sub.out{transform:translateX(100%)}",
	".bs-setting-frame-title{display:grid;gap:0.5rem;grid-template-columns:3rem 1fr 3rem;grid-template-areas:\"back title .\";border-bottom:1px solid #808080}",
	".bs-setting-frame-back{padding:0.5rem 0!important;align-self:center;border:0}",
	".bs-setting-title{grid-area:title;font-weight:bold;place-self:center;max-width:100%;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}",
	".bs-setting-list{display:grid;grid-auto-rows:minmax(2.5rem,min-content);overflow:hidden auto;place-content:start stretch}",
	".bs-setting-item{border-style:solid;border-width:0 0 0.0625rem 0;border-color:#CCC;padding:0.5rem!important;display:grid;place-items:center start;gap:0.5rem;background-color:inherit!important;border-radius:0!important;color:#000!important;font-size:inherit!important;cursor:pointer}",
	".bs-setting-item:hover{background-color:#DDD!important}",
	".bs-setting-item:active{background-color:#BBB!important}",
	".bs-setting-item.next,.bs-setting-item.switch{grid-template-columns:1fr auto}",
	".bs-setting-item.next::after{content:\">\";color:#808080}",
	".bs-setting-item-title{word-break:break-word;text-align:start}",
	".bs-setting-switch{background-color:#FFFFFF;appearance:none;display:block;margin:0;width:3rem;height:1.5rem;border-radius:0.75rem;border:solid 0.125rem #808080;padding:0.125rem;overflow:hidden;outline:none;cursor:pointer}",
	".bs-setting-switch::before{content:\"\";display:block;background-color:#808080;width:1rem;height:1rem;border-radius:50%;transition:all 0.5s}",
	".bs-setting-switch:checked{border-color:#00C000}",
	".bs-setting-switch:checked::before{background-color:#00C000;transform:translateX(1.5rem)}",
	".bs-setting-page{width:100%;height:100%;border:none}"
].join("");
async function buildList(instance, data, root) {
	const list = [];
	for (let item of data) list.push(await buildItem(instance, item, root));
	return ["div", list, { class: "bs-setting-list" }];
}
async function buildItem(instance, data, root) {
	switch (data.type) {
		case "collection":
			return buildCollection(instance, data, root);
		case "storage":
			switch (data.data) {
				case "switch":
					return await buildSwitch(instance, data);
				case "1":

				case "2":
			}
		case "action":
			return buildAction(instance, data);
		case "info":
			return buildInfo(data, root);
	}
}
function buildCollection(instance, data, root) {
	const element = parseAndGetNodes([["button", [["span", data.title, { class: "bs-setting-item-title" }]], { class: "bs-setting-item next" }, "element"]]).nodes.element;
	element.addEventListener("click", async function () { createSub(data.title, await buildList(instance, data.sub, root), root) });
	return element;
}
function buildAction(instance, data) {
	const element = parseAndGetNodes([["button", [["span", data.title, { class: "bs-setting-item-title" }]], { class: "bs-setting-item" }, "element"]]).nodes.element;
	element.addEventListener("click", function () { data.action(instance) });
	return element;
}
async function buildSwitch(instance, data) {
	const { element, switch: input } = parseAndGetNodes([["label", [
		["span", data.title, { class: "bs-setting-item-title" }],
		["input", null, { class: "bs-setting-switch", type: "checkbox" }, "switch"]
	], { class: "bs-setting-item switch" }, "element"]]).nodes, { storage } = instance;
	input.checked = await storage.get(data.path);
	input.addEventListener("change", function () { storage.set(data.path, input.checked) });
	return element;
}
function buildInfo(data, root) {
	const element = parseAndGetNodes([["button", [["span", data.title, { class: "bs-setting-item-title" }]], { class: "bs-setting-item next" }, "element"]]).nodes.element;
	element.addEventListener("click", function () { createSub(data.title, buildLoad(data.source), root) });
	return element;
}
function buildLoad(address) { return ["iframe", null, { src: address, class: "bs-setting-page" }, "element"] }
function createSub(title, content, root) {
	const { frame, back } = parseAndGetNodes([
		["div", [
			["div", [
				["button", "< 返回", { class: "bs-setting-frame-back" }, "back"],
				["span", title, { class: "bs-setting-title" }]
			], { class: "bs-setting-frame-title" }],
			content
		], { class: "bs-setting-frame-sub out" }, "frame"]
	]).nodes;
	back.addEventListener("click", function () {
		frame.addEventListener("transitionend", function () {
			frame.remove();
			root.classList.remove("blocked");
		}, { once: true });
		root.classList.add("blocked");
		frame.classList.add("out");
	})
	root.classList.add("blocked");
	root.appendChild(frame);
	frame.clientTop;
	frame.addEventListener("transitionend", function () { root.classList.remove("blocked") }, { once: true });
	frame.classList.remove("out");
}
class Setting {
	static #checkInstance(instance) { if (!(instance instanceof this)) throw new TypeError("Illegal invocation") }
	#storage;
	get storage() { return this.#storage }
	#tree;
	constructor(storage, tree) {
		this.#storage = storage;
		this.#tree = tree;
	}
	async home() {
		Setting.#checkInstance(this);
		const { documentFragment, nodes: { root } } = parseAndGetNodes([
			style,
			["div", null, { class: "bs-setting-frame" }, "root"]
		]);
		root.appendChild(parse([
			["div", [["span", "主菜单", { class: "bs-setting-title" }]], { class: "bs-setting-frame-title" }],
			await buildList(this, this.#tree, root)
		]));
		return documentFragment;
	}
	async direct(path) {
		Setting.#checkInstance(this);
		if (arguments.length < 1) throw new TypeError("Failed to execute 'direct' on 'Setting': 1 argument required, but only 0 present.");
		if (!Array.isArray(path)) throw new TypeError("Failed to execute 'direct' on 'Setting': Argument 'path' is not an Array.");
		if (!path.length) throw new Error("Failed to execute 'direct' on 'Setting': Invalid path");
		var list = this.#tree, target;
		for (let name of path) {
			if (!Array.isArray(list)) throw new Error("Failed to execute 'direct' on 'Setting': Invalid path.");
			let found;
			for (let item of list) if (item.name == name) {
				found = target = item;
				break;
			};
			if (!found) throw new Error("Failed to execute 'direct' on 'Setting': Invalid path.");
			list = target.sub;
		}
		const { documentFragment, nodes: { root } } = parseAndGetNodes([
			style,
			["div", null, { class: "bs-setting-frame" }, "root"]
		]);
		var page;
		switch (target.type) {
			case "collection":
				page = await buildList(this, target.sub, root);
				break;
			case "info":
				page = buildLoad(target.source);
				break;
			default:
				throw new Error("Failed to execute 'direct' on 'Setting': Invalid path");
		}
		root.appendChild(parse([
			["div", [["span", target.title, { class: "bs-setting-title" }]], { class: "bs-setting-frame-title" }],
			page
		]));
		return documentFragment;
	}
	static async open(storageSource, structure) {
		if (arguments.length < 2) throw new TypeError(`Failed to execute 'open': 2 arguments required, but only ${arguments.length} present.`);
		if (!(typeof storageSource == "string" || storageSource instanceof IndexedDatabaseObjectStore)) throw new TypeError("Failed to execute 'open': Argument 'storageSource' is not a string or not type of IndexedDatabaseObjectStore.");
		if (!(structure instanceof Object)) throw new TypeError("Failed to execute 'open': Argument 'structure' is not an object.");
		const { tree, storage } = structure;
		if (!Array.isArray(tree)) throw new TypeError("Failed to execute 'open': 'structure.tree' is not an Array.");
		if (!(storage instanceof Object)) throw new TypeError("Failed to execute 'open': 'structure.storage' is not an object.");
		return new Setting(await getStorage(storageSource, storage), tree)
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
export default Setting;
export { Setting };