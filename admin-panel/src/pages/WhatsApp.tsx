import { MessageCircle } from 'lucide-react';

export default function WhatsApp() {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <MessageCircle className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">WhatsApp Integration</h1><p className="text-zinc-400 text-sm">Connect your WhatsApp Business account</p></div>
            </div>
            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-[#25D366]/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <MessageCircle size={40} className="text-[#25D366]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">WhatsApp Integration — Coming Soon</h2>
                <p className="text-zinc-400 max-w-md mx-auto mb-6">
                    Send booking confirmations, reminders, and platform notifications via WhatsApp Business API.
                    This feature is currently in development.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                    {['Booking confirmation messages', 'Appointment reminders', 'Platform broadcast notifications'].map((f, i) => (
                        <div key={i} className="bg-[#181A20] rounded-xl p-4 text-sm text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-[#25D366] mb-3" />
                            {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
