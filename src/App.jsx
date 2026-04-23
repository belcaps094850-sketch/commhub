import { useState } from 'react'
import { useStore } from './hooks/useStore'
import Sidebar from './components/Sidebar'
import DashboardWidgets from './components/DashboardWidgets'
import Templates from './components/Templates'
import Communications from './components/Communications'
import Compose from './components/Compose'
import Recipients from './components/Recipients'
import Analytics from './components/Analytics'
import TemplateEditor from './components/TemplateEditor'
import AuditTrail from './components/AuditTrail'
import NotificationPage, { NotificationBell, NotificationDropdown } from './components/NotificationCenter'
import RoleAccess from './components/RoleAccess'
import Approvals from './components/Approvals'
import Archive from './components/Archive'
import Segments from './components/Segments'
import ABTesting from './components/ABTesting'
import ScheduledReports from './components/ScheduledReports'
import JourneyMap from './components/JourneyMap'
import DragDropDesigner from './components/DragDropDesigner'
import NextSteps from './components/NextSteps'

function App() {
  const store = useStore()
  const [page, setPage] = useState('dashboard')
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  const markRead = (id) => {
    store.updateItem('notifications', id, { read: true })
  }

  const markAllRead = () => {
    store.update('notifications', prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleNotifAction = (n) => {
    markRead(n.id)
    setShowNotifDropdown(false)
    if (n.actionPage) setPage(n.actionPage)
  }

  const handleRoleChange = (role) => {
    store.update('currentRole', role)
    store.addActivity('Role changed', `Switched to ${role} role`, 'system')
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardWidgets onNavigate={setPage} store={store} />
      case 'templates': return <Templates onEdit={() => setPage('editor')} store={store} />
      case 'communications': return <Communications store={store} />
      case 'compose': return <Compose onNavigate={setPage} store={store} />
      case 'recipients': return <Recipients store={store} />
      case 'analytics': return <Analytics store={store} />
      case 'editor': return <TemplateEditor onBack={() => setPage('templates')} store={store} />
      case 'designer': return <DragDropDesigner store={store} />
      case 'audit': return <AuditTrail store={store} />
      case 'notifications': return <NotificationPage notifications={store.notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} />
      case 'access': return <RoleAccess currentRole={store.currentRole} onRoleChange={handleRoleChange} store={store} />
      case 'approvals': return <Approvals store={store} />
      case 'archive': return <Archive store={store} />
      case 'segments': return <Segments store={store} />
      case 'abtesting': return <ABTesting store={store} />
      case 'reports': return <ScheduledReports store={store} />
      case 'journey': return <JourneyMap store={store} />
      case 'nextsteps': return <NextSteps />
      default: return <DashboardWidgets onNavigate={setPage} store={store} />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={page} onNavigate={setPage} currentRole={store.currentRole} />
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
          padding: '8px 32px', borderBottom: '1px solid #f0f0f0', position: 'relative'
        }}>
          <span style={{ fontSize: 11, color: '#999' }}>Role: {store.currentRole}</span>
          <NotificationBell notifications={store.notifications} onClick={() => setShowNotifDropdown(!showNotifDropdown)} />
          {showNotifDropdown && (
            <NotificationDropdown
              notifications={store.notifications}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onAction={handleNotifAction}
              onClose={() => setShowNotifDropdown(false)}
            />
          )}
        </div>
        <div style={{ padding: '28px 32px', maxWidth: 960 }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default App
