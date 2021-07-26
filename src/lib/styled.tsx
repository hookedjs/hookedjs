/**
 * Features to support css-in-js, similarly to styled-components but extremely lean
 * 
 * Styled-components and it's dependencies are > 30kb gzipped. That, and it doesn't
 * even support preact. In contrast, this library is < 1kb gzipped.
 * 
 * Inspired by styled-components and styled-jsx (thanks!)
 */
import { h } from 'preact'

let count = 0
const pcssFlag = true

/**
 * Injects style elements to the page if they don't already exist
 *
 * @param css - css to be transpiled and injected. :root is replaced by a unique class
 *
 * Returns the unique class name
 */
export default function styled(strings: TemplateStringsArray, ...placeHolders: string[]) {
	let css = strings.map((s, i) => s + (placeHolders?.[i] ?? '')).join('')
	const root = 's' + count++
	css = css.replace(/:root/g, '.' + root)
	if (pcssFlag) css = processPcss(css)
	const style = document.createElement('style')
	style.type = 'text/css'
	style.innerHTML = css
	document.head.appendChild(style)
	return root
}

/**
 * Factories to quickly create elements with css styles
 * @param css - css to be transpiled and injected. :root is replaced by a unique class
 */
type Ref<T> = { current: T }
type Props<T extends HTMLElement> = h.JSX.HTMLAttributes<T> & {forwardRef?: Ref<T>}
styled.a = function a(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLAnchorElement>) {
		return <a {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.button = function button(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLButtonElement>) {
		return <button {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.div = function div(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLDivElement>) {
		return <div {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.pre = function pre(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLPreElement>) {
		return <pre {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.img = function img(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLImageElement>) {
		return <img {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.form = function div(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLFormElement>) {
		return <form {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.input = function input(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLInputElement>) {
		return <input {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.label = function label(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLLabelElement>) {
		return <label {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.nav = function nav(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLElement>) {
		return <nav {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}
styled.span = function span(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLSpanElement>) {
		return <span {...p} ref={p.forwardRef} class={combineClasses(root, p.class, p.className)} />
	}
}
styled.table = function table(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLTableElement>) {
		return <table {...p} ref={p.forwardRef} class={combineClasses(root, p.class, p.className)} />
	}
}
styled.td = function td(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLTableDataCellElement>) {
		return <td {...p} ref={p.forwardRef} class={combineClasses(root, p.class, p.className)} />
	}
}
styled.tr = function tr(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLTableRowElement>) {
		return <tr {...p} ref={p.forwardRef} class={combineClasses(root, p.class, p.className)} />
	}
}
styled.textarea = function textarea(strings: TemplateStringsArray, ...placeHolders: string[]) {
	const root = styled`${assembleTemplateString(strings, placeHolders)}`
	return function C(p: Props<HTMLTextAreaElement>) {
		return <textarea {...p} ref={p.forwardRef} class={combineClasses(root,p.class,p.className)} />
	}
}


function assembleTemplateString(strings: TemplateStringsArray, placeHolders: string[]) {
	return strings.map((s, i) => s + (placeHolders?.[i] ?? '')).join('')
}

function combineClasses(...classes: (string | undefined)[]) {
	return classes.filter(c => c).join(' ')
}

/**
 * Converts my css shorthand (aka pcss) to real css
 * - Treats indentation as indicator for '{' and '}'
 * - Auto-appends ';' to end of lines
 * 
 * Assumptions/Reqs: 
 * - No '{' or '}' allowed in pcss
 * - starts and ends with a new-line (aka \n)
 * - Use \t or 2-space indents
 * 
 * ex. `
 *   .cool-class
 *     display: none
 * `
 *
 * converts to `
 *   .cool-class {
 *     display: none;
 *   }
 * `
 */
function processPcss(pcss: string) {
	pcss = pcss.replace(/ {2}/g, '\t')
	const lines = pcss.split('\n')
	let initialIndent = 0
	let lastIndent = 0

	lines.forEach((l, i) => {
		let currentIndent = 0
		for (const c of l) {
			if (c === '\t') currentIndent++
			else break
		}
		if (i === 1) initialIndent = currentIndent

		if (i <= 1) {}
		else if (currentIndent > lastIndent)
			lines[i - 1] = lines[i - 1] + '{'
		else if (currentIndent < lastIndent) {
			let closeCount = lastIndent - currentIndent
			if (i===lines.length-1) closeCount-=initialIndent
			for (let ci = 0; ci < closeCount; ci++)
				lines[i - 1] += '}'
		} else if (i > 1 && !lines[i - 1].endsWith(','))
			lines[i - 1] += ';'

		lastIndent = currentIndent
	})
	return lines.join('\n')
}
