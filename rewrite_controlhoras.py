import re

with open('src/pages/ControlHoras/ControlHoras.jsx', 'r') as f:
    content = f.read()

# 1. State changes
state_old = """  const [selectedPromotor, setSelectedPromotor] = useState(user.role === 'promotor' ? user.name : null);
  const [busqueda, setBusqueda] = useState(''); // Por si quieren buscar entre los botones
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());"""

state_new = """  const [selectedPromotors, setSelectedPromotors] = useState(user.role === 'promotor' ? [user.name] : []);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [filtroCentro, setFiltroCentro] = useState('todos');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());"""

content = content.replace(state_old, state_new)

# 2. Fix the initial team auto-select (we don't need to auto-select because empty array = select all visible)
auto_select_old = """          // Auto-seleccionar el primero si no hay ninguno
          if (myTeam.length > 0 && !selectedPromotor) {
            setSelectedPromotor(myTeam[0].name);
          }"""
content = content.replace(auto_select_old, "          // Por defecto, sin promotores seleccionados (Visión Global)")

# 3. Modify filtered arrays and add debounce to fetch
fetch_old = """  // 2. Fetch Control Horas
  useEffect(() => {
    const fetchHours = async () => {
      if (!GAS_URL || !selectedPromotor) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          // Mandamos `names` como array de 1 elemento para reusar el nuevo backend, o `name` si el antiguo sigue ahí
          body: JSON.stringify({ action: 'getControlHoras', name: selectedPromotor, names: [selectedPromotor] })
        });
        const data = await res.json();
        
        if (data.success) {
          setSemanasRaw(data.semanas || []);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHours();
  }, [selectedPromotor, GAS_URL]);"""

fetch_new = """  // Variables de filtrado general
  const teamFiltradoPorRegion = filtroRegion === 'todas' ? team : team.filter(u => u.region === filtroRegion);
  const centrosDisponibles = Array.from(new Set(teamFiltradoPorRegion.map(u => u.centro).filter(c => c && c.trim() !== 'Sin asignar'))).sort();
  const teamFiltrado = filtroCentro === 'todos' ? teamFiltradoPorRegion : teamFiltradoPorRegion.filter(u => u.centro === filtroCentro);
  
  const b = busqueda.toLowerCase();
  const filteredTeamBusqueda = teamFiltrado.filter(p => 
    p.name.toLowerCase().includes(b) || (p.centro && p.centro.toLowerCase().includes(b))
  );

  // 2. Fetch Control Horas
  useEffect(() => {
    const fetchHours = async () => {
      if (!GAS_URL) return;
      if (team.length === 0 && user.role !== 'promotor') return; // Esperar a que cargue el equipo
      
      // Si el array selectedPromotors está vacío, significa Visión Global (coge todos los filtrados)
      let namesToFetch = selectedPromotors;
      if (user.role !== 'promotor' && selectedPromotors.length === 0) {
        namesToFetch = teamFiltrado.map(p => p.name);
      }
      
      if (namesToFetch.length === 0) {
        setSemanasRaw([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getControlHoras', names: namesToFetch })
        });
        const data = await res.json();
        
        if (data.success) {
          setSemanasRaw(data.semanas || []);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchHours, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [selectedPromotors, filtroRegion, filtroCentro, team, GAS_URL, user]);"""

content = content.replace(fetch_old, fetch_new)

# 4. Group Semanas after filtering by month
filter_semanas_old = """  // 3. Filtrar semanas automáticamente por el mes seleccionado usando ISO Weeks
  useEffect(() => {
    const monthWeeks = getMonthWeeks(selectedMonth);
    const filtered = semanasRaw.filter(s => {
      const numParsed = parseInt(String(s.num).replace(/\D/g, ''), 10);
      return monthWeeks.includes(numParsed);
    });
    setSemanas(filtered);
  }, [semanasRaw, selectedMonth]);"""

filter_semanas_new = """  // 3. Filtrar semanas automáticamente por el mes seleccionado y agruparlas
  useEffect(() => {
    const monthWeeks = getMonthWeeks(selectedMonth);
    const filtered = semanasRaw.filter(s => {
      const numParsed = parseInt(String(s.num).replace(/\\D/g, ''), 10);
      return monthWeeks.includes(numParsed);
    });
    
    // Agrupación de semanas (Sumar horas planificadas y cobertura)
    const agrupadas = filtered.reduce((acc, curr) => {
      const key = curr.num;
      if (!acc[key]) {
        acc[key] = { ...curr, planificadas: 0, cobertura: 0 };
      }
      acc[key].planificadas += curr.planificadas;
      acc[key].cobertura += curr.cobertura;
      return acc;
    }, {});
    
    // Convertir de nuevo a array y ordenar
    const arrayAgrupado = Object.values(agrupadas).sort((a, b) => {
      const numA = parseInt(String(a.num).replace(/\\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.num).replace(/\\D/g, ''), 10) || 0;
      return numA - numB;
    });
    
    setSemanas(arrayAgrupado);
  }, [semanasRaw, selectedMonth]);"""

content = content.replace(filter_semanas_old, filter_semanas_new)

# 5. Remove old filtered variables declaration (moved to top)
old_filtered_decl = """  const b = busqueda.toLowerCase();
  
  const teamFiltradoPorRegion = filtroRegion === 'todas' ? team : team.filter(u => u.region === filtroRegion);
  const regionesDisponibles = Array.from(new Set(team.map(u => u.region).filter(r => r && r.trim() !== ''))).sort();
  
  const filteredTeam = teamFiltradoPorRegion.filter(p => 
    p.name.toLowerCase().includes(b) || (p.centro && p.centro.toLowerCase().includes(b))
  );"""

content = content.replace(old_filtered_decl, "  const regionesDisponibles = Array.from(new Set(team.map(u => u.region).filter(r => r && r.trim() !== ''))).sort();")

# 6. Replace UI for filtering (Promotores section)
ui_promotor_old = """      {/* Lista vertical de Promotores (Solo Managers) */}
      {user.role !== 'promotor' && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div className={styles.promotorHeader} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light-primary)', margin: 0 }}>Promotor</h3>
            {(user.role === 'administradora' || user.role === 'coordinadora') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.35rem 0.6rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <MapPin size={14} color="var(--accent-primary)" />
                <select 
                  value={filtroRegion} 
                  onChange={e => setFiltroRegion(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', width: '100%' }}
                >
                  <option value="todas" style={{ background: '#1a1a1a', color: '#ffffff' }}>Todas las regiones</option>
                  {regionesDisponibles.map(r => (
                    <option key={r} value={r} style={{ background: '#1a1a1a', color: '#ffffff' }}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={styles.promotorSearch} style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-light-primary)', padding: '0.35rem 0.5rem 0.35rem 1.8rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.8rem', outline: 'none' }}
                type="text"
                placeholder="Buscar promotor/centro..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredTeam.map((p) => {
              const isSelected = selectedPromotor === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPromotor(p.name)}
                  className={styles.promotorBtn}
                  style={{
                    background: isSelected ? 'rgba(255,103,0,0.1)' : 'var(--bg-tertiary)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  }}
                  onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)' }}
                >
                  <span className={styles.promotorName} style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? 'var(--accent-primary)' : 'var(--text-light-primary)' }}>
                    <User size={14} /> {p.name}
                  </span>
                  <span className={styles.promotorCenter}>
                    <MapPin size={12} /> {p.centro || 'Sin asignar'}
                  </span>
                </button>
              );
            })}
            {filteredTeam.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>No se encontraron promotores.</p>
            )}
          </div>
        </div>
      )}"""

ui_promotor_new = """      {/* Sección de Selección de Promotores (Solo Managers) */}
      {user.role !== 'promotor' && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--accent-primary)" />
              Selección de Equipo
            </h3>
            
            <button 
              onClick={() => { setSelectedPromotors([]); setFiltroCentro('todos'); setBusqueda(''); }}
              style={{
                background: selectedPromotors.length === 0 ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-tertiary)',
                color: selectedPromotors.length === 0 ? 'var(--success)' : 'var(--text-secondary)',
                border: selectedPromotors.length === 0 ? '1px solid var(--success)' : '1px solid var(--border-color)',
                padding: '0.4rem 1rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {selectedPromotors.length === 0 ? '✓ Visión Global Activa' : 'Limpiar Selección (Ver Todos)'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            {(user.role === 'administradora' || user.role === 'coordinadora') && (
              <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <MapPin size={16} color="var(--accent-primary)" />
                <select 
                  value={filtroRegion} 
                  onChange={e => { setFiltroRegion(e.target.value); setFiltroCentro('todos'); setSelectedPromotors([]); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', width: '100%' }}
                >
                  <option value="todas" style={{ background: '#1a1a1a', color: '#ffffff' }}>Todas las regiones</option>
                  {regionesDisponibles.map(r => (
                    <option key={r} value={r} style={{ background: '#1a1a1a', color: '#ffffff' }}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
              <MapPin size={16} color="var(--info)" />
              <select 
                value={filtroCentro} 
                onChange={e => { setFiltroCentro(e.target.value); setSelectedPromotors([]); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', width: '100%' }}
              >
                <option value="todos" style={{ background: '#1a1a1a', color: '#ffffff' }}>Todos los centros</option>
                {centrosDisponibles.map(c => (
                  <option key={c} value={c} style={{ background: '#1a1a1a', color: '#ffffff' }}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-light-primary)', padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem', outline: 'none' }}
                type="text"
                placeholder="Buscar promotor..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          
          {/* Grilla de Checkboxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredTeamBusqueda.map((p) => {
              const isChecked = selectedPromotors.includes(p.name);
              return (
                <label
                  key={p.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
                    background: isChecked ? 'rgba(255,103,0,0.1)' : 'var(--bg-tertiary)',
                    border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)', cursor: 'pointer', transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => { if(!isChecked) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={(e) => { if(!isChecked) e.currentTarget.style.borderColor = 'var(--border-color)' }}
                >
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPromotors([...selectedPromotors, p.name]);
                      } else {
                        setSelectedPromotors(selectedPromotors.filter(name => name !== p.name));
                      }
                    }}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontWeight: isChecked ? '600' : '500', color: isChecked ? 'var(--accent-primary)' : 'var(--text-light-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.centro || 'Sin asignar'}
                    </span>
                  </div>
                </label>
              );
            })}
            {filteredTeamBusqueda.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', gridColumn: '1 / -1', textAlign: 'center', padding: '1rem' }}>No se encontraron promotores.</p>
            )}
          </div>
        </div>
      )}"""

content = content.replace(ui_promotor_old, ui_promotor_new)

with open('src/pages/ControlHoras/ControlHoras.jsx', 'w') as f:
    f.write(content)

