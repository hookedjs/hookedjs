import {ComponentChildren, h, render} from 'preact'

import { load } from '../../lib/assets'
import { useEffect, useRef } from '../../lib/hooks'

const mapboxToken = 'pk.eyJ1IjoiYmVuZXZvbGVudHRlY2giLCJhIjoiY2tsaTg3NmVxMDVxMDJwcGFreWlicXFvMSJ9.CG7wB0tQeRY_H7FAgplmKg'

export interface MapMarker {
	title: string
	lat: number
	long: number
	popup: ComponentChildren // JSX is accepted, but note they cannot access context using context hooks
	popupWidth: string
}

/**
 * Display a Leaflet Map
 */
export default function OpenMap(p: {
	height: number
	markers: MapMarker[]
	center?: Coords
	zoom?: number
	initialZoom?: number
	maxZoom?: number
	minZoom?: number
}) {
	const mapId = useRef(`map-${Math.ceil(Math.random()*100)}`).current
	useEffect(() => {load()}, [])
	return <div id={mapId} style={{height:p.height, zIndex: 0}}></div>

	async function load() {
		await loadLib()
		
		const lMap = L.map(mapId)
		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			minZoom: p.minZoom ?? 1,
			maxZoom: p.maxZoom ?? 18,
			id: 'mapbox/streets-v11',
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapboxToken
		}).addTo(lMap)

		const lIcon = L.divIcon()

		const popup = L.popup()
		lMap.on('click', function onMapClick(e) {
			popup
				.setLatLng(e.latlng)
				.setContent('You clicked the map at ' + e.latlng.toString())
				.openOn(lMap)
		})
		
		const lMarkers = p.markers.map(function _addMarker(m,i) {
			const id = `marker-${i}-${Math.ceil(Math.random() * 100)}`
			return L.marker([m.lat, m.long], {title: m.title, icon: lIcon}).addTo(lMap)
				.bindPopup(`<div style="width:${m.popupWidth}" id="${id}"></div>`)
				.on('click', function() {
					render(<div style={{ width: m.popupWidth }}>{m.popup}</div>, document.getElementById(id)!)	
				})
		})

		const lGroup = new L.featureGroup(lMarkers)

		if (p.center)
			lMap.setView(p.center, p.zoom ?? 10)
		else {
			lMap.fitBounds(lGroup.getBounds(), {padding: [30, 30], maxZoom: 13})
			if (p.zoom)
				lMap.setZoom(p.zoom)
		}
	}
}

// Loads the leaflet library from cdn and resolves when done
function loadLib() {
	return new Promise<void>(function _loadLib(res) {
		if (loadLib.libLoaded++) return res()
		const base = '/lib/leaflet/leaflet.'
		load('link', { href: base + (window.isProd ? 'min.css' : 'css'), rel: 'stylesheet', crossorigin: '' })
		load('style', { innerHTML: `
			.leaflet-div-icon {
				color: var(--primary);
				margin-top: -2px !important;
				margin-left: -13px !important;
				background: none;
				box-sizing: border-box;
				border-left: 12px solid transparent;
				border-right: 12px solid transparent;
				border-top: 12px solid currentColor;
				border-bottom: none;
			}
			.leaflet-div-icon:hover {color: var(--secondary)}
			.leaflet-container a {color: var(--primary)}
			.leaflet-container a:hover {color: var(--primary-hover)}
		`})
		load('script', { src: base + 'js', crossorigin: '', async: true, onload() { res() } })
	})
}
loadLib.libLoaded = 0

/**
 * Types are non-exhaustive and added as-needed
 */
declare const L: {
	map: (id: string) => LMap
	tileLayer: (src: string, options: Record<string, string | number>) => LTileLayer
	marker: (coords: Coords, options?: LMarkerOptions) => LMarker
	circle: (coords: Coords, options: Record<string, string | number>) => LCircle
	popup: () => LPopup
	divIcon: (className?: string) => any
	featureGroup: LFeatureGroup
}
interface LMap {
	on: (event: string, callback: (e: any) => any) => LMap
	setView: (coords: Coords, zoom: number) => LMap
	setZoom: (zoom: number) => LMap
	onClick: (callback: (e: { latlng: Coords }) => LMap) => LMap
	fitBounds: (markers: LMarker, options?: {padding?: [lat: number, long: number], maxZoom?: number}) => LMap
}
interface LTileLayer {
	addTo: (map: LMap) => LTileLayer
}
interface LMarkerOptions {
	title?: string
	icon?: any
}
interface LFeatureGroup {
	new (markers: LMarker[]): any
}
interface LMarker {
	addTo: (map: LMap) => LMarker
	bindPopup: (html: string) => LMarker
	openPopup: () => LMarker
	on: (event: string, callback: (e: any) => any) => LMarker
}
interface LPopup {
	setLatLng: (coords: Coords) => LPopup
	setContent: (html: string) => LPopup
	openOn: (map: LMap) => LPopup
}
interface LCircle {
	addTo: (map: LMap) => LTileLayer
}
type Coords = [lat: number, long: number]