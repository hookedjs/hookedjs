import config from './config.web'

export let isOnline = false
export let isOffline = false
export let version = ''

export async function networkStatusRefresh() {
	const versionNext = config.isProd ? await fetch('/api/version').then(r => r.text()).catch(() => '') : 'dev'
	if (versionNext && !version) version = versionNext
	if (version !== versionNext) location.reload()
	isOnline = !!versionNext
	isOffline = !isOnline
}
setInterval(networkStatusRefresh, 4000)

export async function waitForOnline() {
	while(isOffline)
		await sleep(100)
}
