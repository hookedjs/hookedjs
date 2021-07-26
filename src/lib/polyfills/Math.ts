/**
 * Extensions for Math
 */

export {}

declare global {
	interface Math {
		/**
		 * Returns true or false randomly
		 * @returns - true or false randomly
		 */
		randomBool(): boolean
	}
}

Math.randomBool = () => Math.random() > 0.5 
