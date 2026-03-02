import type { Metadata } from 'next';
import PredictionsHub from './PredictionsHub';

export const metadata: Metadata = {
    title: 'Teer Predictions Today - Community Winning Numbers',
    description: 'See today\'s Teer number predictions from the community. Expert picks for Shillong Teer, Khanapara Teer and Juwai Teer FR & SR rounds.',
    alternates: { canonical: 'https://teer.club/predictions' },
    openGraph: {
        title: 'Teer Predictions Today - Community Winning Numbers | Teer Club',
        description: 'Community-driven Teer number predictions for Shillong, Khanapara and Juwai. See what experts are predicting today.',
        url: 'https://teer.club/predictions',
        type: 'website',
    },
};

export default function PredictionsPage() {
    return <PredictionsHub />;
}
