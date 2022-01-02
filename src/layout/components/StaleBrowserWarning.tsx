import { h } from 'preact'
import Toast from "#src/layout/components/Toast"
import { Fragment } from "preact"

export function StaleBrowserWarning() {
    const isModern = (
        'fetch' in window &&
        'Promise' in window &&
        'assign' in Object &&
        'keys' in Object
    )
    return isModern
        ? <Fragment />
        : <Toast
            icon="error"
            placement="bottom"
            duration={-1}
            message={<span>Please use a modern browser and/or update. Internet Explorer is <i>not</i> supported.</span>}
        />

}