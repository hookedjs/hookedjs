import {nav} from '#src/lib/router'
import {Paths} from '#src/routes'
import {h} from 'preact'

export default function TenantSwitcher() {
  const tenants: any[] = []

  return (
    <div>
      <h1>Select Account</h1>
      {tenants?.map(
        tenant =>
          (
            <p key={tenant.id}>
              <a href={Paths.TenantDashboardStack} onClick={selectTenant}>
                <button>{tenant.name}</button>
              </a>
            </p>
          ) ?? <p>Welcome! Looks like you don't have an account yet. How about create one?</p>,
      )}
      <p>
        <a href={Paths.TenantCreate}>
          <button>Create New</button>
        </a>
      </p>
    </div>
  )

  async function selectTenant(e: any) {
    e.preventDefault()
    // const user = (await Users.getCurrent())!
    // user.defaultTenantId = tenant!.id
    // user.save()
    // AuthStore.value.currentTenantId = tenant
    nav(e.target.href)
  }
}
