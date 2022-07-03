import {replacePathVars} from '#src/lib/router'
import {nav} from '#src/lib/router'
import {useCurrentUserS, useTenantsS} from '#src/pouch'
import {Paths} from '#src/routes'
import {h} from 'preact'

export default function TenantSwitcher() {
  const user = useCurrentUserS()[0]!
  const [tenants] = useTenantsS()

  if (user.isAdmin) {
    nav(Paths.AdminRoot, {replace: true})
    return null
  }

  // if (tenants.length === 1) {
  //   nav(replacePathVars(Paths.TenantDashboardStack, {tenantId: tenants[0]._id}), {replace: true})
  //   return null
  // }

  return (
    <div>
      <h1>Select Account</h1>
      {tenants.length ? (
        tenants.map(tenant => (
          <p key={tenant._id}>
            <a href={replacePathVars(Paths.TenantDashboardStack, {tenantId: tenant._id})}>
              <button>{tenant.name}</button>
            </a>
          </p>
        ))
      ) : (
        <p>Welcome! Looks like you don't have an account yet. How about create one?</p>
      )}
      <p>
        <a href={Paths.TenantCreate}>
          <button>Create New</button>
        </a>
      </p>
    </div>
  )
}
