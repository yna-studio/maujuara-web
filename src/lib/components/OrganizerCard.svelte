<script lang="ts" context="module">
    export interface Organizer {
        _id: string;
        name: string;
        avatar?: string;
        image?: string;
        // Add other fields that might come from the database
        created_at?: string;
        updated_at?: string;
        [prop: string]: any; // Allow additional properties from database
    }
</script>

<script lang="ts">
    export let organizer: Organizer;
</script>

<a
    style="margin-bottom:40px"
    href={`/competitions?organizer=${organizer._id}`}
    class="flex flex-col items-center snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
>
    <div
        class="w-24 h-24 rounded-full border-[4px] border-red-500 bg-center bg-cover bg-no-repeat shadow-sm"
        style={`background-image: url('${organizer.avatar || organizer.image || "/placeholder-avatar.png"}')`}
    ></div>
    <p class="mt-2 text-sm font-medium text-gray-700 text-center line-clamp-2">
        {organizer.name}
    </p>
</a>

