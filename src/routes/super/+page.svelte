<script lang="ts">
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let loading = false;
    let error: string | null = null;
    let success: string | null = null;

    async function handleSubmit(event: Event) {
        event.preventDefault();
        error = null;
        success = null;
        loading = true;

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                error = data?.error || data?.message || 'Login gagal. Silakan coba lagi.';
                return;
            }

            success = data?.message || 'Login berhasil.';

            setTimeout(() => {
                goto('/super/dashboard');
            }, 800);
        } catch (err) {
            error = 'Login gagal. Silakan coba lagi.';
        } finally {
            loading = false;
        }
    }
</script>

<main class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
    <section class="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2 text-center">Super Login</h1>
        <p class="text-sm text-gray-600 mb-6 text-center">Masuk ke halaman super admin.</p>

        {#if error}
            <div class="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
            </div>
        {:else if success}
            <div class="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                {success}
            </div>
        {/if}

        <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    required
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    required
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                class="w-full inline-flex items-center justify-center rounded-full bg-red-600 text-white font-semibold text-sm px-4 py-2.5 mt-2 shadow-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {#if loading}
                    Memproses...
                {:else}
                    Masuk
                {/if}
            </button>
        </form>
    </section>
</main>
