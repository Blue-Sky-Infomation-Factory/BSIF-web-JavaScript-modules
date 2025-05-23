type statusCallback<R extends XMLHttpRequest> = (this: R, status: number | "timeout" | "abort" | "error") => any;
type errorCallback<R extends XMLHttpRequest> = (this: R, error: "abort" | "error") => any;
type responseCallback<R extends XMLHttpRequest> = (this: R, response: R['response']) => any;
type failedCallback = statusCallback | errorCallback;
type sendType = XMLHttpRequestBodyInit | HTMLFormElement | Object;
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
	error?: errorCallback,
	/** 请求被中断的回调 */
	abort?: errorCallback,
	/** 要将请求的响应解析为什么类型的数据 */
	responseType?: XMLHttpRequestResponseType,
	/** 需要发送的数据，仅在调用 ajax 函数且 noSend 不为 true 时有效 */
	body?: sendType,
	/** 请求的超时时间，超时未完成则失败，单位是毫秒 */
	timeout?: number,
	/** 是否允许使用浏览器缓存 */
	allowCache?: boolean,
	/** 请求头 */
	headers?: Map<string, string> | Headers | [string, string][] | { [key: string]: string },
};
type ajaxMethodOptions = ({
	/** 配置请求后不立即发送 */
	noSend?: false,
	/** 需要发送的数据，仅在 noSend 不为 true 时有效 */
	body?: sendType,
} | {
	/** 配置请求后不立即发送 */
	noSend: true
})
type subLoads = {
	selector: string,
	loader: (element: HTMLElement, allowCache: boolean, abortSignal: AbortSignal) => Promise<any>,
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
 * 创建 AJAX 请求
 */
declare function ajax(options: ajaxMethodOptions): XMLHttpRequest;
/**
 * 以 GET 方式发送 AJAX 请求，并以指定形式获取回复
 * @param url 请求 URL
 * @param success 成功回调
 * @param responseType 要将请求的响应解析为什么类型的数据
 * @param allowCache 是否允许使用浏览器缓存
 * @param fail 失败回调
 * @returns 响应的内容
 */
declare function get(url: AJAXOptions["url"], success: responseCallback, responseType: XMLHttpRequestResponseType = "text", allowCache = true, fail?: failedCallback): XMLHttpRequest;
/**
 * 请求一个 HTML 文档，解析为 DOM 并预载其中的某些资源
 * @param url 请求 URL
 * @param targetElement 请求完成后要将文档载入到哪个元素
 * @param allowCache 是否允许使用浏览器缓存
 * @param preloadResource 是否预载资源
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
export { ajax, get, load, buildRequest, LoadRequest }