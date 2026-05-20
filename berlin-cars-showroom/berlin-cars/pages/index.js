import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [cars, setCars] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [search, setSearch] = useState('')
  const [makeFilter, setMakeFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cars')
      .then(r => r.json())
      .then(data => {
        setCars(data)
        setFiltered(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = cars
    if (search) result = result.filter(c =>
      `${c.make} ${c.model} ${c.color} ${c.location}`.toLowerCase().includes(search.toLowerCase())
    )
    if (makeFilter) result = result.filter(c => c.make === makeFilter)
    if (yearFilter) result = result.filter(c => String(c.year) === yearFilter)
    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(Number)
      result = result.filter(c => c.price >= min && c.price <= max)
    }
    setFiltered(result)
  }, [search, makeFilter, yearFilter, priceFilter, cars])

  const makes = [...new Set(cars.map(c => c.make))].sort()
  const years = [...new Set(cars.map(c => c.year))].sort((a,b) => b-a)

  const openCar = (car) => { setSelectedCar(car); setPhotoIdx(0); document.body.style.overflow='hidden' }
  const closeModal = () => { setSelectedCar(null); document.body.style.overflow='' }

  const photos = selectedCar?.car_photos?.sort((a,b) => a.sort_order - b.sort_order) || []

  const coverPhoto = (car) => {
    const photos = car.car_photos || []
    const cover = photos.find(p => p.is_cover) || photos[0]
    return cover?.url || null
  }

  const fmt = n => n?.toLocaleString()

  return (
    <>
      <Head>
        <title>Berlin Cars Showroom — Premium Vehicles</title>
        <meta name="description" content="Browse our premium car collection at Berlin Cars Showroom" />
      </Head>

      {/* HEADER */}
      <header style={{
        position:'sticky',top:0,zIndex:100,
        background:'rgba(10,10,12,0.95)',
        backdropFilter:'blur(18px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 24px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        height:64
      }}>
        <div style={{
          fontFamily:'Bebas Neue',fontSize:26,letterSpacing:3,
          background:'linear-gradient(135deg,var(--gold),var(--gold2))',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
        }}>Berlin Cars Showroom</div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <span style={{color:'var(--muted)',fontSize:13}}>📍 Qatar</span>
          <a href="/admin" style={{
            background:'var(--gold)',color:'#000',
            padding:'7px 16px',borderRadius:6,
            fontSize:13,fontWeight:700
          }}>Admin</a>
        </div>
      </header>

      {/* HERO */}
      <section style={{
        padding:'60px 24px 40px',
        background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.08) 0%, transparent 70%)',
        textAlign:'center'
      }}>
        <div style={{
          display:'inline-block',
          background:'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.3)',
          color:'var(--gold)',fontSize:11,letterSpacing:2,textTransform:'uppercase',
          padding:'5px 14px',borderRadius:20,marginBottom:16
        }}>Qatar's Premium Car Marketplace</div>
        <h1 style={{
          fontFamily:'Bebas Neue',
          fontSize:'clamp(48px,10vw,90px)',
          lineHeight:.95,letterSpacing:2,marginBottom:16
        }}>
          Find Your <span style={{
            background:'linear-gradient(135deg,var(--gold),var(--gold2))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
          }}>Dream Car</span>
        </h1>
        <p style={{color:'var(--muted)',fontSize:16,maxWidth:500,margin:'0 auto 32px'}}>
          Handpicked vehicles, verified details, transparent pricing. Your next car is right here.
        </p>
        <div style={{display:'flex',gap:40,justifyContent:'center'}}>
          {[
            [cars.length,'Listings'],
            [makes.length,'Makes'],
            ['100%','Verified']
          ].map(([num,label]) => (
            <div key={label} style={{textAlign:'center'}}>
              <div style={{
                fontFamily:'Bebas Neue',fontSize:36,
                background:'linear-gradient(135deg,var(--gold),var(--gold2))',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
              }}>{num}</div>
              <div style={{fontSize:11,color:'var(--muted)',letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FILTERS */}
      <div style={{
        background:'var(--bg2)',
        borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',
        padding:'14px 24px',display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'
      }}>
        <input
          className="input" placeholder="🔍 Search make, model, color..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{minWidth:220,flex:1}}
        />
        <select className="input" value={makeFilter} onChange={e=>setMakeFilter(e.target.value)} style={{width:'auto'}}>
          <option value="">All Makes</option>
          {makes.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="input" value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{width:'auto'}}>
          <option value="">Any Year</option>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
        <select className="input" value={priceFilter} onChange={e=>setPriceFilter(e.target.value)} style={{width:'auto'}}>
          <option value="">Any Price</option>
          <option value="0-50000">Under QAR 50K</option>
          <option value="50000-100000">QAR 50K–100K</option>
          <option value="100000-200000">QAR 100K–200K</option>
          <option value="200000-999999">Above QAR 200K</option>
        </select>
        <button className="btn-outline" onClick={()=>{setSearch('');setMakeFilter('');setYearFilter('');setPriceFilter('')}}>Reset</button>
        <span style={{color:'var(--muted)',fontSize:13,whiteSpace:'nowrap'}}>{filtered.length} cars</span>
      </div>

      {/* GRID */}
      <main style={{maxWidth:1300,margin:'0 auto',padding:'32px 24px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:80,color:'var(--muted)'}}>
            <div style={{fontSize:40,marginBottom:12}}>⏳</div>Loading listings...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:80,color:'var(--muted)'}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>No cars match your search
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',
            gap:24
          }}>
            {filtered.map(car => {
              const cover = coverPhoto(car)
              return (
                <div key={car.id}
                  onClick={() => openCar(car)}
                  style={{
                    background:'var(--card)',border:'1px solid var(--border)',
                    borderRadius:'var(--radius)',overflow:'hidden',cursor:'pointer',
                    transition:'transform .25s,border-color .25s,box-shadow .25s',
                  }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-5px)'
                    e.currentTarget.style.borderColor='var(--gold)'
                    e.currentTarget.style.boxShadow='0 16px 48px rgba(201,168,76,.12)'
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform=''
                    e.currentTarget.style.borderColor='var(--border)'
                    e.currentTarget.style.boxShadow=''
                  }}
                >
                  {/* Image */}
                  <div style={{position:'relative',height:200,background:'var(--bg3)',overflow:'hidden'}}>
                    {cover ? (
                      <img src={cover} alt={`${car.make} ${car.model}`}
                        style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s'}}
                        onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                        onMouseLeave={e=>e.target.style.transform=''}
                      />
                    ) : (
                      <div style={{
                        width:'100%',height:'100%',display:'flex',
                        alignItems:'center',justifyContent:'center',
                        fontSize:72,opacity:.2
                      }}>🚗</div>
                    )}
                    {car.badge === 'new' && (
                      <div style={{
                        position:'absolute',top:10,left:10,
                        background:'var(--gold)',color:'#000',
                        fontSize:10,fontWeight:700,letterSpacing:1,
                        padding:'3px 9px',borderRadius:4,textTransform:'uppercase'
                      }}>New</div>
                    )}
                    {car.is_sold && (
                      <div style={{
                        position:'absolute',inset:0,
                        background:'rgba(0,0,0,.6)',display:'flex',
                        alignItems:'center',justifyContent:'center',
                        fontSize:24,fontWeight:700,color:'var(--red)',letterSpacing:3
                      }}>SOLD</div>
                    )}
                    <div style={{
                      position:'absolute',bottom:10,right:10,
                      background:'rgba(0,0,0,.7)',backdropFilter:'blur(6px)',
                      color:'var(--white)',fontSize:11,fontWeight:600,
                      padding:'3px 9px',borderRadius:20
                    }}>📷 {car.car_photos?.length || 0}</div>
                  </div>

                  {/* Body */}
                  <div style={{padding:'16px'}}>
                    <div style={{fontFamily:'Bebas Neue',fontSize:22,letterSpacing:1,marginBottom:4}}>
                      <span style={{color:'var(--gold)'}}>{car.make}</span> {car.model}
                    </div>
                    <div style={{fontSize:20,fontWeight:700,color:'var(--gold2)',marginBottom:14}}>
                      {fmt(car.price)} QAR <span style={{fontSize:12,color:'var(--muted)',fontWeight:400}}>Negotiable</span>
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                      {[
                        ['Year',car.year],
                        ['KM',fmt(car.km)+' km'],
                        ['Fuel',car.fuel],
                        ['Gearbox',car.transmission?.slice(0,4)]
                      ].map(([label,val]) => (
                        <div key={label} style={{background:'var(--bg3)',borderRadius:6,padding:'7px 10px'}}>
                          <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:.8,marginBottom:2}}>{label}</div>
                          <div style={{fontSize:13,fontWeight:600}}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {car.tags?.length > 0 && (
                      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                        {car.tags.map(t => (
                          <span key={t} style={{
                            background:'rgba(201,168,76,.08)',border:'1px solid rgba(201,168,76,.2)',
                            color:'var(--gold)',fontSize:11,padding:'2px 9px',borderRadius:20
                          }}>{t}</span>
                        ))}
                      </div>
                    )}

                    <div style={{
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      borderTop:'1px solid var(--border)',paddingTop:12
                    }}>
                      <span style={{color:'var(--muted)',fontSize:12}}>📍 {car.location}</span>
                      <span style={{
                        border:'1px solid var(--gold)',color:'var(--gold)',
                        padding:'5px 14px',borderRadius:6,fontSize:12,fontWeight:600
                      }}>View Details</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        background:'var(--bg2)',borderTop:'1px solid var(--border)',
        padding:40,textAlign:'center',color:'var(--muted)',fontSize:13,marginTop:60
      }}>
        <div style={{
          fontFamily:'Bebas Neue',fontSize:28,letterSpacing:4,
          background:'linear-gradient(135deg,var(--gold),var(--gold2))',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          marginBottom:8
        }}>Berlin Cars Showroom</div>
        <p>© {new Date().getFullYear()} Berlin Cars Showroom — Qatar. All rights reserved.</p>
      </footer>

      {/* MODAL */}
      {selectedCar && (
        <div onClick={closeModal} style={{
          position:'fixed',inset:0,zIndex:1000,
          background:'rgba(0,0,0,.88)',backdropFilter:'blur(8px)',
          display:'flex',alignItems:'center',justifyContent:'center',
          padding:20,overflowY:'auto'
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'var(--card)',border:'1px solid var(--border)',
            borderRadius:16,maxWidth:900,width:'100%',
            maxHeight:'90vh',overflowY:'auto',position:'relative'
          }}>
            {/* Close */}
            <div style={{position:'sticky',top:0,background:'var(--card)',zIndex:10,display:'flex',justifyContent:'flex-end',padding:'14px 18px 0'}}>
              <button onClick={closeModal} style={{
                background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--white)',
                width:36,height:36,borderRadius:'50%',cursor:'pointer',fontSize:18,
                display:'flex',alignItems:'center',justifyContent:'center'
              }}>✕</button>
            </div>

            {/* Gallery */}
            <div style={{padding:'0 24px 12px'}}>
              <div style={{
                width:'100%',height:360,borderRadius:10,overflow:'hidden',
                background:'var(--bg3)',position:'relative',marginBottom:10
              }}>
                {photos.length > 0 ? (
                  <img src={photos[photoIdx]?.url} alt="car"
                    style={{width:'100%',height:'100%',objectFit:'cover'}} />
                ) : (
                  <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:80,opacity:.2}}>🚗</div>
                )}
                {photos.length > 1 && (
                  <div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',display:'flex',justifyContent:'space-between',width:'100%',padding:'0 12px',pointerEvents:'none'}}>
                    {['‹','›'].map((arrow, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i===0
                        ? (photoIdx-1+photos.length)%photos.length
                        : (photoIdx+1)%photos.length
                      )} style={{
                        pointerEvents:'all',background:'rgba(0,0,0,.6)',border:'none',
                        color:'var(--white)',width:40,height:40,borderRadius:'50%',
                        cursor:'pointer',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center'
                      }}>{arrow}</button>
                    ))}
                  </div>
                )}
                <div style={{
                  position:'absolute',bottom:10,right:10,
                  background:'rgba(0,0,0,.6)',color:'var(--white)',
                  fontSize:12,padding:'3px 10px',borderRadius:20
                }}>{photos.length > 0 ? `${photoIdx+1} / ${photos.length}` : '0 photos'}</div>
              </div>

              {/* Thumbs */}
              {photos.length > 1 && (
                <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
                  {photos.map((p,i) => (
                    <div key={p.id} onClick={()=>setPhotoIdx(i)} style={{
                      flexShrink:0,width:88,height:64,borderRadius:6,overflow:'hidden',
                      border:`2px solid ${i===photoIdx?'var(--gold)':'transparent'}`,
                      cursor:'pointer',opacity:i===photoIdx?1:.6,transition:'all .2s'
                    }}>
                      <img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{padding:'16px 24px 28px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontFamily:'Bebas Neue',fontSize:34,letterSpacing:1,lineHeight:1}}>
                    <span style={{color:'var(--gold)'}}>{selectedCar.make}</span> {selectedCar.model}
                  </div>
                  <div style={{color:'var(--muted)',fontSize:13,marginTop:4}}>
                    {selectedCar.color} · {selectedCar.condition} · {selectedCar.location}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:28,fontWeight:700,color:'var(--gold2)'}}>{fmt(selectedCar.price)} QAR</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>Negotiable</div>
                </div>
              </div>

              {/* Specs */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
                {[
                  ['📅','Year',selectedCar.year],
                  ['🛣️','Mileage',fmt(selectedCar.km)+' km'],
                  ['⛽','Fuel',selectedCar.fuel],
                  ['⚙️','Gearbox',selectedCar.transmission],
                  ['🎨','Color',selectedCar.color],
                  ['👥','Seats',selectedCar.seats],
                  ['📍','Location',selectedCar.location],
                  ['🔖','Condition',selectedCar.condition],
                ].map(([icon,label,val]) => (
                  <div key={label} style={{
                    background:'var(--bg3)',border:'1px solid var(--border)',
                    borderRadius:10,padding:'12px',textAlign:'center'
                  }}>
                    <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
                    <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{val}</div>
                    <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:.8}}>{label}</div>
                  </div>
                ))}
              </div>

              {selectedCar.description && (
                <p style={{color:'var(--muted)',lineHeight:1.7,fontSize:15,marginBottom:20}}>{selectedCar.description}</p>
              )}

              {selectedCar.features?.length > 0 && (
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:12,color:'var(--muted)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Features & Options</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    {selectedCar.features.map(f => (
                      <span key={f} style={{
                        background:'var(--bg3)',border:'1px solid var(--border)',
                        color:'var(--white)',fontSize:12,padding:'4px 12px',borderRadius:20
                      }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {selectedCar.phone && (
                  <a href={`tel:${selectedCar.phone}`} className="btn-gold" style={{flex:1,justifyContent:'center'}}>
                    📞 Call Seller
                  </a>
                )}
                {selectedCar.whatsapp && (
                  <a href={`https://wa.me/${selectedCar.whatsapp.replace(/\D/g,'')}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      flex:1,background:'#25D366',color:'#fff',border:'none',
                      cursor:'pointer',padding:'10px 22px',borderRadius:8,
                      fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:6
                    }}>
                    💬 WhatsApp
                  </a>
                )}
                {!selectedCar.phone && !selectedCar.whatsapp && (
                  <div className="btn-gold" style={{flex:1,justifyContent:'center',opacity:.7}}>
                    📞 Contact Showroom
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
