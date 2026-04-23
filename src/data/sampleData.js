export const templates = [
  {
    id: 't1',
    name: 'Welcome Letter',
    type: 'Letter',
    channel: 'Print',
    category: 'Onboarding',
    status: 'Active',
    lastModified: '2026-03-01',
    version: '3.2',
    description: 'New member welcome letter with plan summary and ID card instructions',
    variables: ['memberName', 'planName', 'effectiveDate', 'groupNumber', 'memberId']
  },
  {
    id: 't2',
    name: 'Explanation of Benefits',
    type: 'Statement',
    channel: 'Print + Email',
    category: 'Claims',
    status: 'Active',
    lastModified: '2026-02-28',
    version: '5.1',
    description: 'Detailed EOB with claim breakdown, provider info, and member responsibility',
    variables: ['memberName', 'claimNumber', 'serviceDate', 'providerName', 'amountBilled', 'amountAllowed', 'memberOwes']
  },
  {
    id: 't3',
    name: 'Claim Denial Notice',
    type: 'Letter',
    channel: 'Print + Email',
    category: 'Claims',
    status: 'Active',
    lastModified: '2026-02-15',
    version: '2.4',
    description: 'Denial notification with appeal rights and instructions',
    variables: ['memberName', 'claimNumber', 'denialReason', 'appealDeadline']
  },
  {
    id: 't4',
    name: 'Password Reset Email',
    type: 'Email',
    channel: 'Email',
    category: 'Account',
    status: 'Active',
    lastModified: '2026-03-05',
    version: '1.8',
    description: 'Account recovery email with secure reset link',
    variables: ['memberName', 'resetLink', 'expirationTime']
  },
  {
    id: 't5',
    name: 'Registration Confirmation',
    type: 'Email',
    channel: 'Email',
    category: 'Onboarding',
    status: 'Active',
    lastModified: '2026-03-06',
    version: '2.0',
    description: 'Portal registration confirmation with login instructions',
    variables: ['memberName', 'portalUrl', 'username']
  },
  {
    id: 't6',
    name: 'Annual Benefits Statement',
    type: 'Statement',
    channel: 'Print',
    category: 'Benefits',
    status: 'Draft',
    lastModified: '2026-03-08',
    version: '1.0',
    description: 'Year-end benefits utilization summary for members',
    variables: ['memberName', 'planYear', 'totalClaims', 'deductibleUsed', 'oopUsed']
  },
  {
    id: 't7',
    name: 'Premium Due Reminder',
    type: 'Email',
    channel: 'Email + SMS',
    category: 'Billing',
    status: 'Active',
    lastModified: '2026-02-20',
    version: '1.5',
    description: 'Payment reminder with due date and online payment link',
    variables: ['memberName', 'amountDue', 'dueDate', 'paymentUrl']
  },
  {
    id: 't8',
    name: 'ID Card Reprint',
    type: 'Letter',
    channel: 'Print',
    category: 'Account',
    status: 'Inactive',
    lastModified: '2026-01-10',
    version: '1.2',
    description: 'Replacement insurance ID card with updated member info',
    variables: ['memberName', 'memberId', 'groupNumber', 'planName', 'pcpName']
  }
]

export const communications = [
  {
    id: 'c1',
    name: 'Q1 EOB Batch — EE Portal',
    template: 'Explanation of Benefits',
    channel: 'Print + Email',
    recipients: 12480,
    sent: 12480,
    delivered: 12312,
    opened: 8945,
    failed: 168,
    status: 'Completed',
    sentDate: '2026-03-01',
    portal: 'EE Portal'
  },
  {
    id: 'c2',
    name: 'March Welcome Letters',
    template: 'Welcome Letter',
    channel: 'Print',
    recipients: 3200,
    sent: 3200,
    delivered: 3184,
    opened: null,
    failed: 16,
    status: 'Completed',
    sentDate: '2026-03-03',
    portal: 'EE Portal'
  },
  {
    id: 'c3',
    name: 'Password Reset — GI Commissions',
    template: 'Password Reset Email',
    channel: 'Email',
    recipients: 450,
    sent: 450,
    delivered: 448,
    opened: 392,
    failed: 2,
    status: 'Completed',
    sentDate: '2026-03-07',
    portal: 'GI Commissions'
  },
  {
    id: 'c4',
    name: 'Premium Reminders — March',
    template: 'Premium Due Reminder',
    channel: 'Email + SMS',
    recipients: 8750,
    sent: 0,
    delivered: 0,
    opened: 0,
    failed: 0,
    status: 'Scheduled',
    sentDate: '2026-03-15',
    portal: 'EE Portal'
  },
  {
    id: 'c5',
    name: 'Denial Notices — Week 10',
    template: 'Claim Denial Notice',
    channel: 'Print + Email',
    recipients: 285,
    sent: 285,
    delivered: 280,
    opened: 198,
    failed: 5,
    status: 'Completed',
    sentDate: '2026-03-06',
    portal: 'ER Portal'
  },
  {
    id: 'c6',
    name: 'Registration Confirmations — OSGLI',
    template: 'Registration Confirmation',
    channel: 'Email',
    recipients: 1200,
    sent: 600,
    delivered: 594,
    opened: 410,
    failed: 6,
    status: 'In Progress',
    sentDate: '2026-03-09',
    portal: 'GI OSGLI'
  }
]

export const activityLog = [
  { id: 'a1', time: '2026-03-09 14:22', user: 'Bel Capistrano', action: 'Updated template', detail: 'Password Reset Email v1.8 — updated reset link expiration to 24h', type: 'edit' },
  { id: 'a2', time: '2026-03-09 13:15', user: 'System', action: 'Batch completed', detail: 'Denial Notices — Week 10: 280/285 delivered (98.2%)', type: 'system' },
  { id: 'a3', time: '2026-03-09 11:00', user: 'Bel Capistrano', action: 'Created communication', detail: 'Registration Confirmations — OSGLI (1,200 recipients)', type: 'create' },
  { id: 'a4', time: '2026-03-08 16:45', user: 'System', action: 'Batch started', detail: 'Registration Confirmations — OSGLI processing started', type: 'system' },
  { id: 'a5', time: '2026-03-08 10:30', user: 'Bel Capistrano', action: 'Created template', detail: 'Annual Benefits Statement v1.0 — draft', type: 'create' },
  { id: 'a6', time: '2026-03-07 09:00', user: 'System', action: 'Scheduled', detail: 'Premium Reminders — March queued for 2026-03-15', type: 'system' },
]
