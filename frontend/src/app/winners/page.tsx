import type { Metadata } from 'next';
import WinnersClient from './WinnersClient';

export const metadata: Metadata = {
    title: 'Teer Winners Today - Hall of Champions',
    description: 'See today\'s Teer winners. Community members who predicted the correct FR & SR numbers for Shillong Teer, Khanapara Teer, and Juwai Teer. Real-time winner archive.',
    alternates: { canonical: 'https://teer.club/winners' },
    openGraph: {
        title: 'Teer Winners Today - Hall of Champions | Teer Club',
        description: 'Real-time Teer winner archive. See the community\'s best predictions for Shillong, Khanapara and Juwai.',
        url: 'https://teer.club/winners',
        type: 'website',
    },
};

export default function WinnersPage() {
    return <WinnersClient />;
}
