import { LucideIcon, Activity, History, Users, Target, Calculator, Moon, BookOpen, Gift, Trophy } from 'lucide-react';

export interface NavItem {
    name: string;
    icon: LucideIcon;
    color: string;
    path: string;
    requiresAuth?: boolean;
}

export const CORE_NAV_ITEMS: NavItem[] = [
    { name: 'Live', icon: Activity, color: 'text-rose-500', path: '/' },
    { name: 'History', icon: History, color: 'text-blue-500', path: '/history' },
    { name: 'Groups', icon: Users, color: 'text-emerald-500', path: '/groups', requiresAuth: true },
];

export const MENU_ITEMS: NavItem[] = [
    { name: 'Winners', icon: Trophy, color: 'text-amber-500', path: '/winners' },
    { name: 'Posts', icon: Target, color: 'text-orange-600', path: '/predictions' },
    { name: 'Rewards', icon: Gift, color: 'text-emerald-500', path: '/referral', requiresAuth: true },
    { name: 'Tools', icon: Calculator, color: 'text-purple-500', path: '/tools' },
    { name: 'Dreams', icon: Moon, color: 'text-violet-500', path: '/dreams' },
    { name: 'Guide', icon: BookOpen, color: 'text-cyan-500', path: '/blog' },
];
