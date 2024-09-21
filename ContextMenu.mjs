import { EVENT_LISTENERS, OBJECT_PROPERTIES, parse, parseAndGetNodes } from "./ArrayHTML.mjs";
const font = "12px ui-sans-serif",
	drawContext = document.createElement("canvas").getContext("2d"),
	horizontalParam = ["left", "right"],
	verticalParam = ["top", "bottom"];
drawContext.font = font;
document.head.appendChild(parse([
	["style", [
		`.context-menu-list{position:fixed;z-index:1610612736;max-width:min(384px, 100vw);max-height:100vh;overflow:hidden auto;box-sizing:border-box;border-radius:8px;border:solid 1px #DDD;padding:3px;background-color:#FFF;box-shadow:2px 2px 4px 0 #00000040;font:${font};display:grid;gap:4px;outline:0;user-select:none}`,
		".context-menu-item{grid-template-columns:28px auto 1fr 28px;grid-template-areas:\"icon text keys symbol\";gap:8px;border-radius:4px;border:0;padding:0;background-color:transparent;cursor:pointer;color:inherit;font-size:inherit;text-align:initial}",
		".context-menu-item>*{pointer-events:none}",
		".context-menu-empty{opacity:0.5;place-content:center}",
		".context-menu-item>span,.context-menu-empty>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
		".context-menu-item,.context-menu-empty{height:28px;display:grid}",
		".context-menu-item.collection::after{content:\"\";width:4px;height:8px;background-color:#000;grid-area:symbol;place-self:center;clip-path:polygon(0 0, 100% 50%, 0 100%)}",
		".context-menu-item:focus,.context-menu-item:focus-within,.context-menu-item:hover{background-color:#D3DFE9}",
		".context-menu-item:active{background-color:#BCD}",
		".context-menu-item:disabled{opacity:0.5;pointer-events:none}",
		".context-menu-item-icon{grid-area:icon;width:16px;height:16px;place-self:center;overflow:hidden}",
		".context-menu-item-icon.image{background-size:cover;background-position:center}",
		".context-menu-item-icon.font{font-size:16px}",
		".context-menu-item-checkbox{grid-area:icon;place-self:center;outline:0;cursor:pointer}",
		".context-menu-item-text{grid-area:text;align-self:center}",
		".context-menu-item-keys{grid-area:keys;align-self:center;text-align:right;color:#888}",
		".context-menu-hr{border:0;background-color:#909090;height:1px;width:100%;margin:0}"
	]]
]));
function buildList(list, darkStyle, level) {
	if (!Array.isArray(list)) throw new TypeError("Failed to execute 'buildList': Argument 'list' must be an array.");
	const temp = [], length = list.length;
	if (!length) {
		return {
			maxItemWidth: buildEmpty(temp) + 8,
			element: parseAndGetNodes([["div", temp, { class: darkStyle ? "context-menu-list dark" : "context-menu-list", tabindex: "1" }, "element"]]).nodes.element,
			itemsHeight: 36,
			itemsList: []
		};
	}
	var insertHr = false, previousHr = false, maxItemWidth = 0, itemsHeight = 0;
	for (const item of list) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'buildList': Elements of list must be objects.");
		let itemWidth;
		if (insertHr) {
			temp.push(["hr", null, { class: "context-menu-hr" }]);
			itemsHeight += 5;
			insertHr = previousHr = false;
		}
		switch (item.type) {
			case "item":
				itemWidth = buildItem(item, temp);
				break;
			case "check-item":
				itemWidth = buildCheckItem(item, temp);
				break;
			case "group": {
				const list = item.list;
				if (!Array.isArray(list)) throw new TypeError("Failed to execute 'buildList': Property 'list' of item of type 'group' is not an array.");
				if (previousHr) {
					temp.push(["hr", null, { class: "context-menu-hr" }]);
					itemsHeight += 5;
				}
				const length = list.length;
				if (length) {
					itemWidth = buildGroup(list, temp);
					itemsHeight += (length - 1) * 32;
				} else {
					itemWidth = buildEmpty(temp);
				}
				insertHr = true;
				break;
			}
			case "sub-list":
				itemWidth = buildSubList(item, temp);
				break;
			default:
				throw new TypeError(`Failed to execute 'buildList': Invalid item type '${item.type}'.`)
		}
		if (itemWidth > maxItemWidth) maxItemWidth = itemWidth < 376 ? itemWidth : 376;
		itemsHeight += 28
		previousHr = true;
	}
	const { element, list: itemsList } = parseAndGetNodes([["div", temp, { class: "context-menu-list" }, "element"]]).nodes;
	return {
		element,
		maxItemWidth: maxItemWidth + 8,
		itemsHeight: itemsHeight + (length - 1) * 4 + 8,
		itemsList
	}
}
function buildKeys(data) {
	if (!(data instanceof Object)) throw new TypeError("Failed to execute 'buildKeys': Property 'keys' of item is not an object.");
	const key = data.key;
	if (typeof key != "string" || !key) throw new Error("Failed to execute 'buildKeys': Property 'keys' of object must be a non-empty string.")
	const keys = [];
	if (data.ctrl) keys.push("Ctrl");
	if (data.alt) keys.push("Alt");
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
function buildItem(data, temp, level) {
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
	], properties, "list", true]);
	return drawContext.measureText(text).actualBoundingBoxRight + keysWidth + 80;
}
function buildCheckItem(data, temp, level) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildCheckItem': Property 'text' of item is not a string.");
	var keysWidth = 0, keyText = null;
	if ("keys" in data) keysWidth = drawContext.measureText(keyText = buildKeys(data.keys)).actualBoundingBoxRight;
	const properties = { class: "context-menu-item" }, checked = Boolean(data.checked), id = data.id;
	if ("onselect" in data) {
		const onselect = data.onselect;
		if (typeof onselect != "function") throw new TypeError("Failed to execute 'buildCheckItem': Property 'onselect' of item is not a function.");
		properties[EVENT_LISTENERS] = [["click", function () { onselect(!checked, id) }, { once: true, passive: true }]];
	}
	temp.push(["button", [
		["input", null, { class: "context-menu-item-checkbox", type: "checkbox", [OBJECT_PROPERTIES]: { checked } }],
		["span", text, { class: "context-menu-item-text" }],
		keyText ? ["span", keyText, { class: "context-menu-item-keys" }] : null
	], properties, "list", true]);
	return drawContext.measureText(text).actualBoundingBoxRight + keysWidth + 80;
}
function buildSubList(data, temp, level) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildSubList': Property 'text' of item is not a string.");
	temp.push(["button", [
		"icon" in data ? buildIcon(data.icon) : null,
		["span", text, { class: "context-menu-item-text" }]
	], { class: "context-menu-item collection" }, "list", true]);
	return drawContext.measureText(text).actualBoundingBoxRight + 80;
}
function buildGroup(data, temp, level) {
	var maxItemWidth = 0;
	for (const item of data) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'buildGroup': Elements of list must be objects.");
		let width;
		switch (item.type) {
			case "item":
				width = buildItem(item, temp);
				break;
			case "check-item":
				width = buildCheckItem(item, temp);
				break;
			case "sub-list":
				width = buildSubList(item, temp);
				break;
			default:
				throw new TypeError(`Failed to execute 'buildGroup': Invalid item type '${item.type}'.`)
		}
		if (width > maxItemWidth) maxItemWidth = width < 376 ? width : 376;
	}
	return maxItemWidth;
}
function buildEmpty(temp) {
	temp.push(["div", [["span", "空"]], { class: "context-menu-empty" }]);
	return drawContext.measureText("空").actualBoundingBoxRight;
}
function pointPosition(style, width, height, x, y, horizontalDirection, verticalDirection, forceHorizontal, forceVertical) {
	const { innerWidth, innerHeight } = window;
	if (x < 0) { x = 0 } else if (x > innerWidth) x = innerWidth;
	if (y < 0) { y = 0 } else if (y > innerHeight) y = innerHeight;
	const right = innerWidth - x, bottom = innerHeight - y;
	if (forceHorizontal) {
		if (horizontalDirection) {
			style.left = x + "px";
			if (width > right) style.width = right + "px";
		} else {
			style.right = right + "px";
			if (width > x) style.width = x + "px";
		}
	} else if (width > (horizontalDirection ? right : x)) {
		style[horizontalDirection ? "right" : "left"] = (horizontalDirection ? x : right) < width ? "0" : right + "px";
	} else style[horizontalDirection ? "left" : "right"] = x + "px";
	if (forceVertical) {
		if (verticalDirection) {
			style.top = y + "px";
			if (height > bottom) style.height = bottom + "px";
		} else {
			style.bottom = bottom + "px";
			if (height > y) style.height = y + "px";
		}
	} else if (height > (verticalDirection ? bottom : y)) {
		style[verticalDirection ? "bottom" : "top"] = (verticalDirection ? y : bottom) < height ? "0" : bottom + "px";
	} else style[verticalDirection ? "top" : "bottom"] = y + "px";
}
function elementPosition(style, anchorElement, marginX, marginY, horizontalSide, width, height, side, align, forceHorizontal, forceVertical) {
	const { innerWidth, innerHeight } = window;
	var { top, bottom, left, right } = anchorElement.getBoundingClientRect();
	if ((top -= marginY) < 0) { top = 0 } else if (top > innerHeight) top = innerHeight;
	if ((bottom += marginY) < 0) { bottom = 0 } else if (bottom > innerHeight) bottom = innerHeight;
	if ((left -= marginX) < 0) { left = 0 } else if (left > innerWidth) left = innerWidth;
	if ((right += marginX) < 0) { right = 0 } else if (right > innerWidth) right = innerWidth;
	const rightSpace1 = innerWidth - left, rightSpace2 = innerWidth - right,
		bottomSpace1 = innerHeight - top, bottomSpace2 = innerHeight - bottom;
	var horizontalDirection, verticalDirection;
	if (horizontalSide) {
		horizontalDirection = side == "right";
		verticalDirection = align == "top";
	} else {
		verticalDirection = side == "bottom";
		horizontalDirection = align == "left";
	}
	if (forceHorizontal) {
		if (horizontalDirection) {
			style.left = (horizontalSide ? right : left) + "px";
			const max = horizontalSide ? rightSpace2 : rightSpace1;
			if (width > max) style.width = max + "px";
		} else {
			style.right = (horizontalSide ? rightSpace2 : rightSpace1) + "px";
			const max = horizontalSide ? left : right;
			if (width > max) style.width = max + "px";
		}
	} else if (horizontalSide) {
		if (width > (horizontalDirection ? rightSpace2 : left)) {
			style[horizontalDirection ? "right" : "left"] = width > (horizontalDirection ? left : rightSpace2) ? "0" : (horizontalDirection ? rightSpace1 : right) + "px";
		} else style[horizontalDirection ? "left" : "right"] = (horizontalDirection ? right : rightSpace1) + "px";
	} else {
		const overflow = width > (horizontalDirection ? rightSpace1 : right);
		style[horizontalDirection ^ overflow ? "left" : "right"] = overflow ? "0" : (horizontalDirection ? left : rightSpace2) + "px";
	}
	if (forceVertical) {
		if (verticalDirection) {
			style.top = (horizontalSide ? top : bottom) + "px";
			const max = horizontalSide ? bottomSpace1 : bottomSpace2;
			if (height > max) style.height = max + "px";
		} else {
			style.bottom = (horizontalSide ? bottomSpace1 : bottomSpace2) + "px";
			const max = horizontalSide ? bottom : top;
			if (height > max) style.height = max + "px";
		}
	} else if (horizontalSide) {
		const overflow = height > (verticalDirection ? bottomSpace1 : bottom);
		style[verticalDirection ^ overflow ? "top" : "bottom"] = overflow ? "0" : (verticalDirection ? top : bottomSpace2) + "px";
	} else if (height > (verticalDirection ? bottomSpace2 : top)) {
		style[verticalDirection ? "bottom" : "top"] = height > (verticalDirection ? top : bottomSpace2) ? "0" : (verticalDirection ? bottomSpace1 : bottom) + "px";
	} else style[verticalDirection ? "top" : "bottom"] = (verticalDirection ? bottom : bottomSpace1) + "px";
}
function measureMenu(style, width, height, anchor, { horizontal: forceHorizontal, vertical: forceVertical }) {
	if (!anchor) {
		pointPosition(style, width, height, 0, 0, true, true, true, true);
	} else if (anchor instanceof MouseEvent) {
		pointPosition(style, width, height, anchor.clientX, anchor.clientY, true, true, forceHorizontal, forceVertical);
	} else if ("element" in anchor) {
		const anchorElement = anchor.element;
		if (!(anchorElement instanceof Element)) throw new TypeError("Invalid anchor.");
		let marginX = anchor.marginX ?? 0, marginY = anchor.marginY ?? 0;
		if (
			typeof marginX != "number" || typeof marginY != "number"
			|| !Number.isInteger(marginX) || !Number.isInteger(marginY)
			|| marginX < 0 || marginY < 0
		) throw new TypeError("Invalid anchor.");
		let { side, align } = anchor,
			horizontalSide = horizontalParam.includes(side),
			verticalSide = verticalParam.includes(side),
			horizontalAlign = horizontalParam.includes(align),
			verticalAlign = verticalParam.includes(align);
		if (
			!horizontalSide && !verticalSide && side !== null && side !== undefined
			|| !horizontalAlign && !verticalAlign && align !== null && align !== undefined
			|| horizontalSide && horizontalAlign || verticalSide && verticalAlign
		) throw new TypeError("Invalid anchor.");
		if (!side && !align) {
			side = "bottom";
			align = "left";
		} else if (!side) {
			side = horizontalAlign ? "bottom" : "right";
			horizontalSide = !horizontalAlign;
		} else if (!align) align = horizontalSide ? "top" : "left";
		elementPosition(style, anchorElement, marginX, marginY, horizontalSide, width, height, side, align, forceHorizontal, forceVertical);
	} else {
		let x = 0, y = 0;
		if ("x" in anchor) {
			x = anchor.x;
			if (typeof x != "number" || !Number.isInteger(x)) throw new TypeError("Invalid anchor.");
		}
		if ("y" in anchor) {
			y = anchor.y;
			if (typeof y != "number" || !Number.isInteger(y)) throw new TypeError("Invalid anchor.");
		}
		pointPosition(style, width, height, x, y, true, true, forceHorizontal, forceVertical);
	}
}
var context = null;
function showMenu(list, anchor = undefined, onClose = undefined, darkStyle = false, keyboardMode = false, enforcePositioning = { horizontal: false, vertical: false }) {
	if (arguments.length < 1) throw new TypeError("Failed to execute 'showMenu': 1 argument required, but only 0 present.");
	if (arguments.length > 1 && !(anchor instanceof Object)) throw new TypeError("Failed to execute 'showMenu': Argument 'anchor' is not an object.");
	if (!(enforcePositioning instanceof Object)) throw new TypeError("Failed to execute 'showMenu': Argument 'enforcePositioning' is not an object.");
	deposeMenu();
	const { element, maxItemWidth, itemsHeight, itemsList } = buildList(list, darkStyle, 0);
	context = {
		levels: [{ itemsList, element }],
		currentLevel: 0
	};
	measureMenu(element.style, maxItemWidth, itemsHeight, anchor, enforcePositioning);
	element.addEventListener("click", itemClickEvent);
	element.addEventListener("change", itemClickEvent);
	element.addEventListener("contextmenu", preventEvent);
	document.body.appendChild(element);
	addGlobalListener();
	work(element);
}
function preventEvent(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
}
function itemClickEvent(event) {
	console.log(event.type, event.target);
	if (event.target.className == "context-menu-item") deposeMenu();
	event.stopPropagation();
}
function globalClickEvent(event) {
	if (!context.levels[0].element.contains(event.target)) deposeMenu();
}
function work(root) {

}
function addGlobalListener() {
	window.addEventListener("blur", deposeMenu);
	document.addEventListener("click", globalClickEvent, { capture: true });
}
function removeGlobalListener() {
	window.removeEventListener("blur", deposeMenu);
	document.removeEventListener("click", globalClickEvent, { capture: true });
}
function deposeMenu() {
	if (!context) return;
	removeGlobalListener();
	context.levels[0].element.remove();
	context = null;
}
export { showMenu, drawContext };
export default showMenu;