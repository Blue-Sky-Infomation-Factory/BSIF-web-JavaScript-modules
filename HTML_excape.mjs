import Enum from "./Enum.mjs";

const contentEscapeMapping = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	" ": "&nbsp;",
	"\t": "&#9;",
	"\n": "<br>"
}, attributeEscapeMapping = {
	"&": "&amp;",
	'"': "&quot;",
	"'": "&#39;",
	"\n": "&#10;"
}, commonContentMatcher = /[&<> \t\n]/g,
	preWrapContentMatcher = /[&<>]/g,
	attributeMatcher = /[&"'\n]/g;

/** @param {string} character */
function contentReplacer(character) { return contentEscapeMapping[character] }
/** @param {string} character */
function attributeReplacer(character) { return attributeEscapeMapping[character] }

/**
 * @enum {number}
 * @type {{CONTENT:0, PRE_WRAP_CONTENT:1, ATTRIBUTE:2}}
 */
// @ts-ignore
const TYPE = new Enum(["CONTENT", "PRE_WRAP_CONTENT", "ATTRIBUTE"]);

/**
 * @param {string} string
 * @param {TYPE} type
 */
function escape(string, type = TYPE.CONTENT) {
	if (typeof string != "string") throw new TypeError("Argument 'string' is not a string.");
	switch (type) {
		case 0: return string.replace(commonContentMatcher, contentReplacer);
		case 1: return string.replace(preWrapContentMatcher, contentReplacer);
		case 2: return string.replace(attributeMatcher, attributeReplacer);
		default: throw new TypeError("Invalid escape type parameter.");
	}
}

export default escape;
export { escape, TYPE };