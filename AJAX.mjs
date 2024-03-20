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
async function promiseGet(url, responseType = "text", allowCache = true, abortSignal = null) {
	if (!responseTypes.includes(responseType)) throw new TypeError(`Failed to execute 'promiseGet': Unsupported response type '${responseType}'.`);
	const response = await fetch(url, { cache: allowCache ? "default" : "no-store", signal: abortSignal });
	if (!response.ok) throw new Error(`Request failed, status: ${response.status}.`);
	switch (responseType) {
		case "text": return await response.text();
		case "json": return await response.json();
		case "document": return new DOMParser().parseFromString(await response.text(), response.headers.get("Content-Type"));
		case "arrayBuffer": return await response.arrayBuffer();
		case "blob": return await response.blob();
	}
}
const subLoads = [
	{
		selector: "script[src]",
		async loader(element, allowCache, abortSignal) {
			if (element.type == "module") {
				await import(element.src);
			} else {
				const response = await promiseGet(element.src, "text", allowCache, abortSignal),
					temp = document.createElement("script");
				temp.textContent = response;
				for (const attribute of element.attributes) {
					if (attribute.name == "src") continue;
					temp.setAttribute(attribute.name, attribute.value)
				}
				element.replaceWith(temp);
			}
		}
	},
	{
		selector: "link[rel=stylesheet]",
		async loader(element, allowCache, abortSignal) {
			const response = await promiseGet(element.href, "text", allowCache, abortSignal),
				temp = document.createElement("style");
			temp.textContent = response;
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
function subLoadsMapper(item) { return item.promise }
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
		if (super.readyState != XMLHttpRequest.DONE) {
			return super.readyState;
		} else return this.#done ? 4 : 3;
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
	#abortSubResources() { for (let item of this.#subResources) item.abort() }
	async #loadSubResource(loader, element, allowCache, abortSignal) {
		try {
			await loader(element, allowCache, abortSignal);
		} catch (error) {
			console.error("Uncaught", error);
			this.dispatchEvent(new ErrorEvent("suberror", { error }));
		}
		++this.#subResourcesLoaded;
		if (this.#fetching) this.dispatchEvent(new ProgressEvent("progress", { loaded: this.#percent, total: 100 }));
	}
	async #onBodyLoad(event) {
		if (!event.isTrusted) return;
		event.stopImmediatePropagation();
		this.dispatchEvent(new ProgressEvent("progress", { loaded: 50, total: 100 }));
		if (!this.#fetching) return;
		const status = super.status;
		this.#subResourcesLoaded = 0;
		if ((status >= 200 && status < 300) || status == 304) {
			const documentFragment = this.#response = document.createRange().createContextualFragment(super.response),
				timeout = super.timeout,
				remainTime = timeout > 0 ? timeout - (Date.now() - this.#startTime) : Infinity;
			if (remainTime > 0) {
				const subResources = [];
				for (const type of subLoads) for (const item of documentFragment.querySelectorAll(type.selector)) {
					const abortController = new AbortController;
					subResources.push({
						promise: this.#loadSubResource(type.loader, item, this.#allowCache, abortController.signal),
						abort: abortController.abort.bind(abortController)
					});
				};
				if (subResources.length) {
					this.#subResources = subResources;
					let timeoutId;
					if (remainTime < Infinity) timeoutId = setTimeout(this.#abortSubResources.bind(this), remainTime);
					await Promise.allSettled(subResources.map(subLoadsMapper));
					if (timeoutId) clearTimeout(timeoutId);
					this.#subResources = null;
					if (!this.#fetching) return;
				}
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
	get responseType() {
		LoadRequest.#checkInstance(this);
		return "document-fragment";
	}
	set responseType(_ignore) {
		LoadRequest.#checkInstance(this);
		console.warn("Connot change 'LoadRequest.responseType'.")
	}
	get response() { return this.#done ? this.#response : null }
	get responseText() { throw new DOMException("Failed to read property 'responseText' from 'LoadRequest': The property is disabled on LoadRequest.") }
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
export { ajax, get, promiseGet, load, buildRequest, LoadRequest }