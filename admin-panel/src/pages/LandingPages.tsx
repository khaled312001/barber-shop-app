import { Globe } from 'lucide-react';

export default function LandingPages() {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Globe className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Landing Pages</h1><p className="text-zinc-400 text-sm">Manage per-salon landing pages</p></div>
            </div>
            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-12 text-center">
                <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                    Per-salon landing page customization is planned for a future release.
                    Each salon will be able to have a branded public-facing page.
                </p>
            </div>
        </div>
    );
}
