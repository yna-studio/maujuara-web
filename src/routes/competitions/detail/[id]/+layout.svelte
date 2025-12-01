<script lang="ts">
    import type { LayoutData } from './$types';
    export let data: LayoutData;
    
    // Set page title
    $: pageTitle = data.seo?.title || 'Kompetisi Detail';
    $: pageDescription = data.seo?.description || '';
    $: pageImage = data.seo?.image || '';
    $: pageUrl = data.seo?.url || '';
    $: siteName = data.seo?.siteName || 'Maujuara';
    $: author = data.seo?.author || 'Maujuara';
    $: pageType = data.seo?.type || 'article';
    $: publishedTime = data.seo?.publishedTime || '';
    $: modifiedTime = data.seo?.modifiedTime || '';
    $: category = data.seo?.category || '';
</script>

<svelte:head>
    <!-- Basic Meta Tags -->
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta name="author" content={author} />
    <meta name="keywords" content="kompetisi, lomba, kontes, {category}, {author}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content={pageType} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:url" content={pageUrl} />
    <meta property="og:image" content={pageImage} />
    <meta property="og:image:alt" content={pageTitle} />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:locale" content="id_ID" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={pageDescription} />
    <meta name="twitter:image" content={pageImage} />
    <meta name="twitter:image:alt" content={pageTitle} />
    <meta name="twitter:site" content="@maujuara" />
    <meta name="twitter:creator" content="@maujuara" />
    
    <!-- Article Meta Tags (if applicable) -->
    {#if pageType === 'article'}
        <meta property="article:author" content={author} />
        <meta property="article:published_time" content={publishedTime} />
        <meta property="article:modified_time" content={modifiedTime} />
        <meta property="article:section" content={category} />
        <meta property="article:tag" content="kompetisi" />
        <meta property="article:tag" content={category} />
    {/if}
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href={pageUrl} />
    
    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
        {JSON.stringify({
            "@context": "https://schema.org",
            "@type": pageType === 'article' ? "Article" : "WebPage",
            "headline": pageTitle,
            "description": pageDescription,
            "image": pageImage,
            "url": pageUrl,
            "datePublished": publishedTime,
            "dateModified": modifiedTime,
            "author": {
                "@type": "Organization",
                "name": author
            },
            "publisher": {
                "@type": "Organization",
                "name": siteName,
                "url": "https://maujuara.com"
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": pageUrl
            }
        })}
    </script>
</svelte:head>

<slot />
