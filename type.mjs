const ObjectPrototype = Object.prototype;
function isObject(value) {
	const type = typeof value;
	return type == "object" && value !== null || type == "function";
}
function isObjectType(value) { return value instanceof Object }
function isPlainObject(value) { return Object.getPrototypeOf(value) == ObjectPrototype }
export { isObject, isObjectType, isPlainObject }