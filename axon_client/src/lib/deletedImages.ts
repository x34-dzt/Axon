export const deletedImagesMap: Record<string, string> = {};
let currentWorkspaceId: string | null = null;

export const setCurrentWorkspace = (workspaceId: string) => {
  currentWorkspaceId = workspaceId;
};

export const getCurrentWorkspace = () => currentWorkspaceId;

export const addDeletedImage = (url: string, workspaceId: string) => {
  deletedImagesMap[url] = workspaceId;
};

export const removeDeletedImage = (url: string) => {
  delete deletedImagesMap[url];
};

export const getDeletedImagesForWorkspace = (workspaceId: string): string[] => {
  return Object.entries(deletedImagesMap)
    .filter(([, wsId]) => wsId === workspaceId)
    .map(([url]) => url);
};

export const getDeletedImagesExceptWorkspace = (workspaceId: string): string[] => {
  return Object.entries(deletedImagesMap)
    .filter(([, wsId]) => wsId !== workspaceId)
    .map(([url]) => url);
};

export const clearDeletedImagesForWorkspace = (workspaceId: string) => {
  Object.keys(deletedImagesMap).forEach((url) => {
    if (deletedImagesMap[url] === workspaceId) {
      delete deletedImagesMap[url];
    }
  });
};

export const getDeletedImagesForCurrentWorkspace = (): string[] => {
  if (!currentWorkspaceId) return [];
  return getDeletedImagesForWorkspace(currentWorkspaceId);
};
