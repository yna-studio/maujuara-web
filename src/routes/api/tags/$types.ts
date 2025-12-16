export interface Tag {
    _id: string;
    name: string;
    total: number;
    created_at: string;
    updated_at: string;
}

export interface TagsResponse {
    data: Tag[];
    status: number;
    meta: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
