function buildRequest(request, options) {
	const url = options.url;
	if (!(typeof url == "string" || url instanceof URL)) throw new TypeError("The URL was not provided or is invalid.");
	const async = options.async ?? true,
		{ success, fail, done, error, abort } = options,
		successChecked = typeof options.success == "function",
		failChecked = typeof options.fail == "function",
		doneChecked = typeof options.done == "function";
	request.open(options.method ?? "GET", url, async, options.username, options.password);
	if (async) {
		if ("responseType" in options) request.responseType = options.responseType;
		if ("timeout" in options) request.timeout = options.timeout;
	}
	if ("allowCache" in options && !options.allowCache) request.setRequestHeader("Cache-Control", "no-store");
	if ("headers" in options) for (const [name, value] of parseHeaders(options.headers)) request.setRequestHeader(name, value);
	if (failChecked) request.ontimeout = function () { fail.call(this, "timeout") };
	if (typeof abort == "function") request.onabort = function () { abort.call(this, "abort") };
	if (typeof error == "function") request.onerror = function () { error.call(this, "error") };
	if (successChecked || failChecked || doneChecked) request.onload = function () {
		const status = this.status;
		if ((status >= 200 && status < 300) || status == 304) {
			if (successChecked) try { success.call(this, this.response) } catch (error) { console.error("Uncaught", error) };
		} else if (failChecked) try { fail.call(this, status) } catch (error) { console.error("Uncaught", error) };
		if (doneChecked) done.call(this, status);
	};
}
function parseHeaders(headers) {
	if (!(headers instanceof Object)) throw new TypeError("Failed to execute 'parseHeaders': Invalid headers type.");
	if (headers instanceof Headers || headers instanceof Map) return headers.entries();
	if (Array.isArray(headers)) return headers;
	return Object.entries(headers);
}
function parseData(data) {
	if (!(data instanceof Object)) return data;
	if (data instanceof HTMLFormElement) return new FormData(data);
	const result = new FormData;
	for (let i in data) {
		let temp = data[i];
		if (temp instanceof File) { result.set(i, temp, temp.name) } else result.set(i, temp);
	}
	return result;
}
function ajax(options) {
	if (!(options instanceof Object)) throw new TypeError("Failed to execute 'ajax': Argument 'options' is not an object.");
	const xhr = new XMLHttpRequest;
	buildRequest(xhr, options);
	if (!options.noSend) xhr.send(parseData(options.body));
	return xhr;
}
const responseTypes = ["text", "json", "arrayBuffer", "blob", "document"];
function get(url, success, responseType = "text", allowCache = true, fail = null) {
	if (!responseTypes.includes(responseType)) throw new TypeError(`Failed to execute 'get': Unsupported response type '${responseType}'.`);
	return ajax({ url, responseType, fail, error: fail, success, allowCache })
}
async function subLoadProcessor(element, allowCache, loader, processor, abortHandlerSetter) {
	const response = await loader(element, allowCache, abortHandlerSetter);
	if (response) processor(element, response);
}
function loadSubResource(element, allowCache, loader, processor) {
	var abort;
	return { promise: subLoadProcessor(element, allowCache, loader, processor, function (handler) { abort = handler }), abort() { if (typeof abort == "function") abort() } };
}
function downloader(url, allowCache, onfinish, abortHandlerSetter) {
	function onReject() { onfinish(false) }
	const xhr = ajax({
		url,
		cache: allowCache,
		success: onfinish,
		fail: onReject,
		error: onReject,
		abort: onReject
	});
	abortHandlerSetter(xhr.abort.bind(xhr));
}
const subLoads = [
	{
		selector: "script[src]",
		loader: (element, allowCache, abortHandlerSetter) => new Promise(element.type == "module" ? function (resolve) {
			abortHandlerSetter(resolve);
			// @ts-ignore
			import(element.src).finally(resolve);
		} : function (resolve) { downloader(element.src, allowCache, resolve, abortHandlerSetter) }),
		processor(element, response) {
			const temp = document.createElement("script");
			temp.appendChild(document.createTextNode(response));
			for (let attribute of element.attributes) {
				if (attribute.name == "src") continue;
				temp.setAttribute(attribute.name, attribute.value)
			}
			element.replaceWith(temp);
		}
	},
	{
		selector: "link[rel=stylesheet]",
		loader: (element, allowCache, abortHandlerSetter) => new Promise(function (resolve) { downloader(element.href, allowCache, resolve, abortHandlerSetter) }),
		processor(element, response) {
			const temp = document.createElement("style");
			temp.appendChild(document.createTextNode(response));
			for (let attribute of element.attributes) {
				switch (attribute.name) {
					case "href":
					case "rel":
					case "type":
						continue;
					default:
						temp.setAttribute(attribute.name, attribute.value);
				}
			}
			element.replaceWith(temp);
		}
	}
];
class LoadRequest extends XMLHttpRequest {
	static #checkInstance(instance) { if (!(instance instanceof this)) throw new TypeError("Illegal invocation") }
	#done = false;
	#fetching = false;
	#allowCache = true;
	get allowCache() { return this.#allowCache }
	set allowCache(value) { this.#allowCache = Boolean(value) }
	#response = null;
	#subResources = null;
	#subResourcesLoaded = 0;
	#startTime = null;
	get readyState() {
		const readyState = super.readyState;
		return readyState == XMLHttpRequest.DONE ? this.#done ? XMLHttpRequest.LOADING : XMLHttpRequest.DONE : readyState;
	}
	get #percent() {
		if (this.#response === null) return 0;
		const subResourcesNumber = this.#subResources.length;
		return subResourcesNumber ? 50 + this.#subResourcesLoaded / subResourcesNumber * 50 : 100;
	}
	#afterFail(eventType) {
		this.#fetching = false;
		this.dispatchEvent(new ProgressEvent(eventType, { loaded: this.#percent, total: 100 }));
	}
	#blockEvent(event) { if (event.isTrusted) event.stopImmediatePropagation() }
	#addLoaded() {
		++this.#subResourcesLoaded;
		this.dispatchEvent(new ProgressEvent("progress", { loaded: this.#percent, total: 100 }));
	}
	#abortSubResources() { for (let item of this.#subResources) item.abort() }
	async #waitSub(item) {
		await item.promise;
		this.#addLoaded();
	}
	async #onBodyLoad(event) {
		if (!event.isTrusted) return;
		event.stopImmediatePropagation();
		this.dispatchEvent(new ProgressEvent("progress", { loaded: 50, total: 100 }));
		if (!this.#fetching) return;
		const status = super.status, subResources = this.#subResources = [];
		this.#subResourcesLoaded = 0;
		if ((status >= 200 && status < 300) || status == 304) {
			const documentFragment = this.#response = document.createRange().createContextualFragment(super.response);
			for (const type of subLoads) for (const item of documentFragment.querySelectorAll(type.selector)) subResources.push(loadSubResource(item, this.#allowCache, type.loader, type.processor));
			if (subResources.length) {
				const remainTime = super.timeout > 0 ? super.timeout - (Date.now() - this.#startTime) : -1;
				if (remainTime) {
					let timeoutId;
					if (remainTime > 0) timeoutId = setTimeout(this.#abortSubResources.bind(this), remainTime);
					await Promise.all(subResources.map(this.#waitSub.bind(this)));
					if (timeoutId) clearTimeout(timeoutId);
					if (!this.#fetching) return;
				} else this.#abortSubResources();
			}
		}
		this.#fetching = false;
		this.#done = true;
		this.dispatchEvent(new Event("readystatechange"));
		this.dispatchEvent(new ProgressEvent("load", { loaded: 100, total: 100 }));
		this.dispatchEvent(new ProgressEvent("loadend", { loaded: 100, total: 100 }));
	}
	#onLoadStart(event) {
		if (event.isTrusted) {
			event.stopImmediatePropagation();
			this.dispatchEvent(new ProgressEvent("loadstart", { loaded: 0, total: 100 }))
		}
	}
	#onReadyStateChange(event) {
		if (event.isTrusted && super.readyState == XMLHttpRequest.DONE) event.stopImmediatePropagation();
	}
	#onFail(event) {
		if (!event.isTrusted) return;
		event.stopImmediatePropagation();
		this.#afterFail(event.type);
	}
	open(method, url, user, password) {
		LoadRequest.#checkInstance(this);
		if (this.#fetching && super.readyState == XMLHttpRequest.DONE) this.#abortSubResources();
		this.#response = this.#subResources = this.#startTime = null;
		this.#done = false;
		super.open(method, url, true, user, password);
	}
	send(data) {
		LoadRequest.#checkInstance(this);
		if (super.readyState != XMLHttpRequest.OPENED) throw new DOMException("Failed to execute 'send' on 'LoadRequest': The object's state must be OPENED.");
		if (!this.#allowCache) super.setRequestHeader("If-Modified-Since", "0");
		this.#fetching = true;
		this.#startTime = Date.now();
		super.send(data);
	}
	abort() {
		LoadRequest.#checkInstance(this);
		if (!this.#fetching) return;
		if (super.readyState != XMLHttpRequest.DONE) {
			super.abort();
		} else {
			this.#abortSubResources();
			this.#afterFail("abort");
		}
	}
	constructor() {
		super();
		this.addEventListener("readystatechange", this.#onReadyStateChange);
		for (let event of ["timeout", "abort", "error"]) this.addEventListener(event, this.#onFail);
		for (let event of ["load", "progress"]) this.addEventListener(event, this.#blockEvent);
		this.addEventListener("loadstart", this.#onLoadStart);
		this.addEventListener("loadend", this.#onBodyLoad);
	}
	// @ts-ignore
	get responseType() {
		LoadRequest.#checkInstance(this);
		return "document-fragment";
	}
	// @ts-ignore
	set responseType(_ignore) {
		LoadRequest.#checkInstance(this);
		console.warn("Connot change 'LoadRequest.responseType'.")
	}
	get response() { return this.#done ? this.#response : null }
	// @ts-ignore
	get responseText() { throw new DOMException("Failed to read property 'responseText' from 'LoadRequest': The property is disabled on LoadRequest.") }
	// @ts-ignore
	get responseXML() { throw new DOMException("Failed to read property 'responseXML' from 'LoadRequest': The property is disabled on LoadRequest.") }
	overrideMimeType() {
		LoadRequest.#checkInstance(this);
		throw new Error("Failed to execute 'overrideMimeType' on 'LoadRequest': The method is disabled on LoadRequest.");
	}
	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: this.name,
			configurable: true
		});
		Object.defineProperty(this, "subLoads", {
			value: subLoads,
			configurable: true,
			enumerable: true
		});
	}
}
function load(url, targetElement, allowCache = true, preloadResource = true, success = null, fail = null) {
	if (preloadResource) {
		const loadRequest = new LoadRequest;
		buildRequest(loadRequest, {
			method: "GET", url, allowCache,
			success(response) {
				targetElement.innerHTML = "";
				targetElement.appendChild(response);
				if (typeof success == "function") success.call(this, this.status);
			},
			fail, error: fail
		});
		loadRequest.send();
		return loadRequest;
	} else return ajax({
		url, fail, error: fail,
		success(response) {
			const operator = document.createRange().createContextualFragment(response);
			targetElement.innerHTML = "";
			targetElement.appendChild(operator);
		},
		allowCache
	});
}
export { ajax, get, load, buildRequest, LoadRequest }