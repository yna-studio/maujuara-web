export interface Competition {
    id: string;
    poster: string;
    title: string;
    endDate: string;
    organizer: string;
    prize: string;
    category: string;
    status: string;
    link_source?: string;
    tags?: string[];
}

export interface CompetitionsResponse {
    data: Competition[];
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
            id_organizer: string | null;
            status: string | null;
            tag: string | null;
        };
    };
}
