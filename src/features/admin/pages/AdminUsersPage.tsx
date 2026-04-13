import { IconUsers } from '@tabler/icons-react'
import { ic } from '../../../lib/tabler'
import { PageHeader } from '../../../components/ui/PageHeader'
import { UsersTable } from '../components/UsersTable'

export function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestioná los usuarios registrados: editá roles y activá o desactivá cuentas."
        icon={<IconUsers {...ic.header} aria-hidden />}
      />
      <UsersTable />
    </div>
  )
}
