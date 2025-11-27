export interface Organizer {
    _id: string;
    name: string;
    avatar?: string;
    image?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any; // Allow additional database fields
}

export interface OrganizersResponse {
    data: Organizer[];
    status: number;
    meta?: {
        limit: number;
        orderBy: string;
        count: number;
    };
}
