import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteFile, fetchFiles, uploadFile } from '../api/files';
import type { FileCategory, StoredFile } from '../types';

const fileKeys = { all: ['files'] as const };

export function useFiles() {
  return useQuery({ queryKey: fileKeys.all, queryFn: ({ signal }) => fetchFiles(signal) });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ files, category }: { files: File[]; category: FileCategory }) => {
      const results = await Promise.allSettled(files.map((file) => uploadFile(file, category)));
      return {
        uploaded: results.flatMap((result) =>
          result.status === 'fulfilled' ? [result.value] : [],
        ),
        failed: files
          .filter((_, index) => results[index]?.status === 'rejected')
          .map((file) => file.name),
      };
    },
    onSuccess: ({ uploaded }) => {
      queryClient.setQueryData<StoredFile[]>(fileKeys.all, (files = []) => [...uploaded, ...files]);
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<StoredFile[]>(fileKeys.all, (files) =>
        files?.filter((file) => file.id !== id),
      );
    },
  });
}
