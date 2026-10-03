import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileSchema, type Profile, type ProfileUpdateInput } from '@nexuscare/shared';
import { apiRequest } from '../../lib/api-client';
import { authQueryKeys } from '../auth/api';

export const profileQueryKeys = {
  own: ['profile', 'me'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.own,
    queryFn: ({ signal }) => apiRequest('/api/v1/me/profile', profileSchema, { signal }),
  });
}

/** After any profile change, refresh the cached profile and the session (name/avatar in the shell). */
function useProfileMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Profile>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (profile) => {
      queryClient.setQueryData(profileQueryKeys.own, profile);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
    },
  });
}

export function useUpdateProfile() {
  return useProfileMutation((input: ProfileUpdateInput) =>
    apiRequest('/api/v1/me/profile', profileSchema, { method: 'PUT', body: input }),
  );
}

/** Sends the raw image; the server validates, resizes to 256 px and strips metadata. */
export function useUploadAvatar() {
  return useProfileMutation((file: File) =>
    apiRequest('/api/v1/me/avatar', profileSchema, { method: 'PUT', body: file }),
  );
}

export function useRemoveAvatar() {
  return useProfileMutation(() =>
    apiRequest('/api/v1/me/avatar', profileSchema, { method: 'DELETE' }),
  );
}
