import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// ---- Dashboard ----
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data,
    retry: false,
  });
}

// ---- Profile ----
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data.profile,
    retry: false,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.put('/profile', payload)).data.profile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) =>
      (await api.put('/auth/password', { currentPassword, newPassword })).data,
  });
}

// ---- Smoking events (relapse log) ----
export function useLogSmokingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/events', payload)).data.event,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  });
}

// ---- Fagerström ----
export function useFagerstromQuestions() {
  return useQuery({
    queryKey: ['fagerstrom-questions'],
    queryFn: async () => (await api.get('/fagerstrom/questions')).data,
  });
}

export function useLatestFagerstrom() {
  return useQuery({
    queryKey: ['fagerstrom-latest'],
    queryFn: async () => {
      try {
        return (await api.get('/fagerstrom/latest')).data.result;
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
}

export function useSubmitFagerstrom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (answers) => (await api.post('/fagerstrom', { answers })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fagerstrom-latest'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ---- Medications ----
export function useMedications() {
  return useQuery({
    queryKey: ['medications'],
    queryFn: async () => (await api.get('/medications')).data.regimens,
  });
}

export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/medications', payload)).data.regimen,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.put(`/medications/${id}`, payload)).data.regimen,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useLogAdherence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.post(`/medications/${id}/adherence`, payload)).data.adherence,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adherence-summary'] }),
  });
}

export function useAdherenceSummary(days = 7) {
  return useQuery({
    queryKey: ['adherence-summary', days],
    queryFn: async () => (await api.get(`/medications/adherence/summary?days=${days}`)).data,
  });
}

// ---- Journal ----
export function useJournalEntries(limit = 50) {
  return useQuery({
    queryKey: ['journal', limit],
    queryFn: async () => (await api.get(`/journal?limit=${limit}`)).data.entries,
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/journal', payload)).data.entry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  });
}

// ---- Breathing sessions ----
export function useBreathingHistory() {
  return useQuery({
    queryKey: ['breathing-history'],
    queryFn: async () => (await api.get('/breathing-sessions/history')).data,
  });
}

export function useLogBreathingSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/breathing-sessions', payload)).data.session,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['breathing-history'] }),
  });
}

// ---- Clinician PDF export ----
export async function downloadClinicianPdf() {
  const response = await api.get('/pdf/clinician-summary', { responseType: 'blob' });
  const url = window.URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clarity-clinician-summary.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
