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

const readonlyConfig = { writable: false, configurable: false, enumerable: true };

/**
 * @this {AbortSignal}
 * @param {(reason: any)=>void} reject 
 */
function onAborted(reject) { reject(this.reason) }

/**
 * @param {AbortSignal} signal
 */
function wrapSignal(signal) {
	const { promise, reject } = Promise.withResolvers();
	signal.addEventListener("abort", onAborted.bind(signal, reject));
	return promise;
}

/** 原版的 AbortController 太难用了，哭哭😢 */
class AdvanceAbortController extends AbortController {
	#timeoutId = null;
	#timeout = null;
	startTimer(timeout) {
		if (this.#closed) throw new Error("Cannot start a timer on a closed controller.");
		if (this.#timeoutId !== null) throw new Error("The controller had started a timer already.");
		setTimeout(this.#onTimeout.bind(this), this.#timeout = timeout);
	}
	cancelTimer() {
		clearTimeout(this.#timeoutId);
		this.#timeoutId = this.#timeout = null;
	}
	#onTimeout() {
		if (this.#closed) return;
		this.#closed = true;
		super.abort(new TimeoutError(this.#timeout));
	}
	#using = 1;
	acquire() { ++this.#using }
	#closed = false;
	close(fatal = false) {
		if (this.#closed) return;
		if (fatal || !--this.#using) {
			this.#closed = true;
			clearTimeout(this.#timeoutId);
		}
	}
	abort(reason) {
		if (this.#closed) return;
		this.#closed = true;
		clearTimeout(this.#timeoutId);
		super.abort(new AbortError(reason));
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
	}
}

/**
 * @param {Response} response
 */
async function parseDocument(response) {
	const contentType = response.headers.get("Content-Type"), split = contentType.indexOf(";");
	// @ts-ignore
	return new DOMParser().parseFromString(await response.text(), split == -1 ? contentType : contentType.substring(0, split));
}

/**
 * @param {Response} response
 */
async function parseFragment(response) {
	return document.createRange().createContextualFragment(await response.text());
}

/**
 * @typedef {string[][] | Record<string, string> | string | URLSearchParams} URLSearchParamsInit
 * @typedef {string | URL} URLInit
 * @typedef {Readonly<{SOURCE: 0, JSON: 1, TEXT: 2, BLOB: 3, BUFFER: 4, STREAM: 5, DOCUMENT: 6, DOCUMENT_FRAGMENT: 7}>} enum_ParseType
 * @typedef {Readonly<{DOCUMENT: 0, FRAGMENT: 1}>} enum_ContextType
 * @typedef {{
 *     selector: string,
 *     process(element: Element, baseUrl: string, allowCache: boolean, signal: AbortSignal): Promise<any>,
 *     [others: string]: any
 * }[]} subProcesses
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
	ContextType = Enum.fromKeys(["DOCUMENT", "FRAGMENT"]),
	abortController = Symbol("abortController");

/**
 * @param {Response} response
 * @param {ParseType} parseType
 */
function parseResponse(response, parseType) {
	switch (parseType) {
		case ParseType.SOURCE: return response;
		case ParseType.JSON: return response.json();
		case ParseType.TEXT: return response.text();
		case ParseType.BLOB: return response.blob();
		case ParseType.BUFFER: return response.arrayBuffer();
		case ParseType.STREAM: return response.body;
		case ParseType.DOCUMENT: return parseDocument(response);
		case ParseType.DOCUMENT_FRAGMENT: return parseFragment(response);
	}
}

class RequestController {
	[abortController] = new AdvanceAbortController;
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
	abort(reason) { this[abortController].abort(reason) }
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
		const signalController = this[abortController],
			signal = temp.signal = signalController.signal;
		if (timeout !== null) {
			timeout = Number(timeout);
			if (!(Number.isFinite(timeout) && timeout > 0)) throw TypeError("Argument 'timeout' must be positive.");
			signalController.startTimer(timeout);
		}
		this.#request = new Request(url, temp);
		this.#result = this.#fetch(parseType, signalController, signal);
	}
	/**
	 * @param {ParseType} parseType
	 * @param {AdvanceAbortController} signalController
	 * @param {AbortSignal} signal
	 */
	async #fetch(parseType, signalController, signal) {
		var response;
		try {
			response = this.#response = await fetch(this.#request);
		} catch (error) {
			this.#finished = true;
			const name = error.name;
			if (name == "AbortError" || name == "TimeoutError") throw error;
			signalController.close(true);
			throw new SendFailedError(error.message);
		}
		if (!response.ok) {
			this.#finished = true;
			signalController.close(true);
			throw new NotOkError(response.status);
		}
		try {
			return await parseResponse(response, parseType);
		} catch (error) {
			if (error.name == "AbortError") throw signal.reason;
			signalController.close(true);
			throw error;
		} finally {
			this.#finished = true;
			signalController.close();
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

/**
 * @param {URL | string} url
 * @param {ParseType} parseType
 * @param {boolean} allowCache
 * @param {AbortSignal} signal
 */
async function loadSubResource(url, parseType, allowCache, signal) {
	const options = { signal };
	if (allowCache) options.headers = { "Cache-Control": "no-store" };
	const response = await fetch(url, options);
	if (!response.ok) throw new NotOkError(response.status);
	return parseResponse(response, parseType);
}

const stylesheetSkipAttributes = ["href", "rel", "type"],
	/** @type {subProcesses} */
	defaultSubProcesses = [
		{
			selector: "script[src]",
			/** @param {HTMLScriptElement} element */
			async process(element, baseUrl, allowCache, signal) {
				if (element.type == "module") return Promise.race([wrapSignal(signal), import(new URL(element.src, baseUrl).href)]);
				const temp = document.createElement("script");
				temp.textContent = await loadSubResource(new URL(element.src, baseUrl), ParseType.TEXT, allowCache, signal);
				for (const attribute of element.attributes)
					if (attribute.name != "src")
						temp.setAttribute(attribute.name, attribute.value);
				element.replaceWith(temp);
			}
		},
		{
			selector: "link[rel=stylesheet]",
			/** @param {HTMLLinkElement} element  */
			async process(element, baseUrl, allowCache, signal) {
				const temp = document.createElement("style");
				temp.textContent = await loadSubResource(new URL(element.href, baseUrl), ParseType.TEXT, allowCache, signal);
				for (let attribute of element.attributes)
					if (!stylesheetSkipAttributes.includes(attribute.name))
						temp.setAttribute(attribute.name, attribute.value);
				element.replaceWith(temp);
			}
		}
	];

class LoadRequestController extends RequestController {
	/** @readonly */
	static defaultSubProcesses = defaultSubProcesses;
	static loadSubResource = loadSubResource;
	/** @readonly */
	static ContextType = ContextType;
	#finished = false;
	get finished() { return this.#finished }
	#result;
	get result() { return this.#result }
	/**
	 * 创建一个新的文档获取实例
	 * @param {string} url 要获取的文档URL
	 * @param {ContextType} contextType 文档上下文类型
	 * @param {boolean} [allowCache] 是否允许缓存文档资源
	 * @param {number} timeout 超时时间
	 * @param {subProcesses} subProcesses 子资源加载配置
	 */
	constructor(url, contextType = ContextType.DOCUMENT, allowCache, timeout = null, subProcesses = defaultSubProcesses) {
		if (!Enum.isValueOf(ContextType, contextType)) throw new TypeError("Invalid context type.");
		if (!Array.isArray(subProcesses)) throw new TypeError("Argument 'subProcesses' must be an array.");
		allowCache = Boolean(allowCache);
		super(url, allowCache ? undefined : { headers: { "Cache-Control": "no-store" } }, contextType ? ParseType.DOCUMENT_FRAGMENT : ParseType.DOCUMENT, timeout);
		const signalController = this[abortController];
		signalController.acquire();
		this.#result = this.#fetch(subProcesses, allowCache, signalController);
	}
	/**
	 * @param {subProcesses} subProcesses
	 * @param {boolean} allowCache
	 * @param {AdvanceAbortController} signalController
	 */
	async #fetch(subProcesses, allowCache, signalController) {
		try {
			/** @type {Document} */
			const document = await super.result, missions = [],
				{ url } = super.request, { signal } = signalController,
				promise = wrapSignal(signalController.signal);
			for (const type of subProcesses) {
				for (const element of document.querySelectorAll(type.selector)) {
					const process = type.process(element, url, allowCache, signal);
					if (process instanceof Promise) missions.push(process);
				}
			}
			await Promise.race([promise, Promise.allSettled(missions)]);
			signalController.close();
			return document;
		} catch (error) {
			signalController.close(true);
			throw error;
		} finally {
			this.#finished = true;
		}
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
		const { defaultSubProcesses } = this;
		for (const item of defaultSubProcesses) Object.freeze(item);
		Object.freeze(defaultSubProcesses);
		Object.defineProperties(this, {
			defaultSubProcesses: readonlyConfig,
			ContextType: readonlyConfig
		});
	}
}

/**
 * 加载文档资源
 * @param {string} url 要加载的文档URL
 * @param {boolean} preloadResources 是否预载相关资源
 * @param {boolean} allowCache 是否允许使用缓存
 * @param {ContextType} contextType 上下文类型
 * @param {number} [timeout] 超时时间
 * @returns 文档请求控制器对象
 */
function loadDocument(url, preloadResources = true, allowCache = true, contextType = ContextType.DOCUMENT, timeout) {
	if (!Enum.isValueOf(ContextType, contextType)) throw new TypeError("Invalid context type.");
	return preloadResources ?
		new LoadRequestController(url, contextType, allowCache, timeout) :
		get(url, null, contextType ? ParseType.DOCUMENT_FRAGMENT : ParseType.DOCUMENT, null, allowCache, timeout);
}

export { get, post, loadDocument, ParseType, ContextType, AbortError, TimeoutError, NotOkError, SendFailedError, RequestController, LoadRequestController };