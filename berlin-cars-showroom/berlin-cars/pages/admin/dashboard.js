import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const EMPTY_CAR = {
  make:'', model:'', year: new Date().getFullYear(),
  price:'', km:'', color:'', fuel:'Petrol',
  transmission:'Automatic', seats:5, condition:'Used',
  location:'Doha', description:'', features:'',
  tags:'', badge:'', is_sold:false, is_featured:false,
  whatsapp:'', phone:''
}

export default function Dashboard() {
  const router = useRouter()
  const [cars, setCars] = useState([])
  const [view, setView] = useState('list') // list | add | edit | settings
  const [editCar, setEditCar] = useState(null)
  const [form, setForm] = useState(EMPTY_CAR)
  const [photos, setPhotos] = useState([]) // for edit view
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [newPwd, setNewPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [search, setSearch] = useState('')
  const fileRef = useRef()

  useEffect(() => { loadCars() }, [])

  const loadCars = async () => {
    const res = await fetch('/api/cars')
    if (res.status === 401) { router.push('/admin'); return }
    const data = await res.json()
    setCars(data)
  }

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/admin')
  }

  const startAdd = () => { setForm(EMPTY_CAR); setEditCar(null); setPhotos([]); setMsg(''); setView('add') }
  const startEdit = (car) => {
    setEditCar(car)
    setForm({
      ...car,
      features: Array.isArray(car.features) ? car.features.join(', ') : '',
      tags: Array.isArray(car.tags) ? car.tags.join(', ') : ''
    })
    setPhotos(car.car_photos?.sort((a,b) => a.sort_order - b.sort_order) || [])
    setMsg('')
    setView('edit')
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const saveCar = async () => {
    setSaving(true); setMsg('')
    const payload = {
      ...form,
      features: form.features ? form.features.split(',').map(s=>s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
    }
    if (editCar) payload.id = editCar.id

    const res = await fetch('/api/cars', {
      method: editCar ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    setSaving(false)
    if (data.error) { setMsg('Error: ' + data.error); return }
    setMsg('✅ Car saved!')
    if (!editCar) {
      setEditCar(data)
      setForm(f => ({ ...f }))
    }
    await loadCars()
  }

  const deleteCar = async (id) => {
    await fetch(`/api/cars?id=${id}`, { method: 'DELETE' })
    setDeleteId(null)
    loadCars()
  }

  const uploadPhotos = async (files) => {
    if (!editCar) { setMsg('Save the car first, then upload photos.'); return }
    setUploading(true)
    for (const file of files) {
      const base64 = await toBase64(file)
      const isFirst = photos.length === 0
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: editCar.id,
          base64,
          filename: file.name,
          is_cover: isFirst,
          sort_order: photos.length
        })
      })
      const data = await res.json()
      if (!data.error) setPhotos(p => [...p, data])
    }
    setUploading(false)
    loadCars()
  }

  const deletePhoto = async (photo) => {
    await fetch('/api/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photo.id, storage_path: photo.storage_path })
    })
    setPhotos(p => p.filter(x => x.id !== photo.id))
    loadCars()
  }

  const setCover = async (photoId) => {
    // update all photos for this car: set is_cover
    const updates = photos.map(p => ({
      ...p,
      is_cover: p.id === photoId
    }))
    for (const p of updates) {
      await fetch('/api/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editCar.id }) // no-op to trigger update
      })
    }
    setPhotos(updates)
  }

  const changePassword = async () => {
    if (newPwd.length < 6) { setPwdMsg('Minimum 6 characters'); return }
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPwd })
    })
    const data = await res.json()
    setPwdMsg(data.success ? '✅ Password changed!' : '❌ Error changing password')
    setNewPwd('')
  }

  const toBase64 = file => new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })

  const filteredCars = cars.filter(c =>
    `${c.make} ${c.model}`.toLowerCase().includes(search.toLowerCase())
  )

  const S = { // styles shorthand
    card: { background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:24 },
    row: { display:'flex',gap:16,flexWrap:'wrap' },
    col: { flex:1,minWidth:160 },
    section: { marginBottom:28 },
  }

  return (
    <>
      <Head><title>Admin Dashboard — Berlin Cars</title></Head>
      <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column'}}>

        {/* TOP NAV */}
        <div style={{
          background:'var(--bg2)',borderBottom:'1px solid var(--border)',
          padding:'0 24px',height:60,display:'flex',alignItems:'center',
          justifyContent:'space-between',position:'sticky',top:0,zIndex:100
        }}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{
              fontFamily:'Bebas Neue',fontSize:22,letterSpacing:2,
              background:'linear-gradient(135deg,var(--gold),var(--gold2))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
            }}>Berlin Cars</span>
            <span style={{color:'var(--muted)',fontSize:13}}>Admin Panel</span>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['list','add','settings'].map(v => (
              <button key={v} onClick={() => { setView(v); setMsg('') }}
                style={{
                  background: view===v?'var(--gold)':'transparent',
                  color: view===v?'#000':'var(--muted)',
                  border:'1px solid '+(view===v?'var(--gold)':'var(--border)'),
                  padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:13,
                  fontWeight: view===v?700:400
                }}>
                {v==='list'?'🚗 Cars':v==='add'?'＋ Add Car':'⚙️ Settings'}
              </button>
            ))}
            <a href="/" target="_blank" style={{
              background:'transparent',border:'1px solid var(--border)',
              color:'var(--muted)',padding:'6px 14px',borderRadius:6,fontSize:13
            }}>👁 View Site</a>
            <button onClick={logout} style={{
              background:'transparent',border:'1px solid var(--border)',
              color:'var(--muted)',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:13
            }}>Logout</button>
          </div>
        </div>

        <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px',width:'100%'}}>

          {/* ── CAR LIST ── */}
          {view === 'list' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
                <h2 style={{fontFamily:'Bebas Neue',fontSize:28,letterSpacing:1}}>
                  Car Listings <span style={{color:'var(--muted)',fontSize:18}}>({cars.length})</span>
                </h2>
                <div style={{display:'flex',gap:10}}>
                  <input className="input" placeholder="Search cars..." value={search}
                    onChange={e=>setSearch(e.target.value)} style={{width:220}} />
                  <button className="btn-gold" onClick={startAdd}>＋ Add New Car</button>
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {filteredCars.map(car => {
                  const cover = car.car_photos?.find(p=>p.is_cover) || car.car_photos?.[0]
                  return (
                    <div key={car.id} style={{
                      ...S.card,
                      display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'
                    }}>
                      <div style={{
                        width:100,height:72,borderRadius:8,overflow:'hidden',
                        background:'var(--bg3)',flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:36,opacity:.4
                      }}>
                        {cover ? <img src={cover.url} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : '🚗'}
                      </div>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{fontFamily:'Bebas Neue',fontSize:20,letterSpacing:1,marginBottom:2}}>
                          <span style={{color:'var(--gold)'}}>{car.make}</span> {car.model} <span style={{color:'var(--muted)',fontSize:14}}>{car.year}</span>
                        </div>
                        <div style={{fontSize:18,fontWeight:700,color:'var(--gold2)',marginBottom:2}}>
                          {car.price?.toLocaleString()} QAR
                        </div>
                        <div style={{color:'var(--muted)',fontSize:12,display:'flex',gap:12}}>
                          <span>{car.km?.toLocaleString()} km</span>
                          <span>{car.fuel}</span>
                          <span>📍 {car.location}</span>
                          <span>📷 {car.car_photos?.length || 0} photos</span>
                          {car.is_sold && <span style={{color:'var(--red)',fontWeight:700}}>SOLD</span>}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn-gold" onClick={()=>startEdit(car)} style={{padding:'7px 16px',fontSize:13}}>
                          ✏️ Edit
                        </button>
                        <button onClick={()=>setDeleteId(car.id)} style={{
                          background:'transparent',border:'1px solid var(--red)',
                          color:'var(--red)',padding:'7px 16px',borderRadius:8,
                          cursor:'pointer',fontSize:13
                        }}>🗑 Delete</button>
                      </div>
                    </div>
                  )
                })}
                {filteredCars.length === 0 && (
                  <div style={{textAlign:'center',padding:60,color:'var(--muted)'}}>
                    {cars.length === 0 ? 'No cars yet. Add your first car!' : 'No cars match search.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ADD / EDIT FORM ── */}
          {(view === 'add' || view === 'edit') && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
                <h2 style={{fontFamily:'Bebas Neue',fontSize:28,letterSpacing:1}}>
                  {editCar ? `Edit: ${editCar.make} ${editCar.model}` : 'Add New Car'}
                </h2>
                <button className="btn-outline" onClick={()=>{setView('list');setMsg('')}}>← Back to List</button>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                {/* Left col */}
                <div>
                  <div style={S.card}>
                    <div style={{fontFamily:'Bebas Neue',fontSize:18,letterSpacing:1,marginBottom:18,color:'var(--gold)'}}>Car Details</div>
                    <div style={S.row}>
                      <div style={S.col}>
                        <label className="label">Make *</label>
                        <input className="input" name="make" value={form.make} onChange={handleChange} placeholder="Toyota" />
                      </div>
                      <div style={S.col}>
                        <label className="label">Model *</label>
                        <input className="input" name="model" value={form.model} onChange={handleChange} placeholder="Land Cruiser" />
                      </div>
                    </div>
                    <div style={{...S.row,marginTop:12}}>
                      <div style={S.col}>
                        <label className="label">Year *</label>
                        <input className="input" name="year" type="number" value={form.year} onChange={handleChange} />
                      </div>
                      <div style={S.col}>
                        <label className="label">Price (QAR) *</label>
                        <input className="input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="250000" />
                      </div>
                    </div>
                    <div style={{...S.row,marginTop:12}}>
                      <div style={S.col}>
                        <label className="label">Mileage (KM) *</label>
                        <input className="input" name="km" type="number" value={form.km} onChange={handleChange} placeholder="35000" />
                      </div>
                      <div style={S.col}>
                        <label className="label">Color</label>
                        <input className="input" name="color" value={form.color} onChange={handleChange} placeholder="Pearl White" />
                      </div>
                    </div>
                    <div style={{...S.row,marginTop:12}}>
                      <div style={S.col}>
                        <label className="label">Fuel</label>
                        <select className="input" name="fuel" value={form.fuel} onChange={handleChange}>
                          {['Petrol','Diesel','Hybrid','Electric'].map(v=><option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div style={S.col}>
                        <label className="label">Transmission</label>
                        <select className="input" name="transmission" value={form.transmission} onChange={handleChange}>
                          {['Automatic','Manual','CVT'].map(v=><option key={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{...S.row,marginTop:12}}>
                      <div style={S.col}>
                        <label className="label">Seats</label>
                        <input className="input" name="seats" type="number" value={form.seats} onChange={handleChange} />
                      </div>
                      <div style={S.col}>
                        <label className="label">Condition</label>
                        <select className="input" name="condition" value={form.condition} onChange={handleChange}>
                          {['Used','New','Excellent','Good'].map(v=><option key={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{marginTop:12}}>
                      <label className="label">Location</label>
                      <input className="input" name="location" value={form.location} onChange={handleChange} placeholder="Doha" />
                    </div>
                    <div style={{marginTop:12}}>
                      <label className="label">Description</label>
                      <textarea className="input" name="description" value={form.description}
                        onChange={handleChange} rows={4} placeholder="Describe the car..." />
                    </div>
                  </div>

                  <div style={{...S.card,marginTop:20}}>
                    <div style={{fontFamily:'Bebas Neue',fontSize:18,letterSpacing:1,marginBottom:18,color:'var(--gold)'}}>Contact & Status</div>
                    <div style={S.row}>
                      <div style={S.col}>
                        <label className="label">Phone</label>
                        <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+974 XXXX XXXX" />
                      </div>
                      <div style={S.col}>
                        <label className="label">WhatsApp</label>
                        <input className="input" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+974XXXXXXXX" />
                      </div>
                    </div>
                    <div style={{...S.row,marginTop:12}}>
                      <div style={S.col}>
                        <label className="label">Badge</label>
                        <select className="input" name="badge" value={form.badge} onChange={handleChange}>
                          <option value="">None</option>
                          <option value="new">New Arrival</option>
                          <option value="hot">Hot Deal</option>
                        </select>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:20,marginTop:16}}>
                      <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer',color:'var(--white)',fontSize:14}}>
                        <input type="checkbox" name="is_sold" checked={form.is_sold} onChange={handleChange} />
                        Mark as Sold
                      </label>
                      <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer',color:'var(--white)',fontSize:14}}>
                        <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                        Featured
                      </label>
                    </div>
                    <div style={{marginTop:12}}>
                      <label className="label">Tags (comma separated)</label>
                      <input className="input" name="tags" value={form.tags} onChange={handleChange} placeholder="4WD, V8, Low KM" />
                    </div>
                    <div style={{marginTop:12}}>
                      <label className="label">Features (comma separated)</label>
                      <input className="input" name="features" value={form.features} onChange={handleChange} placeholder="Sunroof, Leather Seats, Apple CarPlay" />
                    </div>
                  </div>
                </div>

                {/* Right col: photos */}
                <div>
                  <div style={S.card}>
                    <div style={{fontFamily:'Bebas Neue',fontSize:18,letterSpacing:1,marginBottom:4,color:'var(--gold)'}}>Photos</div>
                    {!editCar && (
                      <div style={{
                        background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.2)',
                        borderRadius:8,padding:'10px 14px',marginBottom:14,
                        color:'var(--gold)',fontSize:13
                      }}>
                        💡 Save the car details first, then upload photos
                      </div>
                    )}

                    {editCar && (
                      <>
                        <div
                          onClick={()=>fileRef.current.click()}
                          style={{
                            border:'2px dashed var(--border)',borderRadius:10,
                            padding:'32px 20px',textAlign:'center',cursor:'pointer',
                            marginBottom:16,transition:'border-color .2s',
                            color:'var(--muted)'
                          }}
                          onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
                          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                        >
                          <div style={{fontSize:36,marginBottom:8}}>📷</div>
                          <div style={{fontSize:14,marginBottom:4}}>Click to upload photos</div>
                          <div style={{fontSize:12,color:'var(--muted)'}}>JPG, PNG, WEBP — Multiple files supported</div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}}
                          onChange={e=>uploadPhotos(Array.from(e.target.files))} />

                        {uploading && (
                          <div style={{textAlign:'center',padding:16,color:'var(--gold)'}}>⏳ Uploading...</div>
                        )}

                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                          {photos.map((p,i) => (
                            <div key={p.id} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'4/3',background:'var(--bg3)'}}>
                              <img src={p.url} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                              <div style={{
                                position:'absolute',inset:0,background:'rgba(0,0,0,.55)',
                                opacity:0,transition:'opacity .2s',display:'flex',
                                flexDirection:'column',gap:6,alignItems:'center',justifyContent:'center'
                              }}
                                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                                onMouseLeave={e=>e.currentTarget.style.opacity=0}
                              >
                                <button onClick={()=>deletePhoto(p)} style={{
                                  background:'var(--red)',border:'none',color:'#fff',
                                  padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:12
                                }}>🗑 Delete</button>
                                {i===0 && <span style={{fontSize:10,color:'var(--gold)',fontWeight:700}}>COVER</span>}
                              </div>
                              {i===0 && (
                                <div style={{
                                  position:'absolute',bottom:4,left:4,
                                  background:'var(--gold)',color:'#000',
                                  fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:3
                                }}>COVER</div>
                              )}
                            </div>
                          ))}
                        </div>
                        {photos.length === 0 && !uploading && (
                          <div style={{textAlign:'center',padding:24,color:'var(--muted)',fontSize:13}}>No photos yet</div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Save button */}
                  <div style={{...S.card,marginTop:20}}>
                    {msg && (
                      <div style={{
                        color: msg.startsWith('✅') ? 'var(--green)' : 'var(--red)',
                        fontSize:14,marginBottom:12
                      }}>{msg}</div>
                    )}
                    <button className="btn-gold" onClick={saveCar} disabled={saving}
                      style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}}>
                      {saving ? 'Saving...' : editCar ? '💾 Save Changes' : '✅ Save Car'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {view === 'settings' && (
            <div style={{maxWidth:500}}>
              <h2 style={{fontFamily:'Bebas Neue',fontSize:28,letterSpacing:1,marginBottom:20}}>Settings</h2>
              <div style={S.card}>
                <div style={{fontFamily:'Bebas Neue',fontSize:18,letterSpacing:1,marginBottom:18,color:'var(--gold)'}}>Change Password</div>
                <label className="label">New Password</label>
                <input className="input" type="password" value={newPwd}
                  onChange={e=>setNewPwd(e.target.value)} placeholder="Min. 6 characters" style={{marginBottom:12}} />
                {pwdMsg && <div style={{color:pwdMsg.startsWith('✅')?'var(--green)':'var(--red)',fontSize:13,marginBottom:12}}>{pwdMsg}</div>}
                <button className="btn-gold" onClick={changePassword}>🔐 Update Password</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div onClick={()=>setDeleteId(null)} style={{
          position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.8)',
          display:'flex',alignItems:'center',justifyContent:'center',padding:20
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'var(--card)',border:'1px solid var(--border)',
            borderRadius:16,padding:32,maxWidth:360,width:'100%',textAlign:'center'
          }}>
            <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>Delete this car?</div>
            <div style={{color:'var(--muted)',fontSize:14,marginBottom:24}}>This will permanently delete the car and all its photos.</div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button onClick={()=>deleteCar(deleteId)} style={{
                background:'var(--red)',color:'#fff',border:'none',
                padding:'10px 24px',borderRadius:8,cursor:'pointer',fontWeight:700
              }}>Yes, Delete</button>
              <button className="btn-outline" onClick={()=>setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
