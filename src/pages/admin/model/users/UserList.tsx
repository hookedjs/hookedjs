import CmsTablePage from '#src/layout/components/CmsTablePage'
import Portal from '#src/layout/components/Portal'
import {RouteType, getParentPath} from '#src/lib/router'
import {User, useUsersS} from '#src/pouch'
import {ToastStore} from '#src/stores'
import {h} from 'preact'

export default function UserList({route}: {route: RouteType}) {
  const parentPath = getParentPath()
  const pageSize = 10
  const {category, search, page, sortBy, sortDirection} = CmsTablePage.getTableProps()
  const [entries, refetch] = useUsersS({
    ...(sortBy ? {sort: [{[sortBy]: sortDirection}]} : {}),
    selector: {
      $and: [
        ...(search
          ? [
              {
                $or: [
                  {givenName: {$regex: search}},
                  {surname: {$regex: search}},
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
      cols={[{label: 'Name'}, {label: 'Email', sortValue: '_id'}, {label: 'Status'}, {label: 'Roles'}]}
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
        {label: 'Ban', cb: banCb},
      ]}
      pages={Math.ceil(entries.length / pageSize)}
      total={entries.length}
      rows={entriesPaged.map(entry => ({
        obj: entry,
        cols: [
          <a href={`${parentPath}/${entry.name}`}>{entry.fullName}</a>,
          <a href={`mailto:${entry.name}`}>{entry.name}</a>,
          entry.status,
          entry.roles.join(),
        ],
      }))}
    />
  )

  async function deleteCb(selection: any[]) {
    const confirmed = await Portal.confirm({
      message: `Okay to delete ${selection.length} user(s)?`,
    })
    if (confirmed) {
      await Promise.all(selection.map((entry: User) => entry.delete()))
      ToastStore.setValue({
        message: `Deleted ${selection.length} entries`,
        icon: 'success',
        placement: 'right',
      })
      await refetch()
    }
  }

  async function banCb(selection: any[]) {
    // TODO: Ban should prompt for reason
    const confirmed = await Portal.confirm({
      message: `Okay to ban ${selection.length} user(s)?`,
    })
    if (confirmed) {
      await Promise.all(selection.map((entry: User) => entry.ban('Banned by bulk action')))
      ToastStore.setValue({
        message: `Banned ${selection.length} user(s)`,
        icon: 'success',
        placement: 'right',
      })
      await refetch()
    }
  }
}
