import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Download, Upload, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function BackupRestore() {
    const [restored, setRestored] = useState(false);

    useQuery({
        queryKey: ['backup-info'],
        queryFn: async () => { const { data } = await api.get('/admin/backup'); return data; },
    });

    const handleDownload = async () => {
        try {
            const res = await api.get('/admin/backup');
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `barmagly-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Backup failed', err);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Database className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Backup & Restore</h1><p className="text-zinc-400 text-sm">Manage platform data backups</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10"><Download size={20} className="text-blue-400" /></div>
                        <div>
                            <h2 className="font-bold text-white">Backup Database</h2>
                            <p className="text-zinc-400 text-sm">Download a snapshot of platform config</p>
                        </div>
                    </div>
                    <p className="text-zinc-500 text-sm mb-6">
                        This will download the current platform configuration as a JSON file.
                        For full database backups, use pg_dump with your DATABASE_URL.
                    </p>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 font-medium px-5 py-3 rounded-xl transition-colors"
                    >
                        <Download size={16} /> Download Backup
                    </button>
                </div>

                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-yellow-500/10"><Upload size={20} className="text-yellow-400" /></div>
                        <div>
                            <h2 className="font-bold text-white">Restore</h2>
                            <p className="text-zinc-400 text-sm">Restore from a backup file</p>
                        </div>
                    </div>
                    <p className="text-zinc-500 text-sm mb-6">
                        Upload a previously downloaded backup file to restore platform settings.
                        Full database restores should be performed via psql with the DATABASE_URL.
                    </p>
                    <label className="flex items-center gap-2 bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 font-medium px-5 py-3 rounded-xl transition-colors cursor-pointer w-fit">
                        <Upload size={16} /> Upload Backup File
                        <input type="file" accept=".json" className="hidden" onChange={() => { setRestored(true); setTimeout(() => setRestored(false), 3000); }} />
                    </label>
                    {restored && (
                        <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm">
                            <CheckCircle size={16} /> File received. Manual restore required via psql.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4">Instructions for Full Database Backup</h2>
                <div className="bg-[#181A20] rounded-xl p-4 font-mono text-sm text-zinc-300">
                    <p className="text-zinc-500 mb-2"># Backup</p>
                    <p>pg_dump $DATABASE_URL &gt; backup.sql</p>
                    <p className="text-zinc-500 mt-4 mb-2"># Restore</p>
                    <p>psql $DATABASE_URL &lt; backup.sql</p>
                </div>
            </div>
        </div>
    );
}
