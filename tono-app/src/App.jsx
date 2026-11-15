import { useState, useEffect } from 'react'
import CustomerScreen from './components/CustomerScreen'
import BusinessPassword from './components/BusinessPassword'
import BusinessScreen from './components/BusinessScreen'
import { supabase } from './supabaseClient'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('home') 
  const [businessData, setBusinessData] = useState(null)
  const [products, setProducts] = useState([])
  const [allBusinesses, setAllBusinesses] = useState([]) // Danh sách tất cả doanh nghiệp trên mây

  // Load danh sách cửa hàng và sản phẩm từ Supabase khi khởi động
  useEffect(() => {
    fetchCloudData()
  }, [])

  async function fetchCloudData() {
    try {
      // Lấy danh sách doanh nghiệp từ Supabase
      const { data: bizData, error: bizError } = await supabase.from('businesses').select('*')
      if (!bizError && bizData) {
        setAllBusinesses(bizData)
        // Nếu đã từng lưu session đăng nhập trên máy này, khôi phục lại tài khoản tương ứng
        const savedBizName = localStorage.getItem('tono_current_biz_name')
        if (savedBizName) {
          const current = bizData.find(b => b.name === savedBizName)
          if (current) setBusinessData(current)
        }
      }

      // Lấy toàn bộ danh sách sản phẩm từ Supabase
      const { data: prodData, error: prodError } = await supabase.from('products').select('*')
      if (!prodError && prodData) {
        // Chuyển đổi cấu trúc trường dữ liệu cho khớp với giao diện
        const formattedProducts = prodData.map(p => ({
          id: p.id,
          business_id: p.business_id,
          name: p.name,
          category: p.category,
          image: p.image || '📦',
          origPrice: p.original_price ? Number(p.original_price).toLocaleString() + 'đ' : '---',
          salePrice: Number(p.sale_price).toLocaleString() + 'đ',
          stock: p.stock,
          desc: p.condition_note || ''
        }))
        setProducts(formattedProducts)
      }
    } catch (e) {
      console.error('Lỗi kết nối Supabase:', e)
    }
  }

  // Hàm lưu doanh nghiệp mới lên Supabase
  async function handleSaveNewBusiness(newBiz) {
    // Kiểm tra xem tên doanh nghiệp đã tồn tại chưa
    const { data: existing } = await supabase
      .from('businesses')
      .select('*')
      .eq('name', newBiz.name)
      .single()

    if (existing) {
      alert('Tên doanh nghiệp này đã tồn tại trên hệ thống! Vui lòng chọn tên khác hoặc đăng nhập.')
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        name: newBiz.name,
        password: newBiz.password,
        city: newBiz.city,
        district: newBiz.district
      }])
      .select()

    if (error) {
      alert('Đăng ký thất bại: ' + error.message)
    } else {
      const createdBiz = data[0]
      setBusinessData(createdBiz)
      localStorage.setItem('tono_current_biz_name', createdBiz.name)
      setAllBusinesses([...allBusinesses, createdBiz])
      setScreen('business')
      alert('Đăng ký tài khoản doanh nghiệp thành công trên đám mây!')
    }
  }

  if (screen === 'customer') {
    return (
      <CustomerScreen
        allBusinesses={allBusinesses}
        products={products}
        onBack={() => setScreen('home')}
      />
    )
  }

  if (screen === 'biz-password') {
    return (
      <BusinessPassword
        onBack={() => setScreen('home')}
        onAuthenticated={() => setScreen('biz-gate')}
      />
    )
  }

  if (screen === 'biz-gate') {
    return (
      <div className="tono-app">
        <div className="tono-container" style={{ textAlign: 'left' }}>
          <button className="back-button" onClick={() => setScreen('home')}>
            ← Quay lại trang chủ
          </button>

          <div className="logo" style={{ textAlign: 'center', fontSize: '42px' }}>🏪</div>
          <h2 style={{ textAlign: 'center', fontSize: '20px', color: '#183b25', marginBottom: '8px' }}>
            Cổng Quản lý Doanh nghiệp
          </h2>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b776f', marginBottom: '24px' }}>
            Lựa chọn hình thức truy cập hệ thống xả kho
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setScreen('login-form')}
              style={{ width: '100%', padding: '16px', background: '#159447', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(21, 148, 71, 0.3)' }}
            >
              🔑 Đăng nhập tài khoản đã có
            </button>

            <button
              onClick={() => setScreen('register')}
              style={{ width: '100%', padding: '16px', background: '#e9f8ee', color: '#159447', border: '1px solid #159447', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📝 Đăng ký tài khoản doanh nghiệp mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'login-form') {
    return (
      <BusinessLoginInput
        allBusinesses={allBusinesses}
        onBack={() => setScreen('biz-gate')}
        onSuccess={(biz) => {
          setBusinessData(biz)
          localStorage.setItem('tono_current_biz_name', biz.name)
          setScreen('business')
        }}
      />
    )
  }

  if (screen === 'register') {
    return (
      <BusinessScreen
        initialMode="register"
        businessData={businessData}
        onSaveBusiness={handleSaveNewBusiness}
        products={products}
        setProducts={setProducts}
        onLogout={() => {
          localStorage.removeItem('tono_current_biz_name')
          setBusinessData(null)
          setScreen('home')
        }}
        refreshData={fetchCloudData}
      />
    )
  }

  if (screen === 'business') {
    return (
      <BusinessScreen
        initialMode="dashboard"
        businessData={businessData}
        onSaveBusiness={handleSaveNewBusiness}
        products={products}
        setProducts={setProducts}
        onLogout={() => {
          localStorage.removeItem('tono_current_biz_name')
          setBusinessData(null)
          setScreen('home')
        }}
        refreshData={fetchCloudData}
      />
    )
  }

  return (
    <div className="tono-app">
      <div className="tono-container">
        <div className="logo">Tono</div>
        <h1>Hàng tồn kho – Giá tốt – Cho mọi người!</h1>
        <p className="subtitle">Kết nối cửa hàng thanh lý, xả kho với người tiêu dùng có nhu cầu thật.</p>

        <h2>Bạn là ai?</h2>
        <p style={{ fontSize: '13px', color: '#6b776f', marginTop: '-12px', marginBottom: '20px' }}>
          Vui lòng chọn vai trò để tiếp tục
        </p>

        <div className="role-list">
          <button className="role-button customer" onClick={() => setScreen('customer')}>
            <span className="icon">👥</span>
            <span>
              <strong>Khách hàng</strong>
              <small>Tìm kiếm cửa hàng xả kho, săn hàng giá rẻ Miền Bắc</small>
            </span>
          </button>

          <button className="role-button business" onClick={() => setScreen('biz-password')}>
            <span className="icon">🏪</span>
            <span>
              <strong>Doanh nghiệp</strong>
              <small>Yêu cầu mật khẩu quản trị để đăng ký/đăng nhập</small>
            </span>
          </button>
        </div>

        <div className="footer">TONO © 2026</div>
      </div>
    </div>
  )
}

function BusinessLoginInput({ allBusinesses, onBack, onSuccess }) {
  const [bizNameInput, setBizNameInput] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  function handleCheck(e) {
    e.preventDefault()
    const found = allBusinesses.find(b => b.name.toLowerCase() === bizNameInput.trim().toLowerCase())
    if (!found) {
      setErr('Không tìm thấy tên doanh nghiệp này trên hệ thống!')
      return
    }
    if (pass === found.password) {
      onSuccess(found)
    } else {
      setErr('Mật khẩu doanh nghiệp không đúng!')
    }
  }

  return (
    <div className="tono-app">
      <div className="tono-container" style={{ textAlign: 'left' }}>
        <button className="back-button" onClick={onBack}>← Quay lại</button>
        <h2 style={{ fontSize: '20px', color: '#183b25', marginBottom: '8px' }}>Đăng nhập cửa hàng</h2>
        <form onSubmit={handleCheck}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Tên doanh nghiệp</label>
            <input
              type="text"
              value={bizNameInput}
              onChange={(e) => setBizNameInput(e.target.value)}
              placeholder="Nhập tên doanh nghiệp của bạn..."
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Mật khẩu riêng</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Mật khẩu của tài khoản..."
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '13px', boxSizing: 'border-box' }}
              required
            />
          </div>
          {err && <div style={{ color: '#e53935', fontSize: '13px', marginBottom: '12px' }}>{err}</div>}
          <button type="submit" style={{ width: '100%', padding: '13px', background: '#159447', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Đăng nhập ngay
          </button>
        </form>
      </div>
    </div>
  )
}