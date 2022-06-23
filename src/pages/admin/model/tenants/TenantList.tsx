import CmsTablePage from '#src/layout/components/CmsTablePage'
import Portal from '#src/layout/components/Portal'
import {RouteType, getParentPath} from '#src/lib/router'
import {Tenant, TenantStatusEnum, useTenantsS} from '#src/pouch'
import {ToastStore} from '#src/stores'
import {Fragment, h} from 'preact'

export default function TenantList({route}: {route: RouteType}) {
  const parentPath = getParentPath()
  const pageSize = 10
  const {
    category,
    search,
    page,
    sortBy,
    sortDirection,
  } = CmsTablePage.getTableProps()
  const [entries, refetch] = useTenantsS({
    ...(sortBy ? {sort: [{[sortBy]: sortDirection}]} : {}),
    selector: {
      $and: [
        ...(search
          ? [
              {
                $or: [
                  {name: {$regex: search}},
                  {status: {$regex: search}},
                ],
              },
            ]
          : []),
        ...(category ? [{status: category as any}] : []),
      ],
    },
    // TODO: Some day figure out pagination the right way
    // limit: pageSize, skip: (page - 1) * pageSize,
    limit: 200,
  })
  const byCategory = entries.keyBy('status')
  const entriesPaged = entries.slice((page - 1) * pageSize, page * pageSize)

  return (
    <CmsTablePage
      pageTitle={route.title}
      cols={[{label: 'Name'}, {label: 'Contact'}, {label: 'Status'}, {label: 'Joined'}]}
      categories={[
        {label: 'All', value: '', count: entries.length},
        ...Object.entries(byCategory).map(([k, v]) => ({
          label: k.toTitleCase(),
          value: k,
          count: v.length,
        })),
      ]}
      bulkOptions={[
        {label: 'Delete', cb: deleteCb},
        {label: 'Disable', cb: disableCb},
      ]}
      pages={Math.ceil(entries.length / pageSize)}
      total={entries.length}
      rows={entriesPaged.map(obj => ({
        obj,
        cols: [
          <a href={`${parentPath}/entry?id=${obj._id}`}>{obj.name}</a>,
          <Fragment>Bob (<a href={`mailto:${'bob@bob.com'}`}>{'bob@bob.com'}</a>)</Fragment>,
          obj.status,
          new Date(obj.createdAt).toLocaleDateString(),
        ],
      }))}
    />
  )

  async function deleteCb(selection: any[]) {
    const confirmed = await Portal.confirm({
      message: `Okay to delete ${selection.length} user(s)?`,
    })
    if (confirmed) {
      await Promise.all(selection.map((entry: Tenant) => entry.delete()))
      ToastStore.setValue({
        message: `Deleted ${selection.length} entries`,
        icon: 'success',
        placement: 'right',
      })
      await refetch()
    }
  }

  async function disableCb(selection: any[]) {
    // TODO: Disable should prompt for reason
    const confirmed = await Portal.confirm({
      message: `Okay to disable ${selection.length} tenants(s)?`,
    })
    if (confirmed) {
      await Promise.all(selection.map((entry: Tenant) => {
        entry.status = TenantStatusEnum.DISABLED
        return entry.save()
      }))
      ToastStore.setValue({
        message: `Disabled ${selection.length} tenant(s)`,
        icon: 'success',
        placement: 'right',
      })
      await refetch()
    }
  }
}
