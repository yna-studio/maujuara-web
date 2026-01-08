import { apiCaller } from './apiCaller';

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

export interface GetTagsParams {
    limit?: number;
    page?: number;
}

class TagsAPIClass {
    private api = apiCaller;

    async getTags(params: GetTagsParams = {}, customFetch?: typeof fetch): Promise<TagsResponse> {
        const { limit = 20, page = 1 } = params;

        return this.api.get<TagsResponse>('/tags', {
            limit,
            page
        }, customFetch);
    }
}

export const TagsAPI = new TagsAPIClass();
