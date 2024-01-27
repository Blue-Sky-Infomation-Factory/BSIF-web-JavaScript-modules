type statusCallback<R extends XMLHttpRequest> = (this: R, status: number) => void;
type eventCallback<R extends XMLHttpRequest> = (this: R, event: ProgressEvent) => void;
type responseCallback<R extends XMLHttpRequest> = (this: R, response: R['response']) => void;
type failedCallback = statusCallback | eventCallback;
type sendType = XMLHttpRequestBodyInit | HTMLFormElement | Object | any;
type AJAXOptions = {
	/** 请求的 URL */
	url: string | URL,
	/** 请求使用的方法 */
	method?: string,
	/** 是否使用异步请求，默认 true */
	async?: boolean,
	username?: string,
	password?: string,
	/** 请求成功的回调 */
	success?: responseCallback,
	/** 请求失败的回调 */
	fail?: statusCallback,
	/** 请求完成时的回调（成功或失败） */
	done?: statusCallback,
	/** 请求发送错误的回调 */
	error?: eventCallback,
	/** 请求被中断的回调 */
	abort?: eventCallback,
	/** 要将请求的响应解析为什么类型的数据 */
	type?: XMLHttpRequestResponseType,
	/** 需要发送的数据，仅在调用 ajax 函数且 noSend 不为 true 时有效 */
	data?: sendType,
	/** 请求的超时时间，超时未完成则失败，单位是毫秒 */
	timeout?: number,
	/** 是否允许使用浏览器缓存进行响应 */
	cache?: boolean,
	/** 配置请求后不立即发送，仅在调用 ajax 函数时有效 */
	noSend?: boolean
};
type subLoads = {
	selector: string,
	loader: (element: HTMLElement, allowCache: boolean, abortHandlerSetter: (abortHandler: () => void) => void) => Promise<any>,
	processor: (element: HTMLElement, response: any) => void
};
declare class LoadRequest extends XMLHttpRequest {
	readonly responseType: "document-fragment";
	readonly responseText: never;
	readonly responseXML: never;
	readonly response: DocumentFragment | null;
	open(method: string, url: string | URL, username?: string | null, password?: string | null): void;
	readonly static subLoads: subLoads[];
}
/**
 * 发送 AJAX 请求
 */
declare function ajax(options: AJAXOptions): XMLHttpRequest;
/**
 * 以 GET 方式发送 AJAX 请求，并以 JSON 形式获取回复
 * @param url 请求 URL
 * @param callback 成功回调
 * @param allowCache 是否允许使用浏览器缓存
 * @param fail 失败回调
 */
declare function getJSON(url: AJAXOptions["url"], callback: responseCallback, allowCache = true, fail?: failedCallback): XMLHttpRequest;
/**
 * 以 GET 方式发送 AJAX 请求，并以 XML 形式获取回复
 * @param url 请求 URL
 * @param callback 成功回调
 * @param allowCache 是否允许使用浏览器缓存
 * @param fail 失败回调
 */
declare function getXML(url: AJAXOptions["url"], callback: responseCallback, allowCache = true, fail?: failedCallback): XMLHttpRequest;
/**
 * 以 POST 方式发送 AJAX 请求，并以 JSON 形式获取回复
 * @param url 请求 URL
 * @param data 需要发送的数据
 * @param callback 成功回调
 * @param fail 失败回调
 */
declare function postJSON(url: AJAXOptions["url"], data: sendType, callback: responseCallback, fail?: failedCallback): XMLHttpRequest;
/**
 * 以 GET 方式发送 AJAX 请求，并将回复解析为 DOM 然后替换到指定元素中
 * @param url 请求 URL
 * @param targetElement 目标元素
 * @param allowCache 是否允许使用浏览器缓存
 * @param preloadResource 是否预加载 DOM 中的某些资源
 * @param success 成功回调
 * @param fail 失败回调
 */
declare function load(
	url: AJAXOptions["url"],
	targetElement: HTMLElement,
	allowCache = true,
	preloadResource = true,
	success?: statusCallback,
	fail?: failedCallback
): LoadRequest | XMLHttpRequest;
/**
 * 以 AJAX 范式配置请求
 * @param request 请求对象
 * @param options 选项
 */
declare function buildRequest(request: LoadRequest | XMLHttpRequest, options: AJAXOptions): void;
export { ajax, getJSON, getXML, load, postJSON, buildRequest, LoadRequest }