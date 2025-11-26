export interface Organizer {
    id: string;
    name: string;
    logo: string;
    image: string;
}

export interface OrganizersResponse {
    data: Organizer[];
    status: number;
}
