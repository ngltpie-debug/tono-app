import { useState } from 'react'
import { NORTH_LOCATIONS } from '../../data/northLocations'

const CATEGORIES = [
  { id: 'food', name: '🍱 Thực phẩm đóng gói' },
  { id: 'fresh', name: '🥬 Thực phẩm tươi' },
  { id: 'home', name: '🏠 Đồ gia dụng' },
  { id: 'fashion', name: '👕 Thời trang' },
  { id: 'cosmetic', name: '🧴 Mỹ phẩm - chăm sóc' },
  { id: 'tech', name: '📱 Đồ điện tử - điện máy' },
  { id: 'study', name: '📚 Đồ học tập' },
  { id: 'other', name: '📦 Khác' }
]

export default function CustomerScreen({ allBusinesses, products, onBack }) {
  const cities = Object.keys(NORTH_LOCATIONS)
  
  const [city, setCity] = useState(cities[0])
  const [district, setDistrict] = useState(NORTH_LOCATIONS[cities[0]][0])
  const [selectedCategories, setSelectedCategories] = useState(['🍱 Thực phẩm đóng gói'])
  
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)

  function handleCityChange(e) {
    const newCity = e.target.value
    setCity(newCity)
    setDistrict(NORTH_LOCATIONS[newCity][0])
    setHasSearched(false)
  }

  function handleDistrictChange(e) {
    setDistrict(e.target.value)
    setHasSearched(false)
  }

  function toggleCategory(catName) {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName))
    } else {
      setSelectedCategories([...selectedCategories, catName])
    }
    setHasSearched(false)
  }

  // CHI TIẾT CỬA HÀNG VÀ HÀNG HÓA THỜI GIAN THỰC CHO KHÁCH HÀNG
  if (selectedStore) {
    const storeProducts = products.filter(p => p.business_id === selectedStore.id && selectedCategories.includes(p.category))

    return (
      <div className="tono-app">
        <div className="tono-container" style={{ textAlign: 'left' }}>
          <button className="back-button" onClick={() => setSelectedStore(null)}>
            ← Quay lại danh sách kết quả
          </button>

          <div style={{ background: 'linear-gradient(135deg, #e9f8ee, #d2f3dd)', height: '110px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', marginBottom: '14px', border: '1px solid #d0e0d5' }}>
            🏪
          </div>

          <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#183b25' }}>{selectedStore.name}</h2>
          <div style={{ fontSize: '13px', color: '#6b776f', marginBottom: '6px' }}>
            ⭐ 4.8 (Cửa hàng xả kho uy tín tại Miền Bắc)
          </div>
          <span className="store-badge" style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', background: '#ff4d4f', color: '#fff', fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>
            Xả kho trực tiếp - Giảm giá mạnh
          </span>
          <p style={{ fontSize: '13px', color: '#465a50', margin: '4px 0 16px', lineHeight: '1.5' }}>
            📍 Địa chỉ giao dịch: Quận {selectedStore.district}, {selectedStore.city}, Miền Bắc
          </p>

          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#183b25', marginBottom: '10px', borderBottom: '2px solid #e2eee6', paddingBottom: '4px' }}>
            Mặt hàng xả kho theo nhu cầu ({storeProducts.length})
          </div>

          {storeProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '13px', background: '#f9fcf9', borderRadius: '12px', border: '1px dashed #d0e0d5' }}>
              Cửa hàng hiện chưa có mặt hàng nào khớp với danh mục bạn chọn.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {storeProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#fcfdfc', borderRadius: '12px', border: '1px solid #e0ebe7', gap: '10px' }}>
                  <div style={{ fontSize: '24px', width: '42px', height: '42px', background: '#f4f8f5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.image.length > 2 ? '📦' : p.image}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#183b25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#6b776f' }}>{p.category}</div>
                    <div style={{ fontSize: '11px', color: '#159447', fontWeight: 'bold', marginTop: '2px' }}>
                      Số lượng tồn: {p.stock} sản phẩm
                    </div>
                    <div style={{ fontSize: '10px', color: '#e65100', fontStyle: 'italic', marginTop: '1px' }}>
                      Tình trạng: {p.desc}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#e53935' }}>{p.salePrice}</div>
                    <div style={{ fontSize: '10px', color: '#999', textDecoration: 'line-through' }}>{p.origPrice}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Lọc danh sách cửa hàng theo khu vực được chọn khi người dùng bấm Tìm kiếm
  let availableStores = []
  if (hasSearched) {
    availableStores = allBusinesses.filter(b => b.city === city && b.district === district)
  }

  return (
    <div className="tono-app">
      <div className="tono-container" style={{ textAlign: 'left' }}>
        <button className="back-button" onClick={onBack}>
          ← Quay lại trang chủ
        </button>

        <h2 style={{ fontSize: '20px', marginBottom: '6px', color: '#183b25' }}>Tìm cửa hàng xả kho Miền Bắc</h2>
        <p style={{ fontSize: '13px', color: '#6b776f', marginBottom: '16px' }}>
          Lựa chọn khu vực và nhu cầu, sau đó bấm tìm kiếm để kết nối cửa hàng
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#33483b', display: 'block', marginBottom: '6px' }}>Tỉnh / Thành phố *</label>
            <select value={city} onChange={handleCityChange} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', background: '#fff', fontSize: '13px' }}>
              {cities.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#33483b', display: 'block', marginBottom: '6px' }}>Quận / Huyện *</label>
            <select value={district} onChange={handleDistrictChange} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', background: '#fff', fontSize: '13px' }}>
              {NORTH_LOCATIONS[city].map(d => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#33483b', display: 'block', marginBottom: '6px' }}>Danh mục sản phẩm quan tâm *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategories.includes(cat.name)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.name)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: active ? '1px solid #159447' : '1px solid #d0e0d5',
                    background: active ? '#e9f8ee' : '#fff',
                    color: active ? '#159447' : '#555',
                    cursor: 'pointer',
                    fontWeight: active ? 'bold' : 'normal'
                  }}
                >
                  {cat.name} {active ? '✓' : ''}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setHasSearched(true)}
          style={{ width: '100%', padding: '13px', background: '#159447', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 12px rgba(21, 148, 71, 0.2)' }}
        >
          🔍 Tìm kiếm cửa hàng phù hợp
        </button>

        {hasSearched && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#183b25', marginBottom: '8px', borderBottom: '2px solid #e2eee6', paddingBottom: '4px' }}>
              Danh sách cửa hàng tại Quận {district}, {city} ({availableStores.length})
            </div>

            {availableStores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '13px', background: '#f9fcf9', borderRadius: '12px', border: '1px dashed #d0e0d5' }}>
                Chưa có cửa hàng doanh nghiệp nào đăng ký tại khu vực này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {availableStores.map(store => (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    style={{ padding: '12px', background: '#fcfdfc', borderRadius: '12px', border: '1px solid #e0ebe7', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#183b25' }}>{store.name}</div>
                      <div style={{ fontSize: '11px', color: '#6b776f' }}>📍 Quận {store.district}, {store.city}</div>
                    </div>
                    <div style={{ background: '#159447', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                      Xem kho →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}