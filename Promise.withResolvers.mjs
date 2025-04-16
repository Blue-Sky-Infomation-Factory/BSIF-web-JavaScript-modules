var promise = null, resolve = null, reject = null;
function expose(function1, function2) {
	if (typeof function1 != "function" || typeof function2 != "function") throw new TypeError("Promise resolve or reject function is not callable");
	resolve = function1;
	reject = function2
}
/**
 * Polyfill of Promise.withResolvers()
 * @returns {{promise:PromiseLike,resolve:(result:any)=>void,reject:(error:any)=>void}}
 */
function withResolvers() {
	if (typeof this != "function") throw new TypeError("Promise.withResolvers called on non-function");
	promise = new this(expose);
	const object = { promise, resolve, reject };
	promise = resolve = reject = null;
	return object;
}
if ("withResolvers" in Promise) { console.warn("Your environment doesn't need this polyfill of Promise.withResolvers().") }
else Promise.withResolvers = withResolvers;