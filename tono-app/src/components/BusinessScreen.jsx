import { useState } from 'react'
import { NORTH_LOCATIONS } from '../../data/northLocations'
import { supabase } from '../supabaseClient'

const CATEGORIES = [
  '🍱 Thực phẩm đóng gói',
  '🥬 Thực phẩm tươi',
  '🏠 Đồ gia dụng',
  '👕 Thời trang',
  '🧴 Mỹ phẩm - chăm sóc',
  '📱 Đồ điện tử - điện máy',
  '📚 Đồ học tập',
  '📦 Khác'
]

export default function BusinessScreen({ initialMode, businessData, onSaveBusiness, products, setProducts, onLogout, refreshData }) {
  const cities = Object.keys(NORTH_LOCATIONS)
  
  const [step, setStep] = useState(initialMode || 'dashboard')

  const [name, setName] = useState(businessData ? businessData.name : '')
  const [password, setPassword] = useState(businessData ? businessData.password : '')
  const [city, setCity] = useState(businessData ? businessData.city : cities[0])
  const [district, setDistrict] = useState(businessData ? businessData.district : NORTH_LOCATIONS[cities[0]][0])

  // Form thêm / sửa sản phẩm
  const [editingId, setEditingId] = useState(null)
  const [prodName, setProdName] = useState('')
  const [prodCategory, setProdCategory] = useState(CATEGORIES[0])
  const [prodImage, setProdImage] = useState('')
  const [origPrice, setOrigPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [prodStock, setProdStock] = useState('')
  const [prodDesc, setProdDesc] = useState('')

  function handleCityChange(e) {
    const newCity = e.target.value
    setCity(newCity)
    setDistrict(NORTH_LOCATIONS[newCity][0])
  }

  function handleRegisterSubmit(e) {
    e.preventDefault()
    if (!name || !password || !district) {
      alert('Vui lòng điền đầy đủ Tên doanh nghiệp, Mật khẩu quản lý và Quận/Huyện!')
      return
    }

    const newBiz = { name, password, city, district }
    onSaveBusiness(newBiz)
  }

  async function handleSaveProduct(e) {
    e.preventDefault()
    if (!prodName || !salePrice) {
      alert('Vui lòng điền tên hàng hóa và giá sau giảm!')
      return
    }

    const payload = {
      business_id: businessData ? businessData.id : 1,
      name: prodName,
      category: prodCategory,
      image: prodImage || '📦',
      original_price: origPrice ? Number(origPrice) : 0,
      sale_price: Number(salePrice),
      stock: prodStock ? Number(prodStock) : 1,
      condition_note: prodDesc || 'Hàng xả kho chất lượng'
    }

    if (editingId) {
      // Cập nhật sản phẩm trên Supabase
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        alert('Lỗi cập nhật: ' + error.message)
        return
      }
      alert('Cập nhật mặt hàng thành công!')
    } else {
      // Thêm mới sản phẩm lên Supabase
      const { error } = await supabase
        .from('products')
        .insert([payload])

      if (error) {
        alert('Lỗi thêm sản phẩm: ' + error.message)
        return
      }
      alert('Đăng tải mặt hàng lên đám mây thành công!')
    }

    if (refreshData) refreshData()
    resetProductForm()
    setStep('dashboard')
  }

  function startEditProduct(p) {
    setEditingId(p.id)
    setProdName(p.name)
    setProdCategory(p.category)
    setProdImage(p.image)
    setOrigPrice(p.origPrice ? p.origPrice.replace(/[^0-9]/g, '') : '')
    setSalePrice(p.salePrice ? p.salePrice.replace(/[^0-9]/g, '') : '')
    setProdStock(p.stock)
    setProdDesc(p.desc || '')
    setStep('add-product')
  }

  async function handleDeleteProduct(id) {
    if (confirm('Bạn có chắc chắn muốn xóa mặt hàng này khỏi hệ thống xả kho?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        alert('Xóa thất bại: ' + error.message)
        return
      }
      if (refreshData) refreshData()
    }
  }

  function resetProductForm() {
    setEditingId(null)
    setProdName('')
    setProdImage('')
    setOrigPrice('')
    setSalePrice('')
    setProdStock('')
    setProdDesc('')
  }

  // Kiểm tra nếu là tài khoản quản trị tối cao BaoAnhAdmin thì hiển thị toàn bộ sản phẩm của mọi cửa hàng
const isAdmin = businessData && businessData.name === 'BaoAnhAdmin';
const myProducts = isAdmin ? products : (businessData ? products.filter(p => p.business_id === businessData.id || !p.business_id) : []);

  if (step === 'register') {
    return (
      <div className="tono-app">
        <div className="tono-container" style={{ textAlign: 'left' }}>
          <button className="back-button" onClick={onLogout}>
            ← Quay lại trang chủ
          </button>
          <h2 style={{ fontSize: '20px', color: '#183b25', marginBottom: '6px' }}>Đăng ký tài khoản Doanh nghiệp</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Tên doanh nghiệp / Cửa hàng *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Kho hàng Minh Phát" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} required />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Mật khẩu dùng để đăng nhập sau này *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu riêng của tài khoản" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Tỉnh / Thành phố *</label>
                <select value={city} onChange={handleCityChange} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', background: '#fff', fontSize: '13px' }}>
                  {cities.map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Quận / Huyện *</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', background: '#fff', fontSize: '13px' }}>
                  {NORTH_LOCATIONS[city].map(d => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>
            <button type="submit" style={{ width: '100%', padding: '13px', background: '#159447', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
              Hoàn tất đăng ký tài khoản
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'add-product') {
    return (
      <div className="tono-app">
        <div className="tono-container" style={{ textAlign: 'left' }}>
          <button className="back-button" onClick={() => { resetProductForm(); setStep('dashboard'); }}>
            ← Quay lại trang thông tin
          </button>
          <h2 style={{ fontSize: '18px', color: '#183b25', marginBottom: '4px' }}>
            {editingId ? 'Cập nhật mặt hàng xả kho' : 'Thêm mặt hàng xả kho mới'}
          </h2>
          <p style={{ fontSize: '12px', color: '#6b776f', marginBottom: '16px' }}>Cập nhật chi tiết số lượng, tình trạng và giá</p>
          <form onSubmit={handleSaveProduct}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Tên hàng hóa *</label>
              <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Nhập tên sản phẩm..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} required />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Phân loại mặt hàng *</label>
              <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', background: '#fff', fontSize: '13px' }}>
                {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Hình ảnh (Emoji minh họa)</label>
              <input type="text" value={prodImage} onChange={(e) => setProdImage(e.target.value)} placeholder="Ví dụ: 🍜" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Giá gốc (VNĐ)</label>
                <input type="number" value={origPrice} onChange={(e) => setOrigPrice(e.target.value)} placeholder="50000" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Giá xả kho *</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="20000" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Số lượng tồn kho *</label>
              <input type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="Số lượng hiện tại" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }} required />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Tình trạng / Mô tả chi tiết</label>
              <textarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Ví dụ: Hàng mới 99%, cận date 1 tháng..." rows="2" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box', resize: 'none' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '13px', background: '#159447', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editingId ? 'Lưu thay đổi mặt hàng' : 'Đăng tải mặt hàng lên hệ thống'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="tono-app">
      <div className="tono-container" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#159447', fontWeight: 'bold', textTransform: 'uppercase' }}>🏪 Tài khoản Doanh nghiệp</div>
            <h2 style={{ fontSize: '18px', color: '#183b25', margin: '2px 0' }}>{businessData ? businessData.name : 'Cửa hàng của tôi'}</h2>
            <div style={{ fontSize: '12px', color: '#6b776f' }}>📍 Khu vực: Quận {businessData ? businessData.district : ''}, {businessData ? businessData.city : ''}</div>
          </div>
          <button onClick={onLogout} style={{ background: '#fdecea', color: '#e53935', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
            Đăng xuất
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px', textAlign: 'center' }}>
          <div style={{ background: '#e9f8ee', padding: '10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#159447' }}>{myProducts.length}</div>
            <div style={{ fontSize: '11px', color: '#6b776f' }}>Mặt hàng quản lý</div>
          </div>
          <div style={{ background: '#e9f8ee', padding: '10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#159447' }}>
              {myProducts.reduce((acc, p) => acc + Number(p.stock), 0)}
            </div>
            <div style={{ fontSize: '11px', color: '#6b776f' }}>Tổng số lượng tồn</div>
          </div>
        </div>

        <button onClick={() => { resetProductForm(); setStep('add-product'); }} style={{ width: '100%', padding: '13px', background: '#159447', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(21, 148, 71, 0.2)' }}>
          <span>➕</span> Thêm mặt hàng xả kho mới
        </button>

        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#183b25', marginBottom: '8px', borderBottom: '2px solid #e2eee6', paddingBottom: '4px' }}>
          Danh sách hàng hóa thực tế ({myProducts.length})
        </div>

        {myProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#999', fontSize: '13px', background: '#f9fcf9', borderRadius: '12px', border: '1px dashed #d0e0d5' }}>
            Chưa có mặt hàng nào được đăng tải.<br />
            Hãy bấm nút "Thêm mặt hàng" để bắt đầu!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {myProducts.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fcfdfc', borderRadius: '10px', border: '1px solid #e0ebe7', gap: '10px' }}>
                <div style={{ fontSize: '24px', width: '36px', height: '36px', background: '#f4f8f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {p.image.length > 2 ? '📦' : p.image}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#183b25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b776f' }}>{p.category} | Tồn: <strong style={{ color: '#159447' }}>{p.stock}</strong></div>
                  <div style={{ fontSize: '10px', color: '#e65100', fontStyle: 'italic' }}>Tình trạng: {p.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#e53935' }}>{p.salePrice}</div>
                    <div style={{ fontSize: '10px', color: '#999', textDecoration: 'line-through' }}>{p.origPrice}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEditProduct(p)} style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Sửa</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bottom-nav" style={{ marginTop: '20px' }}>
          <button className="nav-item active">🏠<span>Trang chủ</span></button>
          <button className="nav-item" onClick={() => { resetProductForm(); setStep('add-product'); }}>📦<span>Hàng hóa</span></button>
          <button className="nav-item" onClick={() => alert('Chưa có đơn hàng')}>🛒<span>Đơn hàng</span></button>
          <button className="nav-item" onClick={onLogout}>👤<span>Đăng xuất</span></button>
        </div>
      </div>
    </div>
  )
}