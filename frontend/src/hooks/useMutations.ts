import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import type { AvailabilityStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';

export function useCreateMatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: api.CreateMatchInput) => api.createMatch(input),
    onSuccess: () => {
      showToast('Match scheduled! 🏏', 'success');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to schedule match', 'error');
    },
  });
}

export function useUpdateMatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: api.UpdateMatchInput }) =>
      api.updateMatch(id, input),
    onSuccess: () => {
      showToast('Match updated! ✏️', 'success');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update match', 'error');
    },
  });
}

export function useUpdateMatchResultMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: api.UpdateResultInput }) =>
      api.updateMatchResult(id, input),
    onSuccess: () => {
      showToast('Match result updated! 🏆', 'success');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update result', 'error');
    },
  });
}

export function useDeleteMatchMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteMatch(id),
    onSuccess: () => {
      showToast('Match deleted 🗑️', 'success');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to delete match', 'error');
    },
  });
}

export function useCreatePlayerMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: api.CreatePlayerInput) => api.createPlayer(input),
    onSuccess: (data) => {
      showToast(
        data.defaultPassword
          ? `Player added! Default password: ${data.defaultPassword} 🔑`
          : 'Player added to squad 👥',
        'success',
      );
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to add player', 'error');
    },
  });
}

export function useCreateVenueMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: api.CreateVenueInput) => api.createVenue(input),
    onSuccess: () => {
      showToast('Venue added 📍', 'success');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to add venue', 'error');
    },
  });
}

export function useLoginMutation() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      api.login(phone, password),
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });
}

export function useRegisterMutation() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: api.RegisterInput) => api.register(input),
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });
}

export function useChangePasswordMutation() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      api.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      showToast('Password changed successfully 🔒', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to change password', 'error');
    },
  });
}

export function useLogoutMutation() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      showToast('Logged out successfully', 'success');
    },
  });
}

export function useAvailabilityMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ matchId, status }: { matchId: string; status: AvailabilityStatus }) =>
      api.setMyAvailability(matchId, status),
    onSuccess: (_, variables) => {
      showToast('Availability updated! 🏏', 'success');
      queryClient.invalidateQueries({ queryKey: ['availability', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update availability', 'error');
    },
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ message }: { message: string }) => api.createAnnouncement(message),
    onSuccess: () => {
      showToast('Announcement posted 📢', 'success');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to post announcement', 'error');
    },
  });
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      api.updateAnnouncement(id, message),
    onSuccess: () => {
      showToast('Announcement updated ✏️', 'success');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update announcement', 'error');
    },
  });
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteAnnouncement(id),
    onSuccess: () => {
      showToast('Announcement deleted 🗑️', 'success');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to delete announcement', 'error');
    },
  });
}

export function useToggleVenueFavoriteMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.toggleVenueFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update favorite', 'error');
    },
  });
}

export function useUpdatePlayerMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<api.CreatePlayerInput> }) =>
      api.updatePlayer(id, input),
    onSuccess: () => {
      showToast('Player updated ✏️', 'success');
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update player', 'error');
    },
  });
}

export function useDeletePlayerMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deletePlayer(id),
    onSuccess: () => {
      showToast('Player removed 🗑️', 'success');
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to remove player', 'error');
    },
  });
}

export function useUpdateVenueMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<api.CreateVenueInput> }) =>
      api.updateVenue(id, input),
    onSuccess: () => {
      showToast('Venue updated ✏️', 'success');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update venue', 'error');
    },
  });
}

export function useDeleteVenueMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteVenue(id),
    onSuccess: () => {
      showToast('Venue deleted 🗑️', 'success');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to delete venue, match scheduled at this venue', 'error');
    },
  });
}
