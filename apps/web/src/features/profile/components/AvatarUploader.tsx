import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { AVATAR_MIME_TYPES, type Profile } from '@nexuscare/shared';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/Field';
import { useToast } from '../../../components/ui/toast-context';
import { ApiError } from '../../../lib/api-client';
import { useRemoveAvatar, useUploadAvatar } from '../api';
import { validateAvatarFile } from '../avatar-validation';

export function AvatarUploader({ profile }: { profile: Profile }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const { toast } = useToast();
  const busy = upload.isPending || remove.isPending;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const problem = validateAvatarFile(file);
    setError(problem);
    if (problem) return;
    upload.mutate(file, {
      onSuccess: () => {
        toast({ tone: 'success', title: 'Profile photo updated' });
      },
      onError: (e) => {
        setError(e instanceof ApiError ? e.message : 'The photo could not be uploaded.');
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <Avatar name={profile.fullName} src={profile.avatarUrl} size="xl" />
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={upload.isPending}
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera aria-hidden="true" />
            {profile.avatarUrl ? 'Change photo' : 'Upload photo'}
          </Button>
          {profile.avatarUrl ? (
            <Button
              variant="ghost"
              size="sm"
              loading={remove.isPending}
              disabled={busy}
              onClick={() => {
                setError(null);
                remove.mutate(undefined, {
                  onSuccess: () => {
                    toast({ title: 'Profile photo removed' });
                  },
                });
              }}
            >
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">JPEG, PNG or WebP, up to 2 MB.</p>
        {error ? <FieldError>{error}</FieldError> : null}
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_MIME_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            onFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
