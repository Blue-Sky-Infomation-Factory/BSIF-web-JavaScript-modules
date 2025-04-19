type validValueTypes = number | string | symbol;

declare class Enum {
	constructor(source: { [key: string]: validValueTypes });

	/**
	 * Get the enum key for a given enum value.
	 * @param instance Enum instance.
	 * @param value Enum value.
	 * @returns Enum key associated with value.
	 */
	static keyOf(instance: Enum, value: validValueTypes): string | null;

	/**
	 * Check if a value is a member of the given enum.
	 * @param instance Enum instance.
	 * @param value Enum value.
	 */
	static isValueOf(instance: Enum, value: validValueTypes): boolean;

	/**
	 * Represent an enum with auto-incrementing numeric values or symbols as values.
	 * @param array Array of string enum keys.
	 * @param useSymbol Whether to use Symbols instead of numbers for values. Default false.
	 */
	static fromKeys(array: string[], useSymbol = false): Enum;
}
export { Enum };
export default Enum;