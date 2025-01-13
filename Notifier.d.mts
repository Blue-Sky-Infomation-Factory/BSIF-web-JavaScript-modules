type handler<A extends any[]> = (...args: A) => any;
declare class Notifier<A extends any[]> {
	addHandler(handler: handler<A>): void;
	removeHandler(handler: handler<A>): void;
	removeAllHandlers(): void;
	trigger(): void;
}
export default Notifier;
export { Notifier };