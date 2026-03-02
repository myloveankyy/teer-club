import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
    title: 'Teer Strategy & Insights Blog - Knowledge Hub',
    description: 'Expert Teer guides, strategies, cultural history and winning psychology. Learn the science behind Shillong Teer number predictions. Community insights and analytics.',
    alternates: { canonical: 'https://teer.club/blog' },
    openGraph: {
        title: 'Teer Strategy & Insights Blog | Teer Club Knowledge Hub',
        description: 'Deep dives into Teer psychology, cultural philosophy, and advanced winning patterns for Shillong, Khanapara, and Juwai Teer.',
        url: 'https://teer.club/blog',
        type: 'website',
    },
};

export default function BlogPage() {
    return <BlogClient />;
}
