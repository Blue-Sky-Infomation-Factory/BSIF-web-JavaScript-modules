import { EVENT_LISTENERS, parse } from "./ArrayHTML.mjs";
document.head.appendChild(parse([
	["style", [
		""
	]]
]));


const drawContext = document.createElement("canvas").getContext("2d");
drawContext.font = "14px ui-sans-serif";
// drawContext.measureText()
function showMenu(list, anchor = null, darkStyle = false) {

	const {documentFragment, maxItemWidth, itemsHeight} = buildList(list, darkStyle);
	debugger;

}
function buildList(list, darkStyle) {
	if (!Array.isArray(list)) throw new TypeError("Failed to execute 'buildList': Argument 'list' must be an array.");
	const temp = [];
	var groupHr = false, maxItemWidth = 0, itemsHeight = 0;
	for (const item of list) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'buildList': Elements of list must be objects.");
		switch (item.type) {
			case "item": {
				const width = buildItem(item, temp);
				if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
				break;
			}
			case "check-item": {
				const width = buildCheckItem(item, temp);
				if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
				break;
			}
			case "group": {
				const list = item.list;
				if (!Array.isArray(list)) throw new TypeError("Failed to execute 'buildList': Property 'list' of item of type 'group' is not an array.");
				if (!list.length) throw new Error("Empty group!");
				if (groupHr) {
					temp.push(["hr"]);
					itemsHeight += 0;
				}
				const [width, height] = buildGroup(list, temp);
				itemsHeight += height;
				if (width > maxItemWidth && maxItemWidth < 376) maxItemWidth = width;
				break;
			}
			case "sub-list": {
				const width = buildSubList(item, temp);
				if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
				break;
			}
			default:
				throw new TypeError(`Failed to execute 'buildList': Invalid item type '${item.type}'.`)
		}
		groupHr = true;
	}
	return {
		documentFragment: parse(temp),
		maxItemWidth,
		itemsHeight
	}
}
function buildKeys(data) {
	if (!(data instanceof Object)) throw new TypeError("Failed to execute 'buildKeys': Property 'keys' of item is not an object.");
	const key = data.key;
	if (typeof key != "string" || !key) throw new Error("Failed to execute 'buildKeys': Property 'keys' of object must be a non-empty string.")
	const keys = [];
	if (data.alt) keys.push("Alt");
	if (data.ctrl) keys.push("Ctrl");
	if (data.shift) keys.push("Shift");
	keys.push(key);
	return keys.join(" + ");
}
function buildIcon(data) {
	if (!(data instanceof Object)) throw new TypeError("Failed to execute 'buildIcon': Property 'icon' of item is not an object.");
	switch (data.type) {
		case "image": {
			const url = data.url;
			if (typeof url != "string") throw new TypeError("Failed to execute 'buildIcon': URL of icon is not a string.");
			return ["div", null, {
				class: "context-menu-item-icon image",
				style: `background-image:url(${JSON.stringify(url)})`
			}];
		}
		case "sprite": {
			const { url, resourceSize: [width, height] } = data, x = data.x ?? 0, y = data.y ?? 0;
			if (typeof url != "string") throw new TypeError("Failed to execute 'buildIcon': URL of icon is not a string.");
			if (!Number.isInteger(width)) throw new TypeError("Failed to execute 'buildIcon': Width of icon (resourceSize[0]) is not an integer.");
			if (!Number.isInteger(height)) throw new TypeError("Failed to execute 'buildIcon': Height of icon (resourceSize[1]) is not an integer.");
			if (!Number.isInteger(x)) throw new TypeError("Failed to execute 'buildIcon': X of icon is not an integer.");
			if (!Number.isInteger(y)) throw new TypeError("Failed to execute 'buildIcon': Y of icon is not an integer.");
			return ["div", null, {
				class: "context-menu-item-icon",
				style: {
					backgroundImage: `url(${JSON.stringify(url)})`,
					backgroundSize: `${width}px ${height}px`,
					backgroundPosition: `${x}px ${y}px`
				}
			}];
		}
		case "font": {
			const { font, charcter } = data;
			if (typeof font != "string") throw new TypeError("Failed to execute 'buildIcon': Font of icon is not a string.");
			if (typeof charcter != "string") throw new TypeError("Failed to execute 'buildIcon': Charcter of icon is not a string.");
			return ["div", charcter, {
				class: "context-menu-item-icon font",
				style: "font-family:" + font
			}];
		}
		default:
			throw new Error("Failed to execute 'buildIcon': Invalid icon type.")
	}
}
function buildItem(data, temp) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildItem': Property 'text' of item is not a string.");
	var keysWidth = 0, keyText = null;
	if ("keys" in data) keysWidth = drawContext.measureText(keyText = buildKeys(data.keys)).actualBoundingBoxRight;
	const properties = { class: "context-menu-item" };
	if ("onselect" in data) {
		const onselect = data.onselect;
		if (typeof onselect != "function") throw new TypeError("Failed to execute 'buildItem': Property 'onselect' of item is not a function.");
		properties[EVENT_LISTENERS] = [["click", onselect, { once: true, passive: true }]];
	}
	temp.push(["button", [
		"icon" in data ? buildIcon(data.icon) : null,
		["span", text, { class: "context-menu-item-text" }],
		keyText ? ["span", keyText, { class: "context-menu-item-keys" }] : null
	], properties]);
	return drawContext.measureText(text).actualBoundingBoxRight + keysWidth + 80;
}
function buildCheckItem(data, temp) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildCheckItem': Property 'text' of item is not a string.");
	var keysWidth = 0, keyText = null;
	if ("keys" in data) keysWidth = drawContext.measureText(keyText = buildKeys(data.keys)).actualBoundingBoxRight;
	const properties = { class: "context-menu-item-checkbox", type: "checkbox" };
	if (data.state) properties.checked = "";
	if ("onselect" in data) {
		const onselect = data.onselect;
		if (typeof onselect != "function") throw new TypeError("Failed to execute 'buildCheckItem': Property 'onselect' of item is not a function.");
		properties[EVENT_LISTENERS] = [["change", function () { onselect(this.checked) }, { once: true, passive: true }]];
	}
	temp.push(["label", [
		["input", null, properties],
		["span", text, { class: "context-menu-item-text" }],
		keyText ? ["span", keyText, { class: "context-menu-item-keys" }] : null
	], { class: "context-menu-item" }]);
	return drawContext.measureText(text).actualBoundingBoxRight + keysWidth + 80;
}
function buildSubList(data, temp) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildSubList': Property 'text' of item is not a string.");
	temp.push(["button", [
		"icon" in data ? buildIcon(data.icon) : null,
		["span", text, { class: "context-menu-item-text" }]
	], { class: "context-menu-item collection" }]);
	return drawContext.measureText(text).actualBoundingBoxRight + 80;
}
function buildGroup(data, temp) {
	var maxItemWidth = 0, itemsHeight = 0;
	for (const item of data) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'buildGroup': Elements of list must be objects.");
		switch (item.type) {
			case "item": {
				const width = buildItem(item, temp);
				if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
				break;
			}
			case "check-item": {
				const width = buildCheckItem(item, temp);
				if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
				break;
			}
			case "sub-list": {
				const width = buildSubList(item, temp);
				if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
				break;
			}
			default:
				throw new TypeError(`Failed to execute 'buildGroup': Invalid item type '${item.type}'.`)
		}
	}
	return [maxItemWidth, itemsHeight];
}
export { showMenu, drawContext };
export default showMenu;