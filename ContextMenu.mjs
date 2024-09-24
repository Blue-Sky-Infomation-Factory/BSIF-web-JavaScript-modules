import { EVENT_LISTENERS, OBJECT_PROPERTIES, parseAndGetNodes } from "./ArrayHTML.mjs";
const font = "12px ui-sans-serif",
	drawContext = document.createElement("canvas").getContext("2d"),
	resizeObserver = new ResizeObserver(deposeMenu),
	horizontalParam = ["left", "right"],
	verticalParam = ["top", "bottom"];
drawContext.font = font;
const { layer, shadow } = parseAndGetNodes([["div", [["#shadow", [
	["style", [
		":host{position:fixed;z-index:1610612736;left:0;top:0;width:100%;height:100%;pointer-events:none}",
		`.context-menu-list{position:fixed;pointer-events:all;min-width:64px;max-width:min(384px, 100%);max-height:100%;overflow:hidden auto;box-sizing:border-box;border-radius:8px;border:solid 1px #DDD;padding:3px;background-color:#FFF;box-shadow:2px 2px 4px 0 #00000040;font:${font};display:grid;gap:4px;outline:0;user-select:none}`,
		".context-menu-item{grid-template-columns:28px auto 1fr 28px;grid-template-areas:\"icon text keys symbol\";gap:8px;border-radius:4px;border:0;padding:0;background-color:transparent;cursor:pointer;color:inherit;font-size:inherit;text-align:initial}",
		".context-menu-item>*{pointer-events:none}",
		".context-menu-empty{opacity:0.5;place-content:center}",
		".context-menu-item>span,.context-menu-empty>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
		".context-menu-item,.context-menu-empty{height:28px;display:grid}",
		".context-menu-item.collection::after{content:\"\";width:4px;height:8px;background-color:#000;grid-area:symbol;place-self:center;clip-path:polygon(0 0, 100% 50%, 0 100%)}",
		".context-menu-item:focus,.context-menu-item:focus-within,.context-menu-list:not(:focus-within)>.context-menu-item:hover,.context-menu-item.collection.active{background-color:#D3DFE9}",
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
], { mode: "closed" }, "shadow"]], { id: "context-menu-layer" }, "layer"]], document.body);
function buildList(list, darkStyle) {
	if (!Array.isArray(list)) throw new TypeError("Failed to execute 'buildList': Argument 'list' must be an array.");
	const temp = [], length = list.length, subLists = [], callbacks = [];
	if (!length) {
		return {
			maxItemWidth: buildEmpty(temp) + 8,
			element: parseAndGetNodes([["div", temp, { class: darkStyle ? "context-menu-list dark" : "context-menu-list" }, "element"]]).nodes.element,
			itemsHeight: 36,
			itemsList: [],
			callbacks,
			subLists
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
				itemWidth = buildItem(item, temp, callbacks);
				break;
			case "check-item":
				itemWidth = buildCheckItem(item, temp, callbacks);
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
					itemWidth = buildGroup(list, temp, callbacks, subLists);
					itemsHeight += (length - 1) * 32;
				} else {
					itemWidth = buildEmpty(temp);
				}
				insertHr = true;
				break;
			}
			case "sub-list":
				itemWidth = buildSubList(item, temp, subLists);
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
		itemsList,
		callbacks,
		subLists
	}
}
function buildKeys(data, callbackData) {
	if (!(data instanceof Object)) throw new TypeError("Failed to execute 'buildKeys': Property 'keys' of item is not an object.");
	const key = data.key;
	if (typeof key != "string" || !key) throw new Error("Failed to execute 'buildKeys': Property 'keys' of object must be a non-empty string.")
	callbackData.key = key.toLowerCase();
	const keys = [];
	if (callbackData.ctrl = Boolean(data.ctrl)) keys.push("Ctrl");
	if (callbackData.alt = Boolean(data.alt)) keys.push("Alt");
	if (callbackData.shift = Boolean(data.shift)) keys.push("Shift");
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
function buildItem(data, temp, callbacks) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildItem': Property 'text' of item is not a string.");
	var keysWidth = 0, keyText = null, callback;
	if ("keys" in data) keysWidth = drawContext.measureText(keyText = buildKeys(data.keys, callback = { shortcut: true })).actualBoundingBoxRight;
	const properties = { class: "context-menu-item", [EVENT_LISTENERS]: [["pointerenter", itemMouseInEvent], ["pointerleave", itemMouseOutEvent]] };
	if ("onselect" in data) {
		const onselect = data.onselect;
		if (typeof onselect != "function") throw new TypeError("Failed to execute 'buildItem': Property 'onselect' of item is not a function.");
		if (callback) { callback.callback = onselect } else callback = { shortcut: false, callback: onselect };
	}
	if (callback) {
		properties["data-callback"] = callbacks.length;
		callbacks.push(callback);
	}
	temp.push(["button", [
		"icon" in data ? buildIcon(data.icon) : null,
		["span", text, { class: "context-menu-item-text" }],
		keyText ? ["span", keyText, { class: "context-menu-item-keys" }] : null
	], properties, "list", true]);
	return drawContext.measureText(text).actualBoundingBoxRight + keysWidth + 80;
}
function buildCheckItem(data, temp, callbacks) {
	const text = data.text;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildCheckItem': Property 'text' of item is not a string.");
	var keysWidth = 0, keyText = null, callback;
	if ("keys" in data) keysWidth = drawContext.measureText(keyText = buildKeys(data.keys, callback = { shortcut: true })).actualBoundingBoxRight;
	const properties = { class: "context-menu-item", [EVENT_LISTENERS]: [["pointerenter", itemMouseInEvent], ["pointerleave", itemMouseOutEvent]] },
		checked = Boolean(data.checked), id = data.id;
	if ("onselect" in data) {
		let onselect = data.onselect;
		if (typeof onselect != "function") throw new TypeError("Failed to execute 'buildCheckItem': Property 'onselect' of item is not a function.");
		onselect = onselect.bind(null, !checked, id);
		if (callback) { callback.callback = onselect } else callback = { shortcut: false, callback: onselect };
	}
	if (callback) {
		properties["data-callback"] = callbacks.length;
		callbacks.push(callback);
	}
	temp.push(["button", [
		["input", null, { class: "context-menu-item-checkbox", type: "checkbox", [OBJECT_PROPERTIES]: { checked } }],
		["span", text, { class: "context-menu-item-text" }],
		keyText ? ["span", keyText, { class: "context-menu-item-keys" }] : null
	], properties, "list", true]);
	return drawContext.measureText(text).actualBoundingBoxRight + keysWidth + 80;
}
function buildSubList(data, temp, subLists) {
	const { text, list } = data;
	if (typeof text != "string") throw new TypeError("Failed to execute 'buildSubList': Property 'text' of item is not a string.");
	if (!Array.isArray(list)) throw new TypeError("Failed to execute 'buildSubList': Property 'list' of item is not an array.");
	temp.push(["button", [
		"icon" in data ? buildIcon(data.icon) : null,
		["span", text, { class: "context-menu-item-text" }]
	], { class: "context-menu-item collection", "data-sub": subLists.length, [EVENT_LISTENERS]: [["pointerenter", subMouseInEvent], ["pointerleave", itemMouseOutEvent]] }, "list", true]);
	subLists.push(list);
	return drawContext.measureText(text).actualBoundingBoxRight + 80;
}
function buildGroup(data, temp, callbacks, subLists) {
	var maxItemWidth = 0;
	for (const item of data) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'buildGroup': Elements of list must be objects.");
		let width;
		switch (item.type) {
			case "item":
				width = buildItem(item, temp, callbacks);
				break;
			case "check-item":
				width = buildCheckItem(item, temp, callbacks);
				break;
			case "sub-list":
				width = buildSubList(item, temp, subLists);
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
	const { clientWidth: viewWidth, clientHeight: viewHeight } = layer;
	if (x < 0) { x = 0 } else if (x > viewWidth) x = viewWidth;
	if (y < 0) { y = 0 } else if (y > viewHeight) y = viewHeight;
	const right = viewWidth - x, bottom = viewHeight - y;
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
	const { clientWidth: viewWidth, clientHeight: viewHeight } = layer;
	var { top, bottom, left, right } = anchorElement.getBoundingClientRect();
	if ((top -= marginY) < 0) { top = 0 } else if (top > viewHeight) top = viewHeight;
	if ((bottom += marginY) < 0) { bottom = 0 } else if (bottom > viewHeight) bottom = viewHeight;
	if ((left -= marginX) < 0) { left = 0 } else if (left > viewWidth) left = viewWidth;
	if ((right += marginX) < 0) { right = 0 } else if (right > viewWidth) right = viewWidth;
	const rightSpace1 = viewWidth - left, rightSpace2 = viewWidth - right,
		bottomSpace1 = viewHeight - top, bottomSpace2 = viewHeight - bottom;
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
function showMenu(list, anchor = undefined, onClose = null, darkStyle = false, keyboardMode = false, enforcePositioning = { horizontal: false, vertical: false }) {
	if (arguments.length < 1) throw new TypeError("Failed to execute 'showMenu': 1 argument required, but only 0 present.");
	if (arguments.length > 1 && !(anchor instanceof Object)) throw new TypeError("Failed to execute 'showMenu': Argument 'anchor' is not an object.");
	if (arguments.length > 2 && onClose && typeof onClose != "function") throw new TypeError("Failed to execute 'showMenu': Argu ment 'onClose' is not a function.");
	if (!(enforcePositioning instanceof Object)) throw new TypeError("Failed to execute 'showMenu': Argument 'enforcePositioning' is not an object.");
	deposeMenu();
	const topLevel = buildList(list, darkStyle = Boolean(darkStyle)), element = topLevel.element, route = new WeakMap;
	context = { levels: [topLevel], route, currentLevel: 0, focus: null, darkStyle, onClose, resize: false };
	route.set(element, topLevel);
	measureMenu(element.style, topLevel.maxItemWidth, topLevel.itemsHeight, anchor, enforcePositioning);
	delete topLevel.maxItemWidth;
	delete topLevel.itemsHeight;
	element.addEventListener("click", itemClickEvent);
	element.addEventListener("contextmenu", preventEvent);
	shadow.appendChild(element);
	document.activeElement.blur();
	addGlobalListener();
	const items = topLevel.itemsList;
	if (keyboardMode && items.length) (context.focus = items[0]).focus();
}
function showNext(element, subList, keyboardMode = false) {
	try {
		var level = buildList(subList, context.darkStyle);
	} catch (error) {
		deposeMenu();
		console.error("An error occurred while rendering sub menu, system exited.\n", error);
		return;
	}
	const body = level.element;
	measureMenu(level.element.style, level.maxItemWidth, level.itemsHeight, { side: "right", align: "top", element, marginX: 4, marginY: 4 }, { horizontal: false, vertical: false });
	delete level.maxItemWidth;
	delete level.itemsHeight;
	level.super = element;
	context.levels.push(level);
	context.route.set(body, level);
	++context.currentLevel;
	element.classList.add("active");
	element.parentElement.appendChild(body);
	const items = level.itemsList;
	if (keyboardMode && items.length) (context.focus = items[0]).focus();
}
function deposeSub(index) {
	const levels = context.levels,
		level = levels[index],
		element = level.element;
	level.super.classList.remove("active");
	element.remove();
	levels.splice(index);
	context.currentLevel = index - 1;
}
function preventEvent(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
}
function itemClickEvent(event) {
	const target = event.target,
		classList = target.classList;
	event.stopPropagation();
	if (!classList.contains("context-menu-item")) return;
	if (classList.contains("collection")) {
		context.focus = target;
		const index = context.levels.indexOf(context.route.get(target.parentElement));
		if (target.classList.contains("active")) {
			if (event.pointerType) target.blur();
			deposeSub(index + 1);
		} else {
			if (index < context.currentLevel) deposeSub(index + 1);
			showNext(target, context.route.get(target.parentElement).subLists[target.dataset.sub], !event.pointerType);
		}
	} else {
		const callback = context.route.get(target.parentElement).callbacks[target.dataset.callback]?.callback;
		deposeMenu();
		if (callback) callback();
	}
}
function itemMouseInEvent(event) {
	context.focus?.blur();
	const target = event.target,
		index = context.levels.indexOf(context.route.get(target.parentElement))
	if (index < context.currentLevel) deposeSub(index + 1);
	context.focus = target;
}
function itemMouseOutEvent() {
	context.focus?.blur();
	context.focus = null;
}
function subMouseInEvent(event) {
	const target = event.target,
		index = context.levels.indexOf(context.route.get(target.parentElement))
	if (index < context.currentLevel) deposeSub(index + 1);
	context.focus?.blur();
	context.focus = target;
	if (target.classList.contains("active")) return;
	showNext(target, context.route.get(target.parentElement).subLists[target.dataset.sub]);
}
function globalClickEvent(event) { if (event.target != layer) deposeMenu() }
function keyboardMove(direction) {
	const lastFocus = context.focus;
	if (lastFocus) {
		const level = context.route.get(lastFocus.parentElement),
			list = level.itemsList;
		let index = context.levels.indexOf(level);
		if (index < context.currentLevel) deposeSub(index + 1);
		index = list.indexOf(lastFocus);
		if (direction) {
			if (++index > list.length - 1) index = 0;
		} else if (--index < 0) index = list.length - 1;
		const target = list[index];
		(context.focus = target).focus();
	} else {
		const list = context.levels[context.currentLevel].itemsList, length = list.length;
		if (!length) return;
		const target = list[direction ? 0 : length - 1];
		(context.focus = target).focus();
	}
}
function keyboardBack(index) {
	(context.focus = context.levels[index].super).focus();
	deposeSub(index);
}
function keyboardEvent(event) {
	const { key, ctrlKey, altKey, shiftKey } = event;
	if (key == "Tab") event.preventDefault();
	const levels = context.levels;
	for (let i = levels.length - 1; i > -1; --i) for (const item of levels[i].callbacks) {
		const callback = item.callback;
		if (item.shortcut && callback && item.ctrl == ctrlKey && item.alt == altKey && item.shift == shiftKey && item.key == key.toLowerCase()) {
			event.preventDefault();
			deposeMenu();
			callback();
			return;
		}
	}
	if (ctrlKey || altKey || shiftKey) return;
	var preventDefault = true;
	switch (key) {
		case "ArrowUp":
			keyboardMove(false);
			break;
		case "ArrowDown":
			keyboardMove(true);
			break;
		case "ArrowLeft": {
			let level = context.currentLevel
			if (level) {
				keyboardBack(level);
			} else {
				const list = context.levels[0].itemsList;
				if (!list.length || list.includes(context.focus)) break;
				(context.focus = list[0]).focus();
			}
			break;
		}
		case "ArrowRight": {
			const lastFocus = context.focus,
				sub = lastFocus?.dataset.sub;
			if (lastFocus && sub && !lastFocus.classList.contains("active")) {
				showNext(lastFocus, context.route.get(lastFocus.parentElement).subLists[sub], true);
			} else {
				const list = context.levels[context.currentLevel].itemsList;
				if (!list.length || list.includes(lastFocus)) break;
				(context.focus = list[0]).focus();
			}
			break;
		}
		case "Escape": {
			let level = context.currentLevel
			if (level) { keyboardBack(level) } else deposeMenu();
			break;
		}
		case "Enter": {
			const lastFocus = context.focus;
			if (lastFocus && document.activeElement != lastFocus) {
				lastFocus.click();
				break;
			}
		}
		default:
			preventDefault = false;
	}
	if (preventDefault) event.preventDefault();
}
function addGlobalListener() {
	window.addEventListener("blur", deposeMenu);
	document.addEventListener("scroll", deposeMenu, { capture: true, once: true, passive: true });
	document.addEventListener("pointerdown", globalClickEvent, { capture: true });
	document.addEventListener("keydown", keyboardEvent, { capture: true });
	resizeObserver.observe(layer);
}
function removeGlobalListener() {
	window.removeEventListener("blur", deposeMenu);
	document.removeEventListener("scroll", deposeMenu, { capture: true });
	document.removeEventListener("pointerdown", globalClickEvent, { capture: true });
	document.removeEventListener("keydown", keyboardEvent, { capture: true });
	resizeObserver.unobserve(layer);
}
function deposeMenu(e) {
	if (!context) return;
	if (Array.isArray(e) && !context.resize) {
		context.resize = true;
		return;
	}
	removeGlobalListener();
	context.levels[0].element.remove();
	const onClose = context.onClose;
	if (onClose) queueMicrotask(onClose);
	context = null;
}
function closeMenu() { deposeMenu() }
export { showMenu, closeMenu };
export default showMenu;