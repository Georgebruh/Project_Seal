// These interfaces tell TypeScript exactly what the data should look like
export interface MetricData {
  amount: string;
  trend: string;
  completedThisMonth: number;
}

export interface ActiveProjectData {
  total: number;
  nearDeadline: Array<{ id: number; name: string; date: string }>;
}

export interface TransactionData {
  id: number;
  projectId: number;
  message: string;
  time: string;
}

export interface SealData {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  amount: string;
  status: string;
  statusBg: string;
}

// Simulated API calls (Backend change this later on)
export const getFreelancerMetrics = async () => {
  // Simulate network delay of 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    earnings: { amount: '₱100,000', trend: '+12%', completedThisMonth: 4 },
    projects: {
      total: 3,
      nearDeadline: [
        { id: 101, name: 'Mobile App UI Setup', date: 'Feb 26' },
        { id: 102, name: 'Website Redesign', date: 'Feb 28' }
      ]
    },
    transactions: [
      { id: 501, projectId: 101, message: 'Escrow funded by Alex Rivera', time: '2 hours ago' },
      { id: 502, projectId: 102, message: 'Payment released for Logo', time: '1 day ago' }
    ]
  };
};

export const getFreelancerSeals = async (): Promise<SealData[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { id: 101, title: 'Website Redesign', subtitle: 'UI/UX Design', date: 'Feb 25, 2026', amount: '₱15,000', status: 'Completed', statusBg: 'bg-emerald-100 text-emerald-700' },
    { id: 102, title: 'Logo Design', subtitle: 'Brand Identity', date: 'Feb 20, 2026', amount: '₱8,500', status: 'Pending Review', statusBg: 'bg-amber-100 text-amber-700' },
    { id: 103, title: 'Mobile App UI', subtitle: 'Prototyping', date: 'Feb 15, 2026', amount: '₱25,000', status: 'Awaiting Funding', statusBg: 'bg-blue-100 text-blue-700' }
  ];
};