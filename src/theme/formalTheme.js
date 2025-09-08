// Formal Theme Configuration
export const formalTheme = {
  colors: {
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  }
};

export const statusColors = {
  'Draft': 'bg-neutral-100 text-neutral-700 border-neutral-200',
  'Submitted': 'bg-slate-100 text-slate-700 border-slate-200',
  'Pending - Faculty Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending - Audit Review': 'bg-slate-100 text-slate-700 border-slate-200',
  'Pending - Finance Review': 'bg-gray-100 text-gray-700 border-gray-200',
  'Faculty Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Audit Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Finance Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sent Back - Faculty': 'bg-amber-50 text-amber-700 border-amber-200',
  'Sent Back - Audit': 'bg-amber-50 text-amber-700 border-amber-200',
  'Sent Back - Finance': 'bg-amber-50 text-amber-700 border-amber-200'
};