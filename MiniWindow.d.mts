type MiniWindowOptions = {
	noManualClose?: boolean,
	size?: {
		width?: string,
		height?: string
	},
	style?: MiniWindowStyleOptions,
	containerClassName?: string
}
type MiniWindowStyleOptions = {
	backgroundColor?: string,
	textColor?: string,
	interactiveColor?: string,
	interactiveHoverColor?: string,
	interactiveActiveColor?: string,
	interactiveTextColor?: string,
	interactiveHoverTextColor?: string,
	interactiveActiveTextColor?: string
}
type MiniWindowEventListener = ((this: MiniWindow, event: Event) => void) | null;
/**
 * Represents a MiniWindow that can be displayed with various features.
 * @event MiniWindow#show The MiniWindow got activated and starting to be shown.
 * @event MiniWindow#shown The MiniWindow has been fully shown.
 * @event MiniWindow#close The MiniWindow got inactivated and starting to be hidden.
 * @event MiniWindow#closed The MiniWindow has been fully hidden.
 */
declare class MiniWindow extends EventTarget {
	/**
	 * Event listener for the 'show' event.
	 * @listens show
	 */
	onshow: MiniWindowEventListener;
	/**
	 * Event listener for the 'shown' event.
	 * @listens shown
	 */
	onshown: MiniWindowEventListener;
	/**
	 * Event listener for the 'close' event.
	 * @listens close
	 */
	onclose: MiniWindowEventListener;
	/**
	 * Event listener for the 'closed' event.
	 * @listens closed
	 */
	onclosed: MiniWindowEventListener;
	/** Indicates whether the MiniWindow is currently active. */
	readonly active: boolean;
	/** Indicates whether the MiniWindow is closed. */
	readonly closed: boolean;
	/** Indicates whether the MiniWindow is enable to receive mouse operations. */
	readonly blocked: boolean;
	/**
	 * Creates a new MiniWindow and queues it up.
	 * @param content The content of the new MiniWindow.
	 * @param title The title of the new MiniWindow.
	 * @param options The options for the new MiniWindow.
	 */
	constructor(content: string | Node, title = "提示", options?: MiniWindowOptions);
	/**
	 * Enables or disables the ability for the MiniWindow to receive mouse operations.
	 * @param toState Whether the MiniWindow can receive mouse operations. By default, toggles the state.
	 * @returns Whether successfully changed the state.
	 */
	blockSwitch(toState?: boolean): boolean;
	/**
	 * Inactivates the MiniWindow, starts to hide it, or removes it from the queue if not shown yet.
	 * @fires MiniWindow#close
	 */
	close(): void;
	/**
	 * Creates a new MiniWindow and queues it for the next displayed MiniWindow.
	 * @param content The content of the new MiniWindow.
	 * @param title The title of the new MiniWindow.
	 * @param options The options for the new MiniWindow.
	 * @returns The newly created MiniWindow instance.
	 */
	after(content: string | Node, title = "提示", options?: MiniWindowOptions): MiniWindow;
	/**
	 * Shows a sub window with an alert message.
	 * @param message - The message to display in the alert.
	 * @returns A promise that resolves when the alert is confirmed.
	 */
	alert(message: string): Promise<void>;
	/**
	 * Shows a sub window with a confirmation message.
	 * @param message - The message to display in the confirmation dialog.
	 * @returns A promise that resolves to true when the confirmation is accepted, and false when declined.
	 */
	confirm(message: string, textOfYes = "是", textOfNo = "否"): Promise<boolean>;
	/**
	 * Shows a sub window with a loading spinner let the user wating for something.
	 * @param message The tooltip text to display.
	 * @returns A function that stops the waiting process.
	 */
	wait(message: string): () => void;
	/**
	 * Show a sub window with a text input element to receive user input.
	 * @param message The tooltip text to display.
	 * @returns A promise that resolves to the user input.
	 * @throws {DOMException} User clicked the cancel button.
	 */
	prompt(message: string, defaultText?: string): Promise<string>;
	static alert(message: string | Node, title = "提示"): Promise<void>;
	/**
	 * Shows a confirmation dialog with custom content and title.
	 * @static
	 * @param content The content of the confirmation dialog.
	 * @param title The title of the confirmation dialog.
	 * @returns A promise that resolves to true when the confirmation is accepted, and false when declined.
	 */
	static confirm(content: string | Node, title = "确认", textOfYes = "是", textOfNo = "否"): Promise<boolean>;
	static wait(message: string, title = "请等待"): () => void;
	static prompt(message: string, defaultText?: string): Promise<string>;
}
declare function remove(): void;
declare function reload(): void;
declare function setCounterEnabled(enabled: boolean): void;
export default MiniWindow;
export { MiniWindow, remove, reload }