import {useEffect} from '#src/lib/hooks'
import {nav} from '#src/lib/router'
import {Paths} from '#src/routes'
import {AuthStore} from '#src/stores'
import {h} from 'preact'

export default function Logout() {
  useEffect(() => {
    AuthStore.logout().then(() => nav(Paths.Login))
  }, [])
  return <div />
}
