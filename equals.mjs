/**
 * 
 * @param {ArrayLike} arrryLike1 
 * @param {ArrayLike} arrayLike2 
 */
function isArrayLikesEqual(arrryLike1, arrayLike2) {
	const { length } = arrryLike1;
	if (length != arrayLike2.length) return false;
	for (let i = 0; i < length; ++i)
		if (arrryLike1[i] != arrayLike2[i]) return false;
	return true;
}

export { isArrayLikesEqual };