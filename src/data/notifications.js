export const defaultNotifications = [
  { id: 'n1', type: 'critical', title: 'Regulatory Alert', message: 'NY state requires 60-day appeal window on denial notices. Template flagged for review.', time: '2026-03-09 14:30', read: false, action: 'Review Template', actionPage: 'templates' },
  { id: 'n2', type: 'warning', title: 'Delivery Failures', message: 'Registration Confirmations — OSGLI: 6 delivery failures detected (1.0%).', time: '2026-03-09 13:45', read: false, action: 'View Details', actionPage: 'communications' },
  { id: 'n3', type: 'info', title: 'Approval Requested', message: 'Annual Benefits Statement v1.0 submitted for review by Bel Capistrano.', time: '2026-03-09 11:30', read: false, action: 'Review', actionPage: 'approvals' },
  { id: 'n4', type: 'info', title: 'Batch Completed', message: 'Denial Notices — Week 10: 280/285 delivered (98.2%). 5 failures logged.', time: '2026-03-09 10:15', read: true, action: null, actionPage: null },
  { id: 'n5', type: 'info', title: 'Batch In Progress', message: 'Registration Confirmations — OSGLI: 600 of 1,200 sent (50%).', time: '2026-03-09 09:00', read: true, action: 'Track', actionPage: 'communications' },
  { id: 'n6', type: 'warning', title: 'Compliance Scan', message: 'Weekly scan found 1 issue: Claim Denial template missing updated appeal deadline language.', time: '2026-03-08 08:00', read: true, action: 'Fix Now', actionPage: 'editor' },
  { id: 'n7', type: 'info', title: 'Scheduled Reminder', message: 'Premium Reminders — March batch scheduled for 2026-03-15. 8,750 recipients.', time: '2026-03-07 09:00', read: true, action: null, actionPage: null },
  { id: 'n8', type: 'info', title: 'Template Approved', message: 'Registration Confirmation v2.0 approved and moved to Active status.', time: '2026-03-06 14:12', read: true, action: null, actionPage: null },
]

export const roles = {
  admin: {
    label: 'Admin',
    description: 'Full system access',
    permissions: ['create_template', 'edit_template', 'delete_template', 'approve_template', 'create_comm', 'send_comm', 'manage_recipients', 'view_analytics', 'view_audit', 'manage_roles', 'manage_settings', 'export_data']
  },
  templateManager: {
    label: 'Template Manager',
    description: 'Create, edit, and submit templates for approval',
    permissions: ['create_template', 'edit_template', 'create_comm', 'view_analytics', 'view_audit', 'export_data']
  },
  reviewer: {
    label: 'Reviewer',
    description: 'Review and approve template changes',
    permissions: ['approve_template', 'view_analytics', 'view_audit']
  },
  operator: {
    label: 'Operator',
    description: 'Create and send communications',
    permissions: ['create_comm', 'send_comm', 'manage_recipients', 'view_analytics', 'export_data']
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to all data',
    permissions: ['view_analytics', 'view_audit']
  }
}

export const allPermissions = [
  { key: 'create_template', label: 'Create Templates', category: 'Templates' },
  { key: 'edit_template', label: 'Edit Templates', category: 'Templates' },
  { key: 'delete_template', label: 'Delete Templates', category: 'Templates' },
  { key: 'approve_template', label: 'Approve Templates', category: 'Templates' },
  { key: 'create_comm', label: 'Create Communications', category: 'Communications' },
  { key: 'send_comm', label: 'Send Communications', category: 'Communications' },
  { key: 'manage_recipients', label: 'Manage Recipients', category: 'Recipients' },
  { key: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
  { key: 'view_audit', label: 'View Audit Trail', category: 'Compliance' },
  { key: 'manage_roles', label: 'Manage Roles & Users', category: 'Admin' },
  { key: 'manage_settings', label: 'System Settings', category: 'Admin' },
  { key: 'export_data', label: 'Export Data', category: 'Data' },
]

export const users = [
  { id: 'u1', name: 'Bel Capistrano', email: 'bel@company.com', role: 'admin', lastLogin: '2026-03-09 14:30', status: 'Active' },
  { id: 'u2', name: 'Sarah Chen', email: 'schen@company.com', role: 'templateManager', lastLogin: '2026-03-09 10:15', status: 'Active' },
  { id: 'u3', name: 'Mike Torres', email: 'mtorres@company.com', role: 'reviewer', lastLogin: '2026-03-08 16:00', status: 'Active' },
  { id: 'u4', name: 'Lisa Park', email: 'lpark@company.com', role: 'operator', lastLogin: '2026-03-09 09:30', status: 'Active' },
  { id: 'u5', name: 'James Wilson', email: 'jwilson@company.com', role: 'viewer', lastLogin: '2026-03-07 11:00', status: 'Active' },
  { id: 'u6', name: 'Amy Rodriguez', email: 'arodriguez@company.com', role: 'templateManager', lastLogin: '2026-03-05 14:20', status: 'Inactive' },
]
