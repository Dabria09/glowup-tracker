import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Database, Table, Download, Loader2, CheckCircle } from 'lucide-react';

export default function AirtableImport() {
  const [bases, setBases] = useState([]);
  const [selectedBase, setSelectedBase] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('bases'); // bases | tables | preview

  useEffect(() => {
    loadBases();
  }, []);

  const invoke = (action, extra = {}) =>
    base44.functions.invoke('airtableFetch', { action, ...extra });

  const loadBases = async () => {
    setLoading(true);
    const res = await invoke('listBases');
    setBases(res.data.bases || []);
    setLoading(false);
  };

  const selectBase = async (base) => {
    setSelectedBase(base);
    setLoading(true);
    setStep('tables');
    const res = await invoke('listTables', { baseId: base.id });
    setTables(res.data.tables || []);
    setLoading(false);
  };

  const selectTable = async (table) => {
    setSelectedTable(table);
    setLoading(true);
    setStep('preview');
    // Fetch first page of records
    const res = await invoke('fetchRecords', { baseId: selectedBase.id, tableId: table.id });
    setRecords(res.data.records || []);
    setLoading(false);
  };

  const fields = selectedTable?.fields || [];
  const displayFields = fields.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import from Airtable</h1>
          <p className="text-gray-500 mt-1">Select a base and table to preview and import your data.</p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span className={step === 'bases' ? 'font-semibold text-purple-600' : 'cursor-pointer hover:text-purple-600'} onClick={() => setStep('bases')}>Bases</span>
          {selectedBase && (<><ChevronRight className="w-4 h-4" /><span className={step === 'tables' ? 'font-semibold text-purple-600' : 'cursor-pointer hover:text-purple-600'} onClick={() => setStep('tables')}>{selectedBase.name}</span></>)}
          {selectedTable && (<><ChevronRight className="w-4 h-4" /><span className="font-semibold text-purple-600">{selectedTable.name}</span></>)}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Bases list */}
        {!loading && step === 'bases' && (
          <div className="grid gap-3">
            {bases.map(base => (
              <Card key={base.id} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-300" onClick={() => selectBase(base)}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{base.name}</p>
                    <p className="text-xs text-gray-400">{base.id}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tables list */}
        {!loading && step === 'tables' && (
          <div className="grid gap-3">
            {tables.map(table => (
              <Card key={table.id} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-300" onClick={() => selectTable(table)}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Table className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{table.name}</p>
                    <p className="text-xs text-gray-400">{table.fields?.length || 0} fields</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview */}
        {!loading && step === 'preview' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Showing {records.length} records</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {fields.map(f => <Badge key={f.id} variant="secondary" className="text-xs">{f.name}</Badge>)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Ready to use</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {displayFields.map(f => (
                      <th key={f.id} className="text-left px-4 py-3 font-medium text-gray-600">{f.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map(record => (
                    <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                      {displayFields.map(f => (
                        <td key={f.id} className="px-4 py-3 text-gray-700 truncate max-w-[200px]">
                          {String(record.fields?.[f.name] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Your Airtable data is connected! Tell me what you'd like to build with it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}