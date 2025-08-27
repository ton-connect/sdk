export type Launch = {
    id: number;
    name: string;
    projectId: number;
    closed: boolean;
    external: boolean;
    newDefectsCount: number;
    knownDefectsCount: number;
    createdDate: number;
    lastModifiedDate: number;
    createdBy: string;
    lastModifiedBy: string;
};
