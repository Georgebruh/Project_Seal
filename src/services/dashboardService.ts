import {supabase} from '@/supabase'
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


//still a simualation for client dashbbpard

// Add these interfaces to your dashboardService.ts
export interface ClientSealData {
  id: number;
  title: string;
  freelancerName: string;
  date: string;
  amount: string;
  status: 'Awaiting Funding' | 'In Progress' | 'Pending Review' | 'Completed';
  statusBg: string;
}

export interface MetricSummary {
  total: number;
  top: Array<{ id: number; title: string; freelancerName: string }>;
}

export interface ClientDashboardData {
  activeSeals: MetricSummary;
  pendingReview: MetricSummary;
  sealsList: ClientSealData[];
}
export const getClientDashboardData = async (userId: string): Promise<ClientDashboardData> => {

  const { data, error } = await supabase
    .from('Seals')
    .select(`
      *,
      Profiles:freelancer_id (
        full_name
      )
    `)
    .eq('client_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Handle empty state
  if (!data || data.length === 0) {
    return {
      activeSeals: { total: 0, top: [] },
      pendingReview: { total: 0, top: [] },
      sealsList: []
    };
  }

  return {
    activeSeals: {
      total: data.filter(s => s.status === 'In progress').length,
      top: data.filter(s => s.status === 'In progress').slice(0, 2).map(s => ({
        id: s.id,
        title: s.project_name,
        
        freelancerName: s.Profiles?.full_name || 'Unknown Freelancer'
      }))
    },
    pendingReview: {
      total: data.filter(s => s.status === 'Awaiting funding').length,
      top: data.filter(s => s.status === 'Awaiting funding').slice(0, 2).map(s => ({
        id: s.id,
        title: s.project_name,
        freelancerName: s.Profiles?.full_name || 'Unknown Freelancer'
      }))
    },
    sealsList: data.map(s => ({
      id: s.id,
      title: s.project_name,
      freelancerName: s.Profiles?.full_name || 'Unknown Freelancer',
      date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A',      
      amount: `₱${(s.total_amount ?? 0).toLocaleString()}`,
      status: s.status,
      statusBg: getStatusColor(s.status)
    }))
  };
};

// Helper to keep logic out of the component
const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'In Progress': 'bg-blue-100 text-blue-700',
    'Pending Review': 'bg-purple-100 text-purple-700',
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Awaiting Funding': 'bg-amber-100 text-amber-700'
  };
  
  return map[status] || 'bg-gray-100 text-gray-700';
};