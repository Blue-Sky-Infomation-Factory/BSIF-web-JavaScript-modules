const EVENT_LISTENERS = Symbol("event listeners"), OBJECT_PROPERTIES = Symbol("object properties");
function parseCollection(data, outer, collector) {
	if (!Array.isArray(data)) throw new TypeError("Parse error: Non-Array object");
	for (let item of data) {
		switch (typeof item) {
			case "string":
			case "number":
			case "bigint":
			case "boolean":
				outer.appendChild(document.createTextNode(item));
				break;
			case "object":
				if (!item) break;
				if (item instanceof Node) {
					outer.appendChild(item);
					break;
				}
				parseNode(item, outer, collector)
			default:
		}
	}
}
function parseStyleObject(element, object) {
	const styleObject = element.style;
	for (let index in object) styleObject[index] = [object[index]];
}
function parseAttribute(element, attributeName, data) {
	switch (attributeName) {
		case "style":
			if (data instanceof Object) {
				parseStyleObject(element, data);
				return;
			}
			break;
		case "class":
			element.setAttribute("class", Array.isArray(data) ? data.join(" ") : data);
			return;
		default:
	}
	element.setAttribute(attributeName, data);
}
function parseContent(node, content, collector) {
	switch (typeof content) {
		case "string":
		case "number":
		case "bigint":
		case "boolean":
			node.innerText = content;
			return;
		case "object":
			if (!content) return;
			if (content instanceof Node) {
				node.appendChild(content);
				return;
			}
			parseCollection(content, node, collector);
		default:
	}
}
function parseNode(data, outer, collector) {
	if (!Array.isArray(data)) throw new TypeError("Parse error: Non-Array object");
	var content = data[1], node;
	switch (data[0]) {
		case "#comment":
			outer.appendChild(node = document.createComment(content));
			break;
		case "#text":
			outer.appendChild(node = document.createTextNode(content));
			break;
		case "#shadow":
			if (!(outer instanceof Element)) throw new TypeError("Container is not an Element.");
			try {
				node = outer.attachShadow(data[2])
			} catch (error) {
				console.warn("Parse error: Failed to attach shadow DOM\n", data, "\non", outer, `\n${error.name}: ${error.message}`);
				return;
			}
			parseContent(node, content, collector);
			break;
		default: {
			outer.appendChild(node = document.createElement(data[0]));
			const attributes = data[2]
			if (attributes instanceof Object) {
				for (const attribute in attributes) try { parseAttribute(node, attribute, attributes[attribute]) } catch (error) { console.warn("Parse error: Failed to set attribute", attribute, "to", attributes[attribute], "on", node, `\n${error.name}: ${error.message}`) };
				if (EVENT_LISTENERS in attributes) for (const item of attributes[EVENT_LISTENERS]) node.addEventListener(...item);
				if (OBJECT_PROPERTIES in attributes) Object.assign(node, attributes[OBJECT_PROPERTIES]);
			}
			parseContent(node, content, collector);
		}
	}
	if ("3" in data && collector) {
		const name = data[3];
		if (data[4]) {
			const array = Object.hasOwn(collector, name) ? collector[name] : collector[name] = [];
			if (!Array.isArray(array)) throw new Error(`Name '${name}' is specified as both array and single node.`);
			array.push(node);
		} else {
			if (Object.hasOwn(collector, name)) throw new Error(`Name '${name}' got multi node but was not specified as an array.`);
			collector[name] = node;
		}
	}
}
function parse(ArrayHTML) {
	const documentFragment = document.createDocumentFragment();
	parseCollection(ArrayHTML, documentFragment);
	return documentFragment;
}
function parseAndGetNodes(ArrayHTML, appendTo) {
	if (arguments.length > 1 && !(appendTo instanceof Node)) throw new TypeError("Failed to execute 'parseAndGetNodes': Argument 'appendTo' is not type of Node.");
	const nodes = {}, documentFragment = document.createDocumentFragment();
	parseCollection(ArrayHTML, documentFragment, nodes);
	if (appendTo) {
		appendTo.appendChild(documentFragment);
		return nodes;
	}
	return { documentFragment, nodes };
}
function serializeIterator(node, outer) {
	if (node.nodeName == "#text") {
		outer.push(node.textContent);
	} else for (let child of node.childNodes) serializeNode(child, outer);
}
function serializeNode(node, outer) {
	switch (node.nodeName) {
		case "#text":
			outer.push(node.textContent);
			break;
		case "#comment":
			outer.push(["#comment", node.textContent]);
			break;
		case "#document":
			serializeIterator(node, outer);
		case "html":
			break;
		default: {
			let child = [node.localName];
			try {
				if (node.hasAttributes()) {
					const attributes = child[2] = {};
					for (let attribute of node.attributes) attributes[attribute.name] = attribute.value;
				}
			} catch (error) { console.warn("Serialize exception: Failed to get attributes of node", node) }
			if (node.hasChildNodes()) serializeIterator(node, child[1] = []);
			outer.push(child);
		}
	}
}
function serialize(node, onlyChildren = false) {
	if (!(node instanceof Node)) throw new TypeError("Serialize failed: Argument 'node' is not type of Node");
	const ArrayHtml = [];
	if (onlyChildren) { serializeIterator(node, ArrayHtml) } else { serializeNode(node, ArrayHtml) }
	return ArrayHtml;
}
export { parse, serialize, parseAndGetNodes, EVENT_LISTENERS, OBJECT_PROPERTIES }