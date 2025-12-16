import { useState, useEffect } from 'react';
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/services/masterDataService';
import { Unit } from '@/types';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const UnitManagement = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [formData, setFormData] = useState<Unit>({
    code: '',
    name: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const data = await getUnits();
      setUnits(data);
      setError(null);
    } catch (err) {
      setError('Birimler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingUnit?.id) {
        await updateUnit(editingUnit.id, formData);
      } else {
        await createUnit(formData);
      }
      await fetchUnits();
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData(unit);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu birimi silmek istediğinizden emin misiniz?')) return;

    setIsLoading(true);
    try {
      await deleteUnit(id);
      await fetchUnits();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Silme işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', description: '', active: true });
    setEditingUnit(null);
    setIsFormOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Birim Yönetimi</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Yeni Birim
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingUnit ? 'Birim Düzenle' : 'Yeni Birim Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="örn: adet, kg, lt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="örn: Adet, Kilogram, Litre"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Aktif</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {!isLoading && units.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {unit.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unit.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {unit.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unit.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {unit.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(unit)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => unit.id && handleDelete(unit.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && units.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500">Henüz birim eklenmemiş</p>
        </div>
      )}
    </div>
  );
};

export default UnitManagement;
