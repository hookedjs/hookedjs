export function load(tagName: string, attrs: Record<string, any>) {
	document.head.appendChild(assign(document.createElement(tagName), attrs))
}