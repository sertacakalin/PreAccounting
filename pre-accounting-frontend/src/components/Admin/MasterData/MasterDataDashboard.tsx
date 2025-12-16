import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaTags, FaRulerCombined, FaPercent, FaMoneyBillWave } from 'react-icons/fa';

const MasterDataDashboard = () => {
  const masterDataModules = [
    {
      title: 'Cari Hesaplar',
      description: 'Müşteri ve tedarikçi hesapları',
      icon: <FaUsers className="text-4xl text-blue-600" />,
      path: '/admin/master-data/accounts',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Ürün/Hizmetler',
      description: 'Ürün ve hizmet kataloğu',
      icon: <FaBox className="text-4xl text-green-600" />,
      path: '/admin/master-data/products',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Kategoriler',
      description: 'Ürün kategorileri',
      icon: <FaTags className="text-4xl text-purple-600" />,
      path: '/admin/master-data/categories',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Birimler',
      description: 'Ölçü birimleri (adet, kg, litre)',
      icon: <FaRulerCombined className="text-4xl text-orange-600" />,
      path: '/admin/master-data/units',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'KDV Oranları',
      description: 'Vergi oranları (%0, %1, %10, %20)',
      icon: <FaPercent className="text-4xl text-red-600" />,
      path: '/admin/master-data/tax-rates',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Para Birimleri',
      description: 'Döviz türleri (TRY, USD, EUR)',
      icon: <FaMoneyBillWave className="text-4xl text-yellow-600" />,
      path: '/admin/master-data/currencies',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ana Veri Yönetimi</h1>
        <p className="text-gray-600">Muhasebe sisteminin temel verilerini buradan yönetebilirsiniz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterDataModules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className={`${module.bgColor} ${module.borderColor} border-2 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              {module.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{module.title}</h2>
            <p className="text-gray-600 text-sm">{module.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📌 Önemli Not</h3>
        <p className="text-blue-700 text-sm">
          Ana veri yönetimi sistemi, fatura ve raporlama işlemleriniz için temel verileri saklar.
          Bu verileri eksiksiz ve doğru bir şekilde girmek, sistemin verimli çalışması için kritiktir.
        </p>
      </div>
    </div>
  );
};

export default MasterDataDashboard;
