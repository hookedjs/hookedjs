export function load(tagName: string, attrs: Record<string, any>) {
	document.head.appendChild(Object.assign(document.createElement(tagName), attrs))
}