import type { Metadata } from 'next';
import DreamsClient from './DreamsClient';

export const metadata: Metadata = {
    title: 'Teer Dream Number Finder - What Did You Dream?',
    description: 'Find your lucky Teer number from your dream. The most comprehensive Teer dream number chart online. Search any dream symbol and get AI-powered lucky number predictions.',
    alternates: { canonical: 'https://teer.club/dreams' },
    openGraph: {
        title: 'Teer Dream Number Finder | Teer Club',
        description: 'Find your lucky Teer number from your dream using AI analysis. Covers all dream symbols.',
        url: 'https://teer.club/dreams',
        type: 'website',
    },
};

export default function DreamsPage() {
    return <DreamsClient />;
}
