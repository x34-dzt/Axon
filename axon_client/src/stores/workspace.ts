import type { TAuthUser } from "@/types";
import type { JSONContent } from "novel";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

/**
 * Core types for workspace management and user privileges
 **/

type TPrivileges = {
  _id: string;
  role: "owner" | "visitor";
};

type TCreatedBy = TAuthUser & {
  createdAt: string;
  updatedAt: string;
};

export type TContent = {
  _id: string;
  block: string;
  blockContent: any;
  bold: boolean;
  italic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: TCreatedBy;
};

export interface IUserWorkspace {
  _id: string;
  title: string;
  icon: string | null;
  cover: string | undefined;
  coverPos: number;
  workspaceWidth: "sm" | "lg";
  workspace: "main" | "axonverse";
  private: boolean;
  members: TAuthUser[] | null;
  parentPageId: string | null;
  privileges: TPrivileges | null;
  subPages: IUserWorkspace[];
  blogId: string | null;
  createdBy: string;
  content: JSONContent | null;
}

export interface WorkspaceStore {
  data: {
    main?: IUserWorkspace[];
    axonverse?: IUserWorkspace[];
  };
}

type SavingContent = {
  workspaceId: string | null;
  workspaceType: "axonverse" | "main" | null;
  savingStatus: boolean;
};

export type Tab = {
  workspaceId: string;
  workspaceType: "main" | "axonverse";
  title: string;
  icon: string | null;
};

export interface IUserWorkspaceStore {
  workspace: {
    main: IUserWorkspace[] | null;
    axonverse: IUserWorkspace[] | null;
  };

  // Loading states
  navOpen: boolean;
  savingContent: SavingContent;
  allWorkspacesFetched: boolean;

  // Tab management
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
    title: string,
    icon?: string | null,
  ) => void;
  removeTab: (workspaceId: string) => void;
  setActiveTab: (workspaceId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;

  // update boolean state
  updateSavingContent: (savingParams: SavingContent) => void;
  handleAllWorkspacesLoaded: (value: boolean) => void;

  // Workspace management
  addMainWorkspaces: (mainWorkspaces: IUserWorkspace[]) => void;
  addAxonverseWorkspaces: (mainWorkspaces: IUserWorkspace[]) => void;

  updateWorkspaceIcon: (
    workspaceId: string,
    workspaceType: string,
    icon: string | null,
  ) => void;
  addNewParentWorkspace: (
    workspaceType: "main" | "axonverse",
    userId: string,
  ) => { newWorkspaceId: string; newWorkspaceType: "main" | "axonverse" };
  addNewSubWorkspaceById: (
    workspaceId: string,
    userId: string,
    workspaceType: "main" | "axonverse",
  ) => {
    newWorkspaceId: string;
    newWorkspaceType: "main" | "axonverse";
    newWorkspaceParentPageId: string | null;
  };
  removeWorkspace: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
  ) => void;

  blogIdOperation: (
    workspaceId: string,
    blogID: string,
    workspaceType: "main" | "axonverse",
    operation: "add" | "remove",
  ) => void;
  // Workspace updates
  updateWorkspaceTitleById: (
    workspaceId: string,
    title: string,
    workspaceType: string,
  ) => void;
  updateWorkspaceContent: (
    workspaceId: string,
    workspaceType: string,
    content: JSONContent,
  ) => void;
  updateWorkspaceCover: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
    workspaceCover: string,
  ) => void;
  removeWorkspaceCover: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
  ) => void;
  updateWorkspaceWidth: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
    width: "sm" | "lg",
  ) => void;
  updateWorkspaceCoverYPosition: (
    workspaceId: string,
    workspaceType: string,
    yPos: number,
  ) => void;

  // Workspace reorganization
  pushWorkspaceToDifferentWorkspace: (
    currentWorkspaceId: string,
    toWorkspaceId: string,
    workspaceType: "main" | "axonverse",
    toWorkspaceType: "main" | "axonverse",
  ) => void;

  //navbar
  openNavHandler: () => void;
}

/**
 * Main Zustand store implementation for workspace management
 * Handles state updates and complex workspace operations
 **/

export const useWorkspaceStore = create<IUserWorkspaceStore>((set) => ({
  workspace: {
    main: [],
    axonverse: [],
  },
  navOpen: true,
  allWorkspacesFetched: false,
  savingContent: {
    workspaceId: null,
    savingStatus: false,
    workspaceType: null,
  },
  tabs: [],
  activeTabId: null,
  addTab: (workspaceId, workspaceType, title, icon = null) => {
    set((state) => {
      const existingTab = state.tabs.find(
        (tab) => tab.workspaceId === workspaceId,
      );
      if (existingTab) {
        return { activeTabId: workspaceId };
      }
      return {
        tabs: [...state.tabs, { workspaceId, workspaceType, title, icon }],
        activeTabId: workspaceId,
      };
    });
  },
  reorderTabs: (fromIndex, toIndex) => {
    set((state) => {
      if (fromIndex === toIndex) return state;
      const newTabs = [...state.tabs];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return { tabs: newTabs };
    });
  },
  removeTab: (workspaceId) => {
    set((state) => {
      const newTabs = state.tabs.filter(
        (tab) => tab.workspaceId !== workspaceId,
      );
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === workspaceId) {
        newActiveTabId = newTabs.length > 0 ? newTabs[0].workspaceId : null;
      }
      return { tabs: newTabs, activeTabId: newActiveTabId };
    });
  },
  setActiveTab: (workspaceId) => {
    set({ activeTabId: workspaceId });
  },
  openNavHandler: () => {
    set((state) => ({
      ...state,
      navOpen: !state.navOpen,
    }));
  },

  removeWorkspaceCover: (
    workspaceId: string,
    workspaceType: "axonverse" | "main",
  ) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        [workspaceType]: state.workspace.main
          ? removeCoverById(state.workspace.main, workspaceId)
          : state.workspace.main,
      },
    }));
  },

  updateSavingContent: (savingStateObj) => {
    set((state) => ({
      ...state,
      savingContent: { ...savingStateObj },
    }));
  },

  handleAllWorkspacesLoaded(value: boolean) {
    set((state) => ({
      ...state,
      allWorkspacesFetched: value,
    }));
  },

  addMainWorkspaces(mainWorkspaces) {
    set((state) => ({
      workspace: {
        ...state.workspace,
        main: mainWorkspaces,
      },
    }));
  },
  addAxonverseWorkspaces(axonverseWorkspaces) {
    set((state) => ({
      workspace: {
        ...state.workspace,
        axonverse: axonverseWorkspaces,
      },
    }));
  },

  blogIdOperation: (
    workspaceId: string,
    blogId: string,
    workspaceType: "axonverse" | "main",
    operation: "add" | "remove",
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? blogIdOperationById(
                state.workspace.main,
                workspaceId,
                blogId,
                operation,
              )
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? blogIdOperationById(
                state.workspace.axonverse,
                workspaceId,
                blogId,
                operation,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },

  updateWorkspaceTitleById: (
    workspaceId: string,
    title: string,
    workspaceType: string,
  ) => {
    if (title.trim().length === 0) return;
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? updateWorkspaceTitleById(state.workspace.main, workspaceId, title)
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? updateWorkspaceTitleById(
                state.workspace.axonverse,
                workspaceId,
                title,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },

  updateWorkspaceWidth: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
    width: "sm" | "lg",
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? updateWorkspaceWidthById(state.workspace.main, workspaceId, width)
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? updateWorkspaceWidthById(
                state.workspace.axonverse,
                workspaceId,
                width,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },

  // Zustand store update function
  pushWorkspaceToDifferentWorkspace(
    currentWorkspaceId: string,
    toWorkspaceId: string,
    workspaceType: "main" | "axonverse",
    toWorkspaceType: "main" | "axonverse",
  ) {
    set((state) => {
      // Create a deep copy of the state to avoid direct mutations
      const newState = JSON.parse(JSON.stringify(state));

      const findWorkspaceAndRemove = (
        workspaces: IUserWorkspace[],
        currentWorkspaceId: string,
      ): IUserWorkspace | undefined => {
        const index = workspaces.findIndex((w) => w._id === currentWorkspaceId);
        if (index !== -1) {
          return workspaces.splice(index, 1)[0];
        }
        for (const workspace of workspaces) {
          if (workspace.subPages) {
            const found = findWorkspaceAndRemove(
              workspace.subPages,
              currentWorkspaceId,
            );
            if (found) return found;
          }
        }
        return undefined;
      };

      const findToWorkspaceLocation = (
        workspaces: IUserWorkspace[],
        toWorkspaceId: string,
      ): IUserWorkspace | undefined => {
        for (const workspace of workspaces) {
          if (workspace._id === toWorkspaceId) {
            return workspace;
          }
          if (workspace.subPages) {
            const found = findToWorkspaceLocation(
              workspace.subPages,
              toWorkspaceId,
            );
            if (found) return found;
          }
        }
        return undefined;
      };

      if (newState.workspace[workspaceType]) {
        const workspaceToMove = findWorkspaceAndRemove(
          newState.workspace[workspaceType],
          currentWorkspaceId,
        );

        if (!workspaceToMove) {
          return state; // No changes if workspace not found
        }

        // Update workspace type recursively
        const updateWorkspaceType = (
          workspace: IUserWorkspace,
          newType: "main" | "axonverse",
        ) => {
          workspace.workspace = newType;
          // biome-ignore lint/complexity/noForEach: <explanation>
          workspace.subPages?.forEach((subPage) =>
            updateWorkspaceType(subPage, newType),
          );
        };
        updateWorkspaceType(workspaceToMove, toWorkspaceType);

        // Ensure the destination workspace type exists
        if (!newState.workspace[toWorkspaceType]) {
          newState.workspace[toWorkspaceType] = [];
        }

        const newWorkspaceLocation = findToWorkspaceLocation(
          newState.workspace[toWorkspaceType],
          toWorkspaceId,
        );

        if (!newWorkspaceLocation) {
          // If no destination workspace found, add to the top level
          newState.workspace[toWorkspaceType].push(workspaceToMove);
        } else {
          // Add to the subPages of the destination workspace
          newWorkspaceLocation.subPages = [
            workspaceToMove,
            ...(newWorkspaceLocation.subPages || []),
          ];
        }

        return newState;
      }

      return state; // Return original state if no changes made
    });
  },

  addNewParentWorkspace: (workspaceType, userId) => {
    const newWorkspace: IUserWorkspace = {
      _id: uuidv4(),
      title: "Untitled",
      icon: "axon_logo.svg",
      cover: "",
      private: true,
      workspaceWidth: "sm",
      workspace: workspaceType,
      coverPos: 50,
      members: null,
      parentPageId: null,
      privileges: null,
      createdBy: userId,
      blogId: null,
      content: null,
      subPages: [],
    };
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? [newWorkspace, ...state.workspace.main]
            : [newWorkspace],
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? [newWorkspace, ...state.workspace.axonverse]
            : [newWorkspace],
        },
      }));
    }

    return {
      newWorkspaceId: newWorkspace._id,
      newWorkspaceType: newWorkspace.workspace,
    };
  },

  addParentNavigation() {},

  addNewSubWorkspaceById: (
    workspaceId: string,
    userId: string,
    workspaceType: "main" | "axonverse",
  ) => {
    const dummyWorkspace: IUserWorkspace = {
      _id: uuidv4(),
      title: "Untitled",
      icon: null,
      cover: undefined,
      private: true,
      coverPos: 50,
      workspaceWidth: "sm",
      workspace: workspaceType,
      members: null,
      createdBy: userId,
      parentPageId: workspaceId,
      privileges: null,
      blogId: null,
      content: null,
      subPages: [],
    };

    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? addNewSubWorkspaceToParent(
                state.workspace.main,
                userId,
                workspaceId,
                workspaceType,
                dummyWorkspace,
              )
            : state.workspace.main,
        },
      }));
      return {
        newWorkspaceId: dummyWorkspace._id,
        newWorkspaceType: dummyWorkspace.workspace,
        newWorkspaceParentPageId: dummyWorkspace.parentPageId,
      };
    }
    set((state) => ({
      workspace: {
        ...state.workspace,
        axonverse: state.workspace.axonverse
          ? addNewSubWorkspaceToParent(
              state.workspace.axonverse,
              userId,
              workspaceId,
              workspaceType,
              dummyWorkspace,
            )
          : state.workspace.axonverse,
      },
    }));
    return {
      newWorkspaceId: dummyWorkspace._id,
      newWorkspaceType: dummyWorkspace.workspace,
      newWorkspaceParentPageId: dummyWorkspace.parentPageId,
    };
  },

  removeWorkspace: (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? removeWorkspaceById(state.workspace.main, workspaceId)
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? removeWorkspaceById(state.workspace.axonverse, workspaceId)
            : state.workspace.axonverse,
        },
      }));
    }

    set((state) => {
      const newTabs = state.tabs.filter(
        (tab) => tab.workspaceId !== workspaceId,
      );
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === workspaceId) {
        newActiveTabId = newTabs.length > 0 ? newTabs[0].workspaceId : null;
      }
      return { tabs: newTabs, activeTabId: newActiveTabId };
    });
  },

  updateWorkspaceContent: (
    workspaceId: string,
    workspaceType: string,
    content: JSONContent,
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? updateWorkspaceContentById(
                state.workspace.main,
                workspaceId,
                content,
              )
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? updateWorkspaceContentById(
                state.workspace.axonverse,
                workspaceId,
                content,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },

  updateWorkspaceCover: (
    workspaceId: string,
    workspaceType: string,
    workspaceCover: string,
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? updateWorkspaceCoverById(
                state.workspace.main,
                workspaceId,
                workspaceCover,
              )
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? updateWorkspaceCoverById(
                state.workspace.axonverse,
                workspaceId,
                workspaceCover,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },

  updateWorkspaceIcon: (
    workspaceId: string,
    workspaceType: string,
    icon: string | null,
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? updateWorkspaceIconById(state.workspace.main, workspaceId, icon)
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? updateWorkspaceIconById(
                state.workspace.axonverse,
                workspaceId,
                icon,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },

  updateWorkspaceCoverYPosition: (
    workspaceId: string,
    workspaceType: string,
    yPosition: number,
  ) => {
    if (workspaceType === "main") {
      set((state) => ({
        workspace: {
          ...state.workspace,
          main: state.workspace.main
            ? updateWorkspaceYPositionById(
                state.workspace.main,
                workspaceId,
                yPosition,
              )
            : state.workspace.main,
        },
      }));
    } else {
      set((state) => ({
        workspace: {
          ...state.workspace,
          axonverse: state.workspace.axonverse
            ? updateWorkspaceYPositionById(
                state.workspace.axonverse,
                workspaceId,
                yPosition,
              )
            : state.workspace.axonverse,
        },
      }));
    }
  },
}));

const updateWorkspaceYPositionById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  yPos: number,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        coverPos: yPos,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: updateWorkspaceYPositionById(
          workspace.subPages,
          workspaceId,
          yPos,
        ),
      };
    }

    return workspace;
  });
};

const updateWorkspaceContentById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  content: JSONContent,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        content: content,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: updateWorkspaceContentById(
          workspace.subPages,
          workspaceId,
          content,
        ),
      };
    }

    return workspace;
  });
};

const updateWorkspaceCoverById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  cover: string,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        cover,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: updateWorkspaceCoverById(
          workspace.subPages,
          workspaceId,
          cover,
        ),
      };
    }

    return workspace;
  });
};

const updateWorkspaceIconById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  icon: string | null,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        icon,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: updateWorkspaceIconById(
          workspace.subPages,
          workspaceId,
          icon,
        ),
      };
    }

    return workspace;
  });
};

const removeCoverById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        cover: undefined,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: removeCoverById(workspace.subPages, workspaceId),
      };
    }
    return workspace;
  });
};

const updateWorkspaceTitleById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  newTitle: string,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        title: newTitle,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: updateWorkspaceTitleById(
          workspace.subPages,
          workspaceId,
          newTitle,
        ),
      };
    }
    return workspace;
  });
};

const updateWorkspaceWidthById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  workspaceWidth: "sm" | "lg",
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        workspaceWidth,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: updateWorkspaceWidthById(
          workspace.subPages,
          workspaceId,
          workspaceWidth,
        ),
      };
    }
    return workspace;
  });
};
const blogIdOperationById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
  blogId: string,
  operation: "add" | "remove",
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        blogId: operation === "add" ? blogId : null,
      };
    }

    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: blogIdOperationById(
          workspace.subPages,
          workspaceId,
          blogId,
          operation,
        ),
      };
    }
    return workspace;
  });
};

const removeWorkspaceById = (
  workspaces: IUserWorkspace[],
  workspaceId: string,
): IUserWorkspace[] => {
  return workspaces.reduce((acc: IUserWorkspace[], workspace) => {
    if (workspace._id === workspaceId) {
      return acc;
    }

    if (workspace.subPages) {
      return [
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        ...acc,
        {
          ...workspace,
          subPages: removeWorkspaceById(workspace.subPages, workspaceId),
        },
      ];
    }

    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
    return [...acc, workspace];
  }, []);
};

const addNewSubWorkspaceToParent = (
  workspaces: IUserWorkspace[],
  userId: string,
  workspaceId: string,
  workspaceType: "main" | "axonverse",
  dummyWorkspace: IUserWorkspace,
): IUserWorkspace[] => {
  return workspaces.map((workspace) => {
    if (workspace._id === workspaceId) {
      return {
        ...workspace,
        subPages: [dummyWorkspace, ...workspace.subPages],
      };
    }
    if (workspace.subPages) {
      return {
        ...workspace,
        subPages: addNewSubWorkspaceToParent(
          workspace.subPages,
          userId,
          workspaceId,
          workspaceType,
          dummyWorkspace,
        ),
      };
    }
    return workspace;
  });
};
