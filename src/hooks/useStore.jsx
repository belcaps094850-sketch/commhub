import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { templates as defaultTemplates, communications as defaultComms, activityLog as defaultActivity } from '../data/sampleData'
import { defaultNotifications, users as defaultUsers } from '../data/notifications'

const STORE_KEY = 'commhub-data'
const STORE_VERSION = 2

const defaultSegments = [
  { id: 's1', name: 'All Gold PPO Members', portal: 'EE Portal', filters: [{ field: 'plan', op: 'equals', value: 'Gold PPO' }], matchCount: 4280, createdBy: 'Bel Capistrano', createdAt: '2026-03-01', lastUsed: '2026-03-01', usedCount: 3 },
  { id: 's2', name: 'New Enrollees — March 2026', portal: 'EE Portal', filters: [{ field: 'enrollDate', op: 'after', value: '2026-03-01' }, { field: 'status', op: 'equals', value: 'Active' }], matchCount: 1150, createdBy: 'Bel Capistrano', createdAt: '2026-03-03', lastUsed: '2026-03-03', usedCount: 1 },
  { id: 's3', name: 'Failed Delivery — Rebatch', portal: 'All', filters: [{ field: 'lastDelivery', op: 'equals', value: 'Failed' }, { field: 'email', op: 'is_not_empty', value: '' }], matchCount: 191, createdBy: 'Lisa Park', createdAt: '2026-03-06', lastUsed: '2026-03-06', usedCount: 1 },
  { id: 's4', name: 'GI Commissions — Tier 1 Agents', portal: 'GI Commissions', filters: [{ field: 'plan', op: 'equals', value: 'Agent Tier 1' }], matchCount: 820, createdBy: 'Bel Capistrano', createdAt: '2026-02-15', lastUsed: '2026-03-07', usedCount: 5 },
  { id: 's5', name: 'OSGLI — Pending Registration', portal: 'GI OSGLI', filters: [{ field: 'status', op: 'equals', value: 'Pending' }], matchCount: 340, createdBy: 'Sarah Chen', createdAt: '2026-03-08', lastUsed: null, usedCount: 0 },
  { id: 's6', name: 'NY Members (Regulatory)', portal: 'EE Portal', filters: [{ field: 'state', op: 'equals', value: 'NY' }, { field: 'status', op: 'equals', value: 'Active' }], matchCount: 2100, createdBy: 'Bel Capistrano', createdAt: '2026-02-28', lastUsed: '2026-03-06', usedCount: 2 },
]

const defaultApprovals = [
  { id: 'ap1', template: 'Annual Benefits Statement', version: '1.0', status: 'pending', submittedBy: 'Bel Capistrano', submittedAt: '2026-03-08 10:30', reviewer: 'Mike Torres', category: 'Benefits', changes: 'New template for year-end benefits utilization summary.', comments: [] },
  { id: 'ap2', template: 'Claim Denial Notice', version: '2.5', status: 'changes_requested', submittedBy: 'Sarah Chen', submittedAt: '2026-03-07 14:00', reviewer: 'Mike Torres', category: 'Claims', changes: 'Updated appeal window from 45 to 60 days per NY state regulation.', comments: [{ user: 'Mike Torres', time: '2026-03-07 16:30', text: 'Appeal rights section needs to reference specific NY Insurance Law §4914.' }] },
  { id: 'ap3', template: 'Registration Confirmation', version: '2.0', status: 'approved', submittedBy: 'Bel Capistrano', submittedAt: '2026-03-05 11:00', reviewer: 'Mike Torres', category: 'Onboarding', changes: 'Added portal URL and username display. ForgeRock migration compatibility.', comments: [{ user: 'Mike Torres', time: '2026-03-06 14:12', text: 'Looks good. Approved.' }], approvedAt: '2026-03-06 14:12' },
]

const defaultABTests = [
  { id: 'ab1', name: 'EOB Subject Line Test', template: 'Explanation of Benefits', status: 'completed', variantA: { name: 'Original', subject: 'Your Explanation of Benefits', sent: 1248, opened: 874, openRate: 70.0 }, variantB: { name: 'Personalized', subject: '{{memberName}}, your claim summary is ready', sent: 1248, opened: 1048, openRate: 84.0 }, winner: 'B', startDate: '2026-02-20', endDate: '2026-02-24', totalAudience: 12480, testPercent: 20 },
  { id: 'ab2', name: 'Premium Reminder — Urgency Test', template: 'Premium Due Reminder', status: 'completed', variantA: { name: 'Standard', subject: 'Payment Reminder', sent: 438, opened: 263, openRate: 60.0 }, variantB: { name: 'Urgent', subject: 'Action Required: Payment Due {{dueDate}}', sent: 437, opened: 341, openRate: 78.0 }, winner: 'B', startDate: '2026-02-25', endDate: '2026-03-01', totalAudience: 8750, testPercent: 10 },
  { id: 'ab3', name: 'Welcome Letter Format', template: 'Welcome Letter', status: 'running', variantA: { name: 'Long Form', subject: null, sent: 160, opened: null, openRate: null }, variantB: { name: 'Checklist Style', subject: null, sent: 160, opened: null, openRate: null }, winner: null, startDate: '2026-03-08', endDate: '2026-03-12', totalAudience: 3200, testPercent: 10 },
]

const defaultReports = [
  { id: 'rp1', name: 'Weekly Delivery Summary', type: 'Delivery Summary', frequency: 'Weekly', day: 'Monday', time: '08:00', recipients: ['bel@company.com', 'mtorres@company.com'], portal: 'All', enabled: true, lastSent: '2026-03-03 08:00', nextSend: '2026-03-10 08:00' },
  { id: 'rp2', name: 'Monthly Template Usage', type: 'Template Usage', frequency: 'Monthly', day: '1st', time: '09:00', recipients: ['bel@company.com'], portal: 'All', enabled: true, lastSent: '2026-03-01 09:00', nextSend: '2026-04-01 09:00' },
  { id: 'rp3', name: 'Daily Failure Analysis', type: 'Failure Analysis', frequency: 'Daily', day: null, time: '07:00', recipients: ['bel@company.com', 'lpark@company.com'], portal: 'All', enabled: true, lastSent: '2026-03-09 07:00', nextSend: '2026-03-10 07:00' },
  { id: 'rp4', name: 'Compliance Status — EE Portal', type: 'Compliance Status', frequency: 'Weekly', day: 'Friday', time: '16:00', recipients: ['bel@company.com', 'mtorres@company.com', 'schen@company.com'], portal: 'EE Portal', enabled: true, lastSent: '2026-03-07 16:00', nextSend: '2026-03-14 16:00' },
]

const defaultDashboardWidgets = ['delivery', 'channels', 'portals', 'templates', 'pipeline', 'alerts']

function getInitialState() {
  return {
    version: STORE_VERSION,
    templates: defaultTemplates,
    communications: defaultComms,
    notifications: defaultNotifications,
    activityLog: defaultActivity,
    users: defaultUsers,
    approvals: defaultApprovals,
    segments: defaultSegments,
    abTests: defaultABTests,
    reports: defaultReports,
    dashboardWidgets: defaultDashboardWidgets,
    currentRole: 'admin',
    settings: {
      theme: 'light',
      defaultPortal: 'All',
    }
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return getInitialState()
    const parsed = JSON.parse(raw)
    if (parsed.version !== STORE_VERSION) return getInitialState()
    return parsed
  } catch {
    return getInitialState()
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save state:', e)
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState)

  // Auto-save on every state change
  useEffect(() => {
    saveState(state)
  }, [state])

  const update = useCallback((key, value) => {
    setState(prev => {
      const newVal = typeof value === 'function' ? value(prev[key]) : value
      return { ...prev, [key]: newVal }
    })
  }, [])

  const addItem = useCallback((key, item) => {
    setState(prev => ({ ...prev, [key]: [item, ...prev[key]] }))
  }, [])

  const updateItem = useCallback((key, id, changes) => {
    setState(prev => ({
      ...prev,
      [key]: prev[key].map(item =>
        item.id === id ? { ...item, ...(typeof changes === 'function' ? changes(item) : changes) } : item
      )
    }))
  }, [])

  const removeItem = useCallback((key, id) => {
    setState(prev => ({ ...prev, [key]: prev[key].filter(item => item.id !== id) }))
  }, [])

  const resetAll = useCallback(() => {
    const fresh = getInitialState()
    setState(fresh)
  }, [])

  const addActivity = useCallback((action, detail, type = 'edit') => {
    const entry = {
      id: `a${Date.now()}`,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: 'Bel Capistrano',
      action, detail, type
    }
    setState(prev => ({ ...prev, activityLog: [entry, ...prev.activityLog].slice(0, 50) }))
  }, [])

  const addNotification = useCallback((type, title, message, action = null, actionPage = null) => {
    const notif = {
      id: `n${Date.now()}`,
      type, title, message, action, actionPage,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: false
    }
    setState(prev => ({ ...prev, notifications: [notif, ...prev.notifications] }))
  }, [])

  const value = {
    ...state,
    update,
    addItem,
    updateItem,
    removeItem,
    resetAll,
    addActivity,
    addNotification,
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
