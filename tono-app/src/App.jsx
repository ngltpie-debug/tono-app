import { useState, useEffect } from 'react'
import CustomerScreen from './components/CustomerScreen'
import BusinessPassword from './components/BusinessPassword'
import BusinessScreen from './components/BusinessScreen'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('home') 
  
  const [businessData, setBusinessData] = useState(null)
  const [products, setProducts] = useState([])

  // Load thông tin doanh nghiệp và danh sách mặt hàng từ localStorage khi khởi động
  useEffect(() => {
    const savedBiz = localStorage.getItem('tono_business_account')
    if (savedBiz) {
      try {
        setBusinessData(JSON.parse(savedBiz))
      } catch (e) {
        console.error(e)
      }
    }

    const savedProducts = localStorage.getItem('tono_business_products')
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Hàm cập nhật và lưu danh sách mặt hàng xuống localStorage
  function handleUpdateProducts(newProducts) {
    setProducts(newProducts)
    localStorage.setItem('tono_business_products', JSON.stringify(newProducts))
  }

  function handleSaveNewBusiness(newBiz) {
    setBusinessData(newBiz)
    localStorage.setItem('tono_business_account', JSON.stringify(newBiz))
    setScreen('business')
  }

  if (screen === 'customer') {
    return (
      <CustomerScreen
        businessData={businessData}
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
              onClick={() => {
                const saved = localStorage.getItem('tono_business_account')
                if (!saved) {
                  alert('Chưa có tài khoản nào được đăng ký trên thiết bị này. Vui lòng bấm Đăng ký tài khoản mới!')
                  return
                }
                setScreen('login-form')
              }}
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
        onBack={() => setScreen('biz-gate')}
        onSuccess={() => setScreen('business')}
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
        setProducts={handleUpdateProducts}
        onLogout={() => setScreen('home')}
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
        setProducts={handleUpdateProducts}
        onLogout={() => setScreen('home')}
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

function BusinessLoginInput({ onBack, onSuccess }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  function handleCheck(e) {
    e.preventDefault()
    const saved = localStorage.getItem('tono_business_account')
    if (saved) {
      const data = JSON.parse(saved)
      if (pass === data.password) {
        onSuccess()
      } else {
        setErr('Mật khẩu doanh nghiệp không đúng!')
      }
    }
  }

  return (
    <div className="tono-app">
      <div className="tono-container" style={{ textAlign: 'left' }}>
        <button className="back-button" onClick={onBack}>← Quay lại</button>
        <h2 style={{ fontSize: '20px', color: '#183b25', marginBottom: '8px' }}>Nhập mật khẩu cửa hàng</h2>
        <form onSubmit={handleCheck}>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Mật khẩu riêng của bạn..."
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }}
            autoFocus
          />
          {err && <div style={{ color: '#e53935', fontSize: '13px', marginBottom: '12px' }}>{err}</div>}
          <button type="submit" style={{ width: '100%', padding: '13px', background: '#159447', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}