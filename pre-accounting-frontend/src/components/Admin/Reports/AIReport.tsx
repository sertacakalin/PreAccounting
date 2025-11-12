import { useState } from 'react';
import { generateAIReport } from '@/services/reportService';
import { AIReportResponse } from '@/types';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const RAPOR_TURLERI = [
  { value: 'gelir_gider_ozet', label: 'Gelir-Gider Özeti' },
  { value: 'kar_zarar', label: 'Kâr-Zarar Tablosu' },
  { value: 'bilanço', label: 'Bilanço' },
  { value: 'nakit_akisi', label: 'Nakit Akışı' },
  { value: 'alacak_yaslandirma', label: 'Alacak Yaşlandırma' },
  { value: 'borc_yaslandirma', label: 'Borç Yaşlandırma' },
  { value: 'kasa_banka_ekstre_uzlastirma', label: 'Kasa-Banka Mutabakatı' },
  { value: 'fatura_kdv_ozeti', label: 'Fatura KDV Özeti' },
  { value: 'masraf_kırılım', label: 'Masraf Kırılımı' },
  { value: 'butce_vs_gerceklesen', label: 'Bütçe vs Gerçekleşen' },
  { value: 'anomaliler_ve_riskler', label: 'Anomaliler ve Riskler' },
  { value: 'ozel_sorgu', label: 'Özel Sorgu' },
];

const AIReport = () => {
  const [report, setReport] = useState<AIReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [raporTuru, setRaporTuru] = useState('gelir_gider_ozet');
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [firmaUnvan, setFirmaUnvan] = useState('');
  const [vergiNo, setVergiNo] = useState('');
  const [ozelSorgu, setOzelSorgu] = useState('');

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const request = {
        raporTuru,
        baslangicTarihi,
        bitisTarihi,
        firmaUnvan: firmaUnvan || undefined,
        vergiNo: vergiNo || undefined,
        ozelSorgu: ozelSorgu || undefined,
      };

      const data = await generateAIReport(request);

      if (data.basarili) {
        setReport(data);
      } else {
        setError(data.hata || 'Rapor oluşturulurken bir hata oluştu.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rapor oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (markdown: string) => {
    // Basit markdown render - gerçek uygulamada react-markdown kullanılabilir
    return (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg font-sans text-sm">
          {markdown}
        </pre>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-3xl font-bold text-gray-800">AI Destekli Muhasebe Raporları</h2>

      <form onSubmit={handleGenerateReport} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Rapor Türü</label>
            <select
              value={raporTuru}
              onChange={(e) => setRaporTuru(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RAPOR_TURLERI.map((tur) => (
                <option key={tur.value} value={tur.value}>
                  {tur.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Firma Ünvanı (Opsiyonel)</label>
            <input
              type="text"
              value={firmaUnvan}
              onChange={(e) => setFirmaUnvan(e.target.value)}
              placeholder="Firma adı"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Vergi No (Opsiyonel)</label>
            <input
              type="text"
              value={vergiNo}
              onChange={(e) => setVergiNo(e.target.value)}
              placeholder="Vergi numarası"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {raporTuru === 'ozel_sorgu' && (
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">Özel Sorgunuz</label>
              <textarea
                value={ozelSorgu}
                onChange={(e) => setOzelSorgu(e.target.value)}
                placeholder="Örn: Kasım'da net kâr neden düştü?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Rapor Oluşturuluyor...' : 'Rapor Oluştur'}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">AI rapor üretiliyor, lütfen bekleyin...</p>
        </div>
      )}

      {!isLoading && report && (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="text-lg font-semibold text-blue-800">Rapor Başarıyla Oluşturuldu</h3>
            <p className="text-sm text-blue-600">Rapor Türü: {RAPOR_TURLERI.find(r => r.value === report.raporTuru)?.label}</p>
          </div>

          {report.markdownRapor && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Rapor İçeriği</h3>
              {renderMarkdown(report.markdownRapor)}
            </div>
          )}

          {report.jsonOzet && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">JSON Özet</h3>
              <pre className="bg-white p-4 rounded border border-gray-300 overflow-x-auto text-xs">
                {JSON.stringify(JSON.parse(report.jsonOzet), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIReport;
