import { useState } from 'react'

export default function BusinessPassword({ onBack, onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleCheckPassword(e) {
    e.preventDefault()
    // Kiểm tra mật khẩu độc quyền của doanh nghiệp
    if (password === '29a4022653') {
      setError('')
      onAuthenticated() // Xác thực thành công, chuyển sang màn hình Đăng nhập / Đăng ký
    } else {
      setError('Mật khẩu doanh nghiệp không đúng. Vui lòng thử lại!')
    }
  }

  return (
    <div className="tono-app">
      <div className="tono-container" style={{ textAlign: 'left' }}>
        <button className="back-button" onClick={onBack}>
          ← Quay lại trang chủ
        </button>

        <div className="logo" style={{ textAlign: 'center', fontSize: '42px' }}>🏪</div>
        <h2 style={{ textAlign: 'center', fontSize: '20px', color: '#183b25', marginBottom: '8px' }}>
          Xác thực Doanh nghiệp
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b776f', marginBottom: '24px' }}>
          Nhập mật khẩu độc quyền để truy cập hệ thống doanh nghiệp
        </p>

        <form onSubmit={handleCheckPassword}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#33483b', display: 'block', marginBottom: '6px' }}>
              Mật khẩu quản trị doanh nghiệp *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d0e0d5', fontSize: '14px', boxSizing: 'border-box' }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ color: '#e53935', fontSize: '13px', marginBottom: '16px', background: '#fdecea', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{ width: '100%', padding: '14px', background: '#159447', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(21, 148, 71, 0.3)' }}
          >
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  )
}