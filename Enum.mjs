const regexp = /^[A-Za-z_]\w*$/, validValueTypes = ["number", "string", "symbol"];
class Enum {
	#keysMapping = new Map;
	constructor(source) {
		if (arguments.length < 1) throw new TypeError("Failed to construct 'Enum': 1 arguments required, but only 0 present.");
		if (!(source instanceof Object)) throw new TypeError("Failed to construct 'Enum': Argument 'source' is not an object.");
		const keys = Object.keys(source);
		if (!keys.length) throw new TypeError("Failed to construct 'Enum': Cannot find keys in source.");
		const type = typeof source[keys[0]];
		if (!validValueTypes.includes(type)) throw new TypeError("Failed to construct 'Enum': Type of values must be one of number, string, symbol.");
		const keysMapping = this.#keysMapping;
		for (const key of keys) {
			if (!key.match(regexp)) throw new Error(`Failed to construct 'Enum': Invalid key '${key}'.`);
			if (key in this) throw new Error(`Failed to construct 'Enum': Duplicate key '${key}'.`);
			const value = source[key], valueType = typeof value;
			if (valueType != type) throw new Error(`Failed to construct 'Enum': Type of values must be same.`);
			if (keysMapping.has(value)) throw new Error(`Failed to construct 'Enum': Duplicate value ${value}.`);
			keysMapping.set(this[key] = value, key);
		}
		Object.freeze(this);
	}
	static keyOf(instance, value) {
		if (arguments.length < 2) throw new TypeError(`Failed to execute 'keyOf': 2 arguments required, but only ${arguments.length} present.`);
		if (!(instance instanceof Enum)) throw new TypeError("Failed to execute 'keyOf': Argument 'instance' is not an enum.");
		const type = typeof value;
		if (!validValueTypes.includes(type)) throw new TypeError("Failed to execute 'keyOf': Type of value must be one of number, string, symbol.");
		return instance.#keysMapping.get(value);
	}
	static isValueOf(instance, value) {
		if (arguments.length < 2) throw new TypeError(`Failed to execute 'isValueOf': 2 arguments required, but only ${arguments.length} present.`);
		if (!(instance instanceof Enum)) throw new TypeError("Failed to execute 'isValueOf': Argument 'instance' is not an enum.");
		const type = typeof value;
		if (!validValueTypes.includes(type)) throw new TypeError("Failed to execute 'isValueOf': Type of value must be one of number, string, symbol.");
		return instance.#keysMapping.has(value);
	}
	static fromKeys(array, useSymbol = false) {
		if (arguments.length < 1) throw new TypeError("Failed to execute 'fromKeys': 1 arguments required, but only 0 present.");
		if (!Array.isArray(array)) throw new TypeError("Failed to execute 'fromKeys': Argument 'array' is not an array.");
		const source = {};
		for (let i = 0, l = array.length; i < l; ++i) {
			const key = array[i];
			if (!(typeof key == "string" && key.match(regexp))) throw new TypeError(`Failed to execute 'fromKeys': Invalid element at [${i}].`);
			if (Object.hasOwn(source, key)) throw new Error(`Failed to execute 'fromKeys': Duplicate element at [${i}].`);
			source[key] = useSymbol ? Symbol(key) : i;
		}
		return new Enum(source);
	}
	static {
		this.prototype[Symbol.toStringTag] = "Enum";
		Object.freeze(Object.setPrototypeOf(this.prototype, null));
	}
}
export { Enum };
export default Enum;