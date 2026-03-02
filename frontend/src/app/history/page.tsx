import type { Metadata } from 'next';
import HistoryClient from './HistoryClient';

export const metadata: Metadata = {
    title: 'Teer Result History - Shillong, Khanapara & Juwai Archive',
    description: 'Complete Teer result history for Shillong Teer, Khanapara Teer, and Juwai Teer. Browse daily FR and SR numbers archive going back years. Verified historical data.',
    alternates: { canonical: 'https://teer.club/history' },
    openGraph: {
        title: 'Teer Result History - Shillong, Khanapara & Juwai Archive | Teer Club',
        description: 'Complete historical Teer result archive with date filters, hot numbers, and peak analysis.',
        url: 'https://teer.club/history',
        type: 'website',
    },
};

export default function HistoryPage() {
    return <HistoryClient />;
}
