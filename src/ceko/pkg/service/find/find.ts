function Interval(tasksBlock: string[][], str: string): [number, string] {
	let targetStart = "", targetEnd = ""
	let facedDash = false
	for (const c of str) {
		if (c != "-" && !facedDash) {
			targetStart += c
		} else if (c == "-") {
			facedDash = true
		} else {
			targetEnd += c
		}
	}
	if (!facedDash) {
		return [-1, "Invalid inputed string"]
	}
	for (let i = 0; i < tasksBlock.length; i++) {
		let block = tasksBlock[i]
		if (block[0] == targetStart && block[1] == targetEnd) {
			return [i, ""]
		}
	}
	return [-1, ""]
}

export default {
	Interval
}