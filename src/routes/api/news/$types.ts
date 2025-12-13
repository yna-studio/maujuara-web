export interface News {
    _id: string;
    title: string;
    thumbnail: string;
    created_by: string;
    short_desc: string;
    description: string;
    shortDesc: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    createdBy?: {
        id: string;
        name: string;
        avatar: string;
    };
}

export interface NewsResponse {
    data: News[];
    status: number;
    meta: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        filters: {
            search: string | null;
        };
    };
}
