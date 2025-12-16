import type { PageServerLoad } from './$types';
import { CompetitionsAPI } from '$lib/api/competitions';
import { CategoriesAPI } from '$lib/api/categories';
import { OrganizersListAPI } from '$lib/api/organizersList';

export const load: PageServerLoad = async ({ url }) => {
    try {
        // Get URL parameters
        const search = url.searchParams.get('search') || '';
        const categoryId = url.searchParams.get('category');
        const organizerId = url.searchParams.get('organizer_id') || url.searchParams.get('organizer');
        const status = url.searchParams.get('status');
        const tag = url.searchParams.get('tag');
        const organizerName = url.searchParams.get('organizer_name');
        const limit = 9; // First page limit
        const page = 1;

        // Build API parameters
        const params: Record<string, any> = {
            limit,
            page,
        };

        if (search) params.search = search;
        if (categoryId) params.id_category = categoryId;
        if (organizerId) params.id_organizer = organizerId;
        if (status) params.status = status;
        if (tag) params.tag = tag;

        // Fetch data in parallel
        const [competitionsResponse, categoriesResponse, organizersResponse] = await Promise.all([
            CompetitionsAPI.getCompetitions(params),
            CategoriesAPI.getCategories(),
            OrganizersListAPI.getAllOrganizers()
        ]);

        // Generate page title based on filters
        let pageTitle = "Jelajah Kompetisi";
        
        // Find category and organizer names for title
        const category = categoryId && categoriesResponse.data.length > 0 
            ? categoriesResponse.data.find((c) => c.id === categoryId)
            : null;
            
        const organizer = organizerId 
            ? organizersResponse.data.find((org) => org.id === organizerId)
            : null;

        const statuses = [
            { value: "open", text: "Open" },
            { value: "progress", text: "Berlangsung" },
            { value: "ended", text: "Berakhir" },
        ];
        
        const statusLabel = status 
            ? (statuses.find((s) => s.value === status)?.text ?? status)
            : "";

        // Build title with priority: tag > status+category > status > category > default (same as client)
        let baseTitle = "Jelajah Kompetisi";

        if (tag) {
            baseTitle = `Jelajah Kompetisi - Tag: ${tag}`;
        } else if (statusLabel) {
            // With status in query
            if (category) {
                baseTitle = `Jelajah Kompetisi - Kategori ${category.name} - ${statusLabel}`;
            } else {
                baseTitle = `Jelajah Kompetisi - ${statusLabel}`;
            }
        } else if (category) {
            // Only category in query
            baseTitle = `Jelajah Kompetisi - Kategori ${category.name}`;
        }

        // Add organizer name suffix if available (same logic as client)
        if (organizerName && organizerId) {
            pageTitle = `${baseTitle} oleh ${organizerName}`;
        } else {
            // No organizer in query
            pageTitle = baseTitle;
        }

        // Generate meta description
        const metaDescription = `${pageTitle} - Temukan dan ikuti berbagai kompetisi online yang sesuai dengan minat dan kemampuan Anda. Filter berdasarkan kategori, status, penyelenggara, dan topik.`;

        return {
            competitions: competitionsResponse.data,
            categories: categoriesResponse.data,
            organizers: organizersResponse.data.map((org) => ({
                id: org.id,
                name: org.name,
            })),
            totalCount: competitionsResponse.meta?.totalCount || 0,
            totalPages: competitionsResponse.meta?.totalPages || 1,
            currentPage: 1,
            pageTitle,
            metaDescription,
            error: null
        };
    } catch (err) {
        console.error('Failed to load competitions page on server:', err);
        return {
            competitions: [],
            categories: [],
            organizers: [],
            totalCount: 0,
            totalPages: 1,
            currentPage: 1,
            pageTitle: "Jelajah Kompetisi",
            metaDescription: "Jelajah Kompetisi - Temukan dan ikuti berbagai kompetisi online yang sesuai dengan minat dan kemampuan Anda. Filter berdasarkan kategori, status, penyelenggara, dan topik.",
            error: 'Failed to load data'
        };
    }
};
