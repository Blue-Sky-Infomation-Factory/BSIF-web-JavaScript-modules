console.warn("PromiseWithResolvers now has a native JavaScript implementation: Promise.withResolvers(), although this is a new specification that some browsers have not implemented." + ("withResolvers" in Promise ? " Your environment support it, how about have a try?" : ""));
const resolve = { value: null, enumerable: true },
	reject = { value: null, enumerable: true },
	promise = { value: null, enumerable: true },
	transfer = { promise, resolve, reject };
function expose(function1, function2) {
	resolve.value = function1;
	reject.value = function2
}
/**
 * Polyfill of Promise.withResolvers()
 * @returns {{promise:Promise,resolve:(result:any)=>void,reject:(error:any)=>void}}
 */
export function promiseWithResolvers() {
	promise.value = new Promise(expose);
	const object = Object.defineProperties({}, transfer);
	promise.value = resolve.value = reject.value = null;
	return object;
};
export default promiseWithResolvers;