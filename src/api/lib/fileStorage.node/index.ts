/**
 * An interface for isomorphic file storage
 */
import config from '../config.node'
import localFolder from './localFolder'

export default config.isProd ? localFolder : localFolder
