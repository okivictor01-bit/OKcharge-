      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#475569' }}>Quick Actions</h2>
        
        <a href="/admin/locations" style={navButtonStyle}>
           Manage Locations <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.totalLocations} total →</span>
        </a>
        
        <a href="/admin/owners" style={navButtonStyle}>
          👤 Manage Owners <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.totalOwners} total →</span>
        </a>

        <a href="/admin/powerbanks" style={navButtonStyle}>
          🔋 Manage Power Banks <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.availablePowerBanks} available →</span>
        </a>

        <a href="/admin/print-qr" style={navButtonStyle}>
          📍 Print Location QR Codes <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>

        <button
          onClick={() => router.push('/admin/print-powerbank-qr')}
          style={{...navButtonStyle, cursor: 'pointer'}}
        >
          🔋 Print Power Bank QR Codes <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </button>
      </div>
