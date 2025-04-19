import Enum from "./Enum.mjs";

class NotOkError extends Error {
	constructor(statusCode) {
		super(`Request failed with status code ${statusCode}.`);
		this.statusCode = statusCode;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class AbortError extends Error {
	constructor(reason) { super(reason) }
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class TimeoutError extends Error {
	constructor(limit) {
		super(`Request timed out after ${limit}ms.`);
		this.limit = limit;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class SendFailedError extends Error {
	constructor(message) { super(message) }
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}

async function parseDocument(response, abortSignal) {
	const text = response.text();
	let contentType = response.headers.get("Content-Type");
	const split = contentType.indexOf(";");
	if (split != -1) contentType = contentType.substring(0, split);
	abortSignal.throwIfAborted();
	// @ts-ignore
	return new DOMParser().parseFromString(await text, contentType);
}

/**
 * @typedef {{abort(...args: any[]): void}} Abortable
 * @typedef {string[][] | Record<string, string> | string | URLSearchParams} URLSearchParamsInit
 * @typedef {string | URL} URLInit
 * @typedef {Readonly<{SOURCE: 0, JSON: 1, TEXT: 2, BLOB: 3, BUFFER: 4, STREAM: 5, DOCUMENT: 6}>} enum_ParseType
 */
/**
 * @type {enum_ParseType}
 * @enum {enum_ParseType[keyof enum_ParseType]}
 */
// @ts-ignore
const ParseType = Enum.fromKeys(["SOURCE", "JSON", "TEXT", "BLOB", "BUFFER", "STREAM", "DOCUMENT"]);

class RequestController {
	#abortController = new AbortController;
	#timeout;
	#request;
	/** 获取请求对象 */
	get request() { return this.#request }
	/** @type {Response} */
	#response = null;
	/** 获取请求的响应对象 */
	get response() { return this.#response }
	#finished = false;
	/** 任务是否已经结束 */
	get finished() { return this.#finished }
	#result;
	get result() { return this.#result }
	/**
	 * 中止当前请求
	 * @param {string} reason 中止原因
	 */
	abort(reason) {
		this.#finished = true;
		this.#abortController.abort(reason);
	}
	/**
	 * @param {URLInit} url
	 * @param {RequestInit} [options]
	 * @param {ParseType} parseType
	 * @param {number} timeout
	 */
	constructor(url, options, parseType = ParseType.SOURCE, timeout = null) {
		if (!(typeof url == "string" || url instanceof URL)) throw new TypeError("The URL was not provided or is invalid.");
		url = new URL(url, location.href);
		const temp = Object.assign({}, options);
		if (!Enum.isValueOf(ParseType, parseType)) throw new TypeError("Unsupported parse type.");
		var signal = this.#abortController.signal;
		if (timeout !== null) {
			timeout = Number(timeout);
			if (!(Number.isFinite(timeout) && timeout > 0)) throw TypeError("Argument 'timeout' must be positive.");
			signal = AbortSignal.any([signal, AbortSignal.timeout(this.#timeout = timeout)]);
		}
		temp.signal = signal;
		this.#request = new Request(url, temp);
		this.#result = this.#fetch(parseType, signal);
	}
	/**
	 * @param {ParseType} parseType
	 * @param {AbortSignal} abortSignal
	 */
	async #fetch(parseType, abortSignal) {
		var response, error;
		try {
			response = this.#response = await fetch(this.#request);
		} catch (errorSource) {
			switch (errorSource.name) {
				case "AbortError":
					error = new AbortError(errorSource.message);
					break;
				case "TimeoutError":
					error = new TimeoutError(this.#timeout);
					break;
				default:
					error = new SendFailedError(errorSource.message);
			}
		}
		if (!response.ok) error = new NotOkError(response.status);
		if (error) {
			this.#finished = true;
			throw error;
		}
		switch (parseType) {
			case ParseType.SOURCE: return this.#finish(response, abortSignal);
			case ParseType.JSON: return this.#finish(response.json(), abortSignal);
			case ParseType.TEXT: return this.#finish(response.text(), abortSignal);
			case ParseType.BLOB: return this.#finish(response.blob(), abortSignal);
			case ParseType.BUFFER: return this.#finish(response.arrayBuffer(), abortSignal);
			case ParseType.STREAM: return this.#finish(response.body, abortSignal);
			case ParseType.DOCUMENT: return this.#finish(parseDocument(response, abortSignal), abortSignal);
		}
	}
	/**
	 * @param {*} finalResult
	 * @param {AbortSignal} abortSignal
	 */
	async #finish(finalResult, abortSignal) {
		var result, error;
		try { result = await finalResult } catch (errorSource) { error = errorSource }
		this.#finished = true;
		if (error) throw error;
		abortSignal.throwIfAborted();
		return result;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}

/**
 * 构建 GET 请求
 * @param {URLInit} url 请求的 URL
 * @param {URLSearchParamsInit} urlParams URL 查询参数
 * @param {ParseType} parseType 解析类型
 * @param {HeadersInit} headers 请求头
 * @param {boolean} allowCache 是否允许缓存
 * @param {number} timeout 超时时间
 * @returns 返回请求控制器实例
 */
function get(url, urlParams = null, parseType = ParseType.SOURCE, headers = null, allowCache = true, timeout = null) {
	if (!(typeof url == "string" || url instanceof URL)) throw new TypeError("The URL was not provided or is invalid.");
	url = new URL(url, location.href);
	if (urlParams) {
		if (!(urlParams instanceof URLSearchParams)) urlParams = new URLSearchParams(urlParams);
		const originalParams = url.searchParams;
		for (const [key, value] of urlParams) originalParams.append(key, value);
	}
	if (!Enum.isValueOf(ParseType, parseType)) throw new TypeError("Unsupported parse type.");
	headers = new Headers(headers ?? undefined);
	if (!allowCache) headers.set("Cache-Control", "no-store");
	return new RequestController(url, { headers }, parseType, timeout);
}

/**
 * 构建 POST 请求
 * @param {URLInit} url 请求的URL
 * @param {BodyInit} body 请求体
 * @param {ParseType} parseType 解析类型
 * @param {HeadersInit} headers 请求头
 * @param {URLSearchParamsInit} urlParams URL查询参数
 * @param {boolean} allowCache 是否允许缓存，默认不允许
 * @param {number} timeout 超时时间
 * @returns 返回请求控制器实例
 */
function post(url, body = null, parseType = ParseType.SOURCE, headers = null, urlParams = null, allowCache = false, timeout = null) {
	if (!(typeof url == "string" || url instanceof URL)) throw new TypeError("The URL was not provided or is invalid.");
	url = new URL(url, location.href);
	if (urlParams) {
		if (!(urlParams instanceof URLSearchParams)) urlParams = new URLSearchParams(urlParams);
		const originalParams = url.searchParams;
		for (const [key, value] of urlParams) originalParams.append(key, value);
	}
	if (!Enum.isValueOf(ParseType, parseType)) throw new TypeError("Unsupported parse type.");
	headers = new Headers(headers ?? undefined);
	if (!allowCache) headers.set("Cache-Control", "no-store");
	return new RequestController(url, { method: "POST", headers, body }, parseType, timeout);
}

const stylesheetSkipAttributes = ["href", "rel", "type"];

class LoadRequestController extends RequestController {
	/**
	 * @type {{
	 *     selector: string,
	 *     process(element: Element, allowCache: boolean): {request: Abortable, mission: Promise<any>},
	 *     [others: string]: any
	 * }[]}
	 */
	static resourceTypes = [
		{
			selector: "script[src]",
			/** @param {HTMLScriptElement} element */
			process(element, allowCache) {
				if (element.type == "module") {
					const abortController = new AbortController,
						{ promise, reject } = Promise.withResolvers();
					abortController.signal.addEventListener("abort", reject);
					return { request: abortController, mission: Promise.race([promise, import(element.src)]) };
				} else {
					const request = get(element.src, undefined, ParseType.TEXT, undefined, allowCache);
					return { request, mission: this.load(request.result, element) };
				}
			},
			async load(result, element) {
				const temp = document.createElement("script");
				temp.textContent = await result;
				for (const attribute of element.attributes)
					if (attribute.name != "src")
						temp.setAttribute(attribute.name, attribute.value);
				element.replaceWith(temp);
			}
		},
		{
			selector: "link[rel=stylesheet]",
			/** @param {HTMLLinkElement} element  */
			process(element, allowCache) {
				const request = get(element.href, undefined, ParseType.TEXT, undefined, allowCache);
				return { request, mission: this.load(request.result, element) };
			},
			async load(result, element) {
				const temp = document.createElement("style");
				temp.textContent = await result;
				for (let attribute of element.attributes)
					if (!stylesheetSkipAttributes.includes(attribute.name))
						temp.setAttribute(attribute.name, attribute.value);
				element.replaceWith(temp);
			}
		}
	];
	/** @type {Abortable[]} */
	#subRequests = null;
	#finished = false;
	get finished() { return this.#finished }
	#result;
	get result() { return this.#result }
	constructor(url, allowCache) {
		allowCache = Boolean(allowCache);
		super(url, allowCache ? undefined : { headers: { "Cache-Control": "no-store" } }, ParseType.DOCUMENT);
		this.#result = this.#fetch(allowCache);
	}
	abort(reason) {
		this.#finished = true;
		super.abort(reason);
		const subRequests = this.#subRequests;
		if (subRequests)
			for (const request of this.#subRequests) request.abort(reason);
	}
	async #fetch(allowCache) {
		/** @type {Document} */
		var document;
		try {
			document = await super.result;
		} catch (error) {
			this.#finished = true;
			throw error;
		}
		/** @type {Abortable[]} */
		const subRequests = this.#subRequests = [], missions = [],
			signal = super.request.signal
		for (const type of LoadRequestController.resourceTypes) {
			for (const element of document.querySelectorAll(type.selector)) {
				const process = type.process(element, allowCache);
				if (!process) continue;
				subRequests.push(process.request);
				missions.push(process.mission);
			}
		}
		const results = await Promise.allSettled(missions);
		this.#finished = true;
		signal.throwIfAborted();
		for (const result of results)
			if (result.status == "rejected")
				console.warn("Failed to load resource: ", result.reason);
		return document;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
		Object.defineProperty(this, "resourceTypes", {
			writable: false,
			configurable: false,
			enumerable: true
		});
	}
}

/**
 * 加载文档资源
 * @param {string} url 要加载的文档URL
 * @param {boolean} preloadResources 是否预载相关资源
 * @param {boolean} allowCache 是否允许使用缓存
 * @returns 文档请求控制器对象
 */
function loadDocument(url, preloadResources = true, allowCache = true) {
	return preloadResources ? new LoadRequestController(url, allowCache) : get(url, undefined, ParseType.DOCUMENT, undefined, allowCache);
}

export { get, post, loadDocument, ParseType, AbortError, NotOkError, SendFailedError, RequestController, LoadRequestController };