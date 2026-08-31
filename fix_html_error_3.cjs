const fs = require('fs');

let content = fs.readFileSync('src/components/Visits.tsx', 'utf8');

const brokenTail = `            <button onClick={() => setShowDiagnostic(false)} className="text-slate-400 hover:text-slate-600"> </AnimatePresence> </div> );}`;

const startOfDiagnostic = '{showDiagnostic && (';
const startIdx = content.indexOf(startOfDiagnostic, content.indexOf('</AnimatePresence>'));

if (startIdx !== -1) {
    // Remove the broken diagnostic block at the end
    content = content.substring(0, startIdx);
    
    // add the correct diagnostic block at the very end
    const correctTail = `
{showDiagnostic && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bug className="w-5 h-5 text-amber-600" />
                Diagnóstico de Sincronização
            </h2>
            <button onClick={() => setShowDiagnostic(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
            </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50 space-y-6">
            <div>
                <h3 className="font-semibold text-slate-700 mb-2">Visitas Pendentes na Fila (IDs)</h3>
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm font-mono text-slate-600 break-all">
                    {pendingSyncIds && pendingSyncIds.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {pendingSyncIds.map(id => <li key={id}>{id}</li>)}
                        </ul>
                    ) : (
                        <p className="text-slate-400 italic">Nenhuma visita pendente.</p>
                    )}
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-700">Logs do Sistema de Sincronização</h3>
                    <button onClick={() => { clearSyncLogs(); setShowDiagnostic(false); setTimeout(() => setShowDiagnostic(true), 100); }} className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded">
                        <Trash className="w-3 h-3" /> Limpar Logs
                    </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-green-400 overflow-x-auto">
                    {getSyncLogs().length > 0 ? (
                        <ul className="space-y-3">
                            {getSyncLogs().map((log, idx) => (
                                <li key={idx} className="border-b border-slate-700 pb-2 last:border-0">
                                    <div className="text-slate-500 mb-1">{new Date(log.time).toLocaleString('pt-BR')}</div>
                                    <div className="text-white mb-1">{log.message}</div>
                                    {log.error && <div className="text-red-400 whitespace-pre-wrap">{log.error}</div>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic">Nenhum log registrado.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
 </div>
)}
</div>
);
}
`;

    // Wait, first I need to check if there is an <AnimatePresence> missing since I stripped the end
    // Currently the file ends with:
    // )}
    // {showDiagnostic && (
    
    // I should append `</AnimatePresence>` before my block, just in case. Let's find exactly where I am.
    
    fs.writeFileSync('src/components/Visits.tsx', content + correctTail);
    console.log("Re-wrote tail");
}
