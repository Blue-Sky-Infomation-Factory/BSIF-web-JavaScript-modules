import Enum from "./Enum.mjs";

class NotOkError extends Error {
	name = this.constructor.name;
	/** @param {number} statusCode */
	constructor(statusCode) {
		super(`The request failed with status code ${statusCode}.`);
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
	name = this.constructor.name;
	/** @param {any} reason */
	constructor(reason) {
		super("The request aborted due to the abort() method being called.");
		this.reason = reason;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class TimeoutError extends Error {
	name = this.constructor.name;
	/** @param {number} timeout */
	constructor(timeout) {
		super(`The request timed out after ${timeout}ms.`);
		this.timeout = timeout;
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}
class SendFailedError extends Error {
	name = this.constructor.name;
	/** @param {string} message */
	constructor(message) { super(message) }
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}

/**
 * @param {Response} response
 * @param {AbortSignal} abortSignal
 */
async function parseDocument(response, abortSignal) {
	const text = await response.text();
	abortSignal.throwIfAborted();
	const contentType = response.headers.get("Content-Type"), split = contentType.indexOf(";");
	// @ts-ignore
	return new DOMParser().parseFromString(text, split == -1 ? contentType : contentType.substring(0, split));
}

/**
 * @param {Response} response
 * @param {AbortSignal} abortSignal
 */
async function parseFragment(response, abortSignal) {
	const text = await response.text();
	abortSignal.throwIfAborted();
	return document.createRange().createContextualFragment(text);
}

/**
 * @this {AbortSignal}
 * @param {(reason: any)=>void} reject 
 */
function onAborted(reject) { reject(this.reason) }

/**
 * @param {Promise<any>} source
 * @param {AbortSignal} signal
 */
function wrapResult(source, signal) {
	const { promise, reject } = Promise.withResolvers();
	signal.addEventListener("abort", onAborted.bind(signal, reject));
	return Promise.race([source, promise]);
}

/**
 * @typedef {{abort(...args: any[]): void}} Abortable
 * @typedef {string[][] | Record<string, string> | string | URLSearchParams} URLSearchParamsInit
 * @typedef {string | URL} URLInit
 * @typedef {Readonly<{SOURCE: 0, JSON: 1, TEXT: 2, BLOB: 3, BUFFER: 4, STREAM: 5, DOCUMENT: 6, DOCUMENT_FRAGMENT: 7}>} enum_ParseType
 * @typedef {Readonly<{DOCUMENT: 0, FRAGMENT: 1}>} enum_ContextType
 */
/**
 * @type {enum_ParseType}
 * @enum {enum_ParseType[keyof enum_ParseType]}
 */
// @ts-ignore
const ParseType = Enum.fromKeys(["SOURCE", "JSON", "TEXT", "BLOB", "BUFFER", "STREAM", "DOCUMENT", "DOCUMENT_FRAGMENT"]),
	/**
	 * @type {enum_ContextType}
	 * @enum {enum_ContextType[keyof enum_ContextType]}
	 */
	// @ts-ignore
	ContextType = Enum.fromKeys(["DOCUMENT", "FRAGMENT"]);

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
	 * @param {any} [reason] 中止原因
	 */
	abort(reason) { this.#abortController.abort(new AbortError(reason)) }
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
		if (!Enum.isValueOf(ParseType, parseType)) throw new TypeError("Invalid parse type.");
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
	 * @param {AbortSignal} signal
	 */
	async #fetch(parseType, signal) {
		var response;
		try {
			response = this.#response = await fetch(this.#request);
		} catch (error) {
			this.#finished = true;
			switch (error.name) {
				case "AbortError": throw error;
				case "TimeoutError": throw new TimeoutError(this.#timeout);
				default: throw new SendFailedError(error.message);
			}
		}
		if (!response.ok) {
			this.#finished = true;
			throw new NotOkError(response.status);
		}
		try {
			switch (parseType) {
				case ParseType.SOURCE: return response;
				case ParseType.JSON: return await wrapResult(response.json(), signal);
				case ParseType.TEXT: return await wrapResult(response.text(), signal);
				case ParseType.BLOB: return await wrapResult(response.blob(), signal);
				case ParseType.BUFFER: return await wrapResult(response.arrayBuffer(), signal);
				case ParseType.STREAM: return response.body;
				case ParseType.DOCUMENT: return await wrapResult(parseDocument(response, signal), signal);
				case ParseType.DOCUMENT_FRAGMENT: return await wrapResult(parseFragment(response, signal), signal);
			}
		} catch (error) {
			throw error.name == "TimeoutError" ? new TimeoutError(this.#timeout) : error;
		} finally {
			this.#finished = true;
		}
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
 * @param {URLSearchParamsInit} searchParams URL 查询参数
 * @param {ParseType} parseType 解析类型
 * @param {HeadersInit} headers 请求头
 * @param {boolean} allowCache 是否允许缓存
 * @param {number} timeout 超时时间
 * @returns 返回请求控制器实例
 */
function get(url, searchParams = null, parseType = ParseType.SOURCE, headers = null, allowCache = true, timeout = null) {
	if (!(typeof url == "string" || url instanceof URL)) throw new TypeError("The URL was not provided or is invalid.");
	url = new URL(url, location.href);
	if (searchParams) {
		if (!(searchParams instanceof URLSearchParams)) searchParams = new URLSearchParams(searchParams);
		const originalParams = url.searchParams;
		for (const [key, value] of searchParams) originalParams.append(key, value);
	}
	if (!Enum.isValueOf(ParseType, parseType)) throw new TypeError("Invalid parse type.");
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
 * @param {URLSearchParamsInit} searchParams URL 查询参数
 * @param {number} timeout 超时时间
 * @returns 返回请求控制器实例
 */
function post(url, body = null, parseType = ParseType.SOURCE, headers = null, searchParams = null, timeout = null) {
	if (!(typeof url == "string" || url instanceof URL)) throw new TypeError("The URL was not provided or is invalid.");
	url = new URL(url, location.href);
	if (searchParams) {
		if (!(searchParams instanceof URLSearchParams)) searchParams = new URLSearchParams(searchParams);
		const originalParams = url.searchParams;
		for (const [key, value] of searchParams) originalParams.append(key, value);
	}
	if (!Enum.isValueOf(ParseType, parseType)) throw new TypeError("Invalid parse type.");
	headers = new Headers(headers ?? undefined);
	return new RequestController(url, { method: "POST", headers, body }, parseType, timeout);
}

const stylesheetSkipAttributes = ["href", "rel", "type"];

class LoadRequestController extends RequestController {
	/**
	 * @type {{
	 *     selector: string,
	 *     process(element: Element, baseUrl: string, allowCache: boolean): {controller: Abortable, mission: Promise<any>},
	 *     [others: string]: any
	 * }[]}
	 */
	static resourceTypes = [
		{
			selector: "script[src]",
			/** @param {HTMLScriptElement} element */
			process(element, baseUrl, allowCache) {
				if (element.type == "module") {
					const { promise, reject } = Promise.withResolvers();
					return { controller: { abort: reject }, mission: Promise.race([promise, import(new URL(element.src, baseUrl).href)]) };
				} else {
					const request = get(new URL(element.src, baseUrl), null, ParseType.TEXT, null, allowCache);
					return { controller: request, mission: this.load(request.result, element) };
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
			process(element, baseUrl, allowCache) {
				const request = get(new URL(element.href, baseUrl), null, ParseType.TEXT, null, allowCache);
				return { controller: request, mission: this.load(request.result, element) };
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
	static ContextType = ContextType;
	/** @type {Abortable[]} */
	#subRequests = null;
	#finished = false;
	get finished() { return this.#finished }
	#result;
	get result() { return this.#result }
	/**
	 * 创建一个新的文档获取实例
	 * @param {string} url 要获取的文档URL
	 * @param {boolean} allowCache 是否允许缓存文档资源
	 * @param {ContextType} contextType 文档上下文类型
	 */
	constructor(url, allowCache, contextType = ContextType.DOCUMENT) {
		if (!Enum.isValueOf(ContextType, contextType)) throw new TypeError("Invalid context type.");
		allowCache = Boolean(allowCache);
		super(url, allowCache ? undefined : { headers: { "Cache-Control": "no-store" } }, contextType ? ParseType.DOCUMENT_FRAGMENT : ParseType.DOCUMENT);
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
			{ signal, url } = super.request;
		for (const type of LoadRequestController.resourceTypes) {
			for (const element of document.querySelectorAll(type.selector)) {
				const process = type.process(element, url, allowCache);
				if (!process) continue;
				subRequests.push(process.controller);
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
		const readonlyConfig = { writable: false, configurable: false, enumerable: true };
		Object.defineProperties(this, {
			"resourceTypes": readonlyConfig,
			"ContextType": readonlyConfig
		});
	}
}

/**
 * 加载文档资源
 * @param {string} url 要加载的文档URL
 * @param {boolean} preloadResources 是否预载相关资源
 * @param {boolean} allowCache 是否允许使用缓存
 * @param {ContextType} contextType 上下文类型
 * @returns 文档请求控制器对象
 */
function loadDocument(url, preloadResources = true, allowCache = true, contextType = ContextType.DOCUMENT) {
	if (!Enum.isValueOf(ContextType, contextType)) throw new TypeError("Invalid context type.");
	return preloadResources ?
		new LoadRequestController(url, allowCache, contextType) :
		get(url, null, contextType ? ParseType.DOCUMENT_FRAGMENT : ParseType.DOCUMENT, null, allowCache);
}

export { get, post, loadDocument, ParseType, ContextType, AbortError, TimeoutError, NotOkError, SendFailedError, RequestController, LoadRequestController };