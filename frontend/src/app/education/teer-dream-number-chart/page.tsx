'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

const dreamData = [
    { dream: 'Quarrel between husband/wife', direct: '03, 08, 13, 37, 40, 73', house: '0, 1, 3, 4, 7', ending: '3, 4, 8, 0, 7' },
    { dream: 'Erotic dream', direct: '17, 40, 53, 59, 60, 83', house: '1, 4, 5, 6, 8', ending: '0, 3, 7, 9' },
    { dream: 'Bathing in the open', direct: '08, 18, 28, 48, 78, 98', house: '0, 1, 2, 4, 7, 9', ending: '8' },
    { dream: 'Traveling', direct: '08, 14, 18, 52, 64, 68, 74, 78, 98', house: '0, 1, 5, 6, 7, 9', ending: '2, 4, 8' },
    { dream: 'Traveling in an airplane', direct: '23, 43, 53, 63, 68, 73, 83, 93', house: '2, 4, 5, 6, 7, 8, 9', ending: '3, 8' },
    { dream: 'Taking a stroll', direct: 'walk / roaming', house: '', ending: '' },
    { dream: 'Ghost or Apparition', direct: '52, 54, 58, 62, 64, 68', house: '5, 6', ending: '2, 4, 8' },
    { dream: 'Fire', direct: '00', house: '0', ending: '0' },
    { dream: 'Man', direct: '06', house: '0', ending: '6' },
    { dream: 'Woman', direct: '05', house: '0', ending: '5' },
    { dream: 'Child', direct: '02, 03', house: '0', ending: '2, 3' },
    { dream: 'Water', direct: '04', house: '0', ending: '4' },
    { dream: 'Fish', direct: '09', house: '0', ending: '9' },
    { dream: 'Money', direct: '00, 14', house: '0, 1', ending: '0, 4' },
    { dream: 'Shoe', direct: '08', house: '0', ending: '8' },
];

export default function DreamChartPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDreams = dreamData.filter(d =>
        d.dream.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.direct.includes(searchTerm)
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Table Schema mapping for Google Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Table",
                        "about": "Teer Dream Number Chart for Shillong and Khanapara",
                        "name": "Teer Dream Numbers Mapping Table"
                    })
                }}
            />

            <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Teer Dream Number Chart</h2>
                <p className="text-slate-500 font-medium">Search the traditional Meghalaya dream meanings to find your lucky target number today.</p>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search for a dream (e.g., Water, Fire, Flying)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-slate-100 shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 bg-white">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-black tracking-wider border-b border-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 rounded-tl-[24px]">What did you dream?</th>
                            <th scope="col" className="px-6 py-4">Direct Numbers</th>
                            <th scope="col" className="px-6 py-4 hidden sm:table-cell">House Numbers</th>
                            <th scope="col" className="px-6 py-4 rounded-tr-[24px] hidden sm:table-cell">Ending Numbers</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDreams.length > 0 ? filteredDreams.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{row.dream}</td>
                                <td className="px-6 py-4 font-bold text-indigo-600">{row.direct}</td>
                                <td className="px-6 py-4 hidden sm:table-cell">{row.house || '--'}</td>
                                <td className="px-6 py-4 hidden sm:table-cell">{row.ending || '--'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                                    No dream matches found. Try a different keyword!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-900">
                <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-indigo-500">How to use this chart</h3>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                    The Teer Dream Chart translates your previous night's dreams into numeric probabilities based on generations of tribal knowledge in Meghalaya. Find the closest match to your dream in the table above, and extract the corresponding Direct, House, or Ending number to play in today's First Round or Second Round.
                </p>
            </div>
        </div>
    );
}
