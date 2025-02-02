import IndexedDatabase from "./IndexedDatabase.mjs";
import "./PromiseWithResolvers.mjs";
class DynamicIndexedDatabase {
	static #checkInstance(instance) { if (!(instance instanceof this)) throw new TypeError("Illegal invocation") }
	#db;
	static #rejectConstruct = true;
	constructor(db) {
		if (DynamicIndexedDatabase.#rejectConstruct) throw new TypeError("Illegal constructor");
		DynamicIndexedDatabase.#rejectConstruct = true;
		this.#db = db;
	}
	static #pool = new WeakMap;
	static async open(name) {
		if (arguments.length < 1) throw new TypeError("Failed to execute 'open': 1 argument required, but only 0 present.");
		if (typeof name != "string") throw new TypeError("Failed to execute 'open': Argument 'name' is not a string.");
		const db = await IndexedDatabase.open(name), pool = this.#pool, cache = pool.get(db);
		if (cache) return cache;
		DynamicIndexedDatabase.#rejectConstruct = false;
		const instance = new DynamicIndexedDatabase(db);
		pool.set(db, instance);
		return instance;
	}
	#queue = [];
	#processing = false;
	initialStore(name, configure) {
		DynamicIndexedDatabase.#checkInstance(this);
		if (typeof name != "string") throw new TypeError("Failed to execute 'initialStore' on 'DynamicIndexedDatabase': Argument 'name' is not a string.");
		if (typeof configure != "function") throw new TypeError("Failed to execute 'initialStore' on 'DynamicIndexedDatabase': Argument 'configure' is not a function.");
		const adapter = Promise.withResolvers();
		this.#queue.push({ adapter, name, configure });
		this.#process();
		return adapter.promise;
	}
	async #process() {
		if (this.#processing) return;
		this.#processing = true;
		const database = this.#db, queue = this.#queue;
		while (queue.length) {
			const { name, configure, adapter: { resolve, reject } } = queue.shift();
			try {
				if (!database.objectStoreNames.contains(name)) await database.restart(database.version + 1, configure);
				resolve(database.getObjectStore(name));
			} catch (e) { reject(e) }
		}
		this.#processing = false;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}

export default DynamicIndexedDatabase;
export { DynamicIndexedDatabase };