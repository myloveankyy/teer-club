export interface TableOfContentsItem {
    id: string;
    title: string;
    level: number;
}

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    author: string;
    publishedAt: string;
    category: string;
    readingTime: number;
    content: string;
    keywords: string[];
    tableOfContents: TableOfContentsItem[];
    relatedSlugs?: string[];
    faq?: { question: string; answer: string }[];
}
