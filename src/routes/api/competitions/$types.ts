export interface Competition {
    id: string;
    poster: string;
    title: string;
    endDate: string;
    organizer: string;
    prize: string;
    category: string;
    status: string;
}

export interface CompetitionsResponse {
    data: Competition[];
    status: number;
}
