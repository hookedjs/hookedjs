export function isOnline() {
	return true
}

export function isOffline() {
	return !isOnline()
}

export async function waitForOnline() {
	await sleep(9999999)
}