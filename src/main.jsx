import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import{configured,supabase}from'./supabase';import'./style.css';

const sections=[
['Visão Geral','dashboard'],['Negócios','businesses'],['Clientes / CRM','contacts'],['Financeiro','financial_entries'],['Investimentos','investments'],['Vendas','sales'],['Produtos e Serviços','products_services'],['Mensalidades','subscriptions'],['Cobranças','collections'],['Campanhas','campaigns'],['Grupos de Envio','contact_groups'],['Remetentes','sender_profiles'],['Modelos de Mensagem','message_templates'],['Tarefas','tasks'],['Agenda','appointments'],['Projetos','projects'],['Metas','goals'],['Ideias','idea_board'],['Estoque','inventory'],['Fornecedores','suppliers'],['Dívidas','debts'],['Finanças Pessoais','personal_finance_entries'],['Notas','notes'],['Links','saved_links'],['Relatórios','reports'],['Configurações','settings']];
const labels={businesses:'Negócios',contacts:'Clientes',financial_entries:'Financeiro',investments:'Investimentos',sales:'Vendas',products_services:'Produtos e Serviços',subscriptions:'Mensalidades',campaigns:'Campanhas',contact_groups:'Grupos de Envio',sender_profiles:'Remetentes',message_templates:'Modelos',tasks:'Tarefas',appointments:'Agenda',projects:'Projetos',goals:'Metas',idea_board:'Ideias',inventory:'Estoque',suppliers:'Fornecedores',debts:'Dívidas',personal_finance_entries:'Finanças Pessoais',notes:'Notas',saved_links:'Links'};
const fields={
businesses:[['name','Nome'],['description','Descrição'],['status','Status']],
contacts:[['name','Nome'],['company','Empresa'],['email','E-mail'],['whatsapp','WhatsApp'],['phone','Telefone'],['notes','Observações']],
financial_entries:[['description','Descrição'],['category','Categoria'],['amount','Valor','number'],['direction','Tipo (income/expense)'],['due_date','Vencimento','date']],
investments:[['name','Investimento'],['category','Categoria'],['amount','Valor','number'],['supplier_person','Fornecedor/Pessoa'],['invested_at','Data','date'],['notes','Observações']],
products_services:[['name','Nome'],['kind','Tipo'],['category','Categoria'],['price','Preço','number'],['cost','Custo','number']],
tasks:[['title','Tarefa'],['description','Descrição'],['priority','Prioridade'],['due_at','Prazo','datetime-local']],
goals:[['name','Meta'],['metric','Métrica'],['target','Objetivo','number'],['current_value','Atual','number'],['deadline','Prazo','date']],
projects:[['name','Projeto'],['objective','Objetivo'],['status','Status'],['progress','Progresso %','number']],
suppliers:[['name','Nome'],['company','Empresa'],['whatsapp','WhatsApp'],['email','E-mail'],['supplies','Fornece']],
debts:[['creditor','Credor'],['total_amount','Total','number'],['paid_amount','Pago','number'],['next_due_date','Próximo vencimento','date']],
notes:[['title','Título'],['body','Anotação']],
saved_links:[['title','Título'],['url','Link'],['category','Categoria']],
idea_board:[['title','Ideia'],['description','Descrição'],['category','Categoria'],['priority','Prioridade']],
appointments:[['title','Compromisso'],['description','Descrição'],['starts_at','Início','datetime-local'],['ends_at','Fim','datetime-local']],
personal_finance_entries:[['description','Descrição'],['category','Categoria'],['amount','Valor','number'],['direction','Tipo (income/expense)'],['due_date','Vencimento','date']],
contact_groups:[['name','Nome do grupo'],['description','Descrição'],['channel','Canal (email/whatsapp)']],
message_templates:[['name','Nome'],['channel','Canal (email/whatsapp)'],['subject','Assunto'],['body','Mensagem']],
sender_profiles:[['name','Nome'],['channel','Canal (email/whatsapp)'],['from_name','Nome do remetente'],['email_address','E-mail'],['whatsapp_phone_number_id','ID do número WhatsApp']],
inventory:[['item_name','Item'],['quantity','Quantidade','number'],['minimum_quantity','Estoque mínimo','number'],['unit_cost','Custo unitário','number']],
subscriptions:[['amount','Valor','number'],['billing_day','Dia cobrança','number'],['next_due_date','Próxima cobrança','date'],['status','Status']]
};

function Login(){const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[msg,setMsg]=useState('');async function go(e){e.preventDefault();setMsg('Entrando...');const{error}=await supabase.auth.signInWithPassword({email,password});setMsg(error?error.message:'');}return <div className="login"><form className="panel" onSubmit={go}><h1>Meu Painel de Gestão</h1><p className="muted">Acesso privado à sua central de negócios.</p><div className="field"><label>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="field"><label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div><button className="btn">Entrar</button>{msg&&<p className="muted">{msg}</p>}</form></div>}

function Generic({table}) {
  const [data,setData]=useState([]);
  const [businesses,setBusinesses]=useState([]);
  const [contacts,setContacts]=useState([]);
  const [products,setProducts]=useState([]);
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({});
  const [msg,setMsg]=useState('');
  const fs=fields[table]||[];

  async function load(){
    const {data,error}=await supabase.from(table).select('*').order('created_at',{ascending:false}).limit(100);
    if(!error)setData(data||[]);
  }
  useEffect(()=>{load()},[table]);
  useEffect(()=>{(async()=>{
    const [b,c,p]=await Promise.all([
      supabase.from('businesses').select('id,name').order('name'),
      supabase.from('contacts').select('id,name').order('name'),
      supabase.from('products_services').select('id,name,business_id').order('name')
    ]);
    setBusinesses(b.data||[]); setContacts(c.data||[]); setProducts(p.data||[]);
  })()},[table]);

  async function save(e){
    e.preventDefault();
    const payload={...form};
    if(['products_services','investments','inventory','sales','subscriptions'].includes(table) && !payload.business_id){setMsg('Selecione o Negócio / Empresa.');return;}
    if(table==='subscriptions' && !payload.contact_id){setMsg('Selecione o Cliente.');return;}
    for(const f of fs){
      if(f[2]==='number' && payload[f[0]]!=='') payload[f[0]]=Number(payload[f[0]]);
    }
    const {error}=await supabase.from(table).insert(payload);
    if(error){setMsg(error.message);return;}
    setOpen(false); setForm({}); setMsg(''); load();
  }

  return <>
    <div className="sectiontitle">
      <div><h2>{labels[table]||table}</h2><p className="muted">Cadastre, acompanhe e organize tudo em um só lugar.</p></div>
      {fs.length>0 && <button className="btn" onClick={()=>setOpen(true)}>+ Novo</button>}
    </div>
    <div className="panel">
      {data.length ? <table className="table"><thead><tr>{fs.slice(0,5).map(f=><th key={f[0]}>{f[1]}</th>)}</tr></thead>
      <tbody>{data.map((r,i)=><tr key={r.id||i}>{fs.slice(0,5).map(f=><td key={f[0]}>{String(r[f[0]]??'—')}</td>)}</tr>)}</tbody></table>
      : <div className="empty">Nenhum registro ainda.</div>}
    </div>
    {open && <div className="modalbg"><form className="modal" onSubmit={save}>
      <h3>Novo — {labels[table]}</h3>
      {table!=='businesses' && <div className="field"><label>Negócio / Empresa{['products_services','investments','inventory','sales','subscriptions'].includes(table)?' *':''}</label><select required={['products_services','investments','inventory','sales','subscriptions'].includes(table)} value={form.business_id||''} onChange={e=>setForm({...form,business_id:e.target.value})}><option value="">Selecione</option>{businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>}
      {['sales','subscriptions'].includes(table) && <div className="field"><label>Cliente{table==='subscriptions'?' *':''}</label><select required={table==='subscriptions'} value={form.contact_id||''} onChange={e=>setForm({...form,contact_id:e.target.value})}><option value="">Selecione</option>{contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
      {['inventory','subscriptions'].includes(table) && <div className="field"><label>Produto / Serviço</label><select value={form.product_service_id||''} onChange={e=>setForm({...form,product_service_id:e.target.value})}><option value="">Selecione</option>{products.filter(p=>!form.business_id||p.business_id===form.business_id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}
      {fs.map(f=><div className="field" key={f[0]}>
        <label>{f[1]}</label>
        {(f[0]==='body'||f[0]==='description'||f[0]==='notes')
          ? <textarea rows="4" value={form[f[0]]||''} onChange={e=>setForm({...form,[f[0]]:e.target.value})}/>
          : <input type={f[2]||'text'} step={f[2]==='number'?'0.01':undefined} value={form[f[0]]||''} onChange={e=>setForm({...form,[f[0]]:e.target.value})}/>}
      </div>)}
      {msg && <div className="notice danger">{msg}</div>}
      <div className="toolbar"><button className="btn">Salvar</button><button type="button" className="btn alt" onClick={()=>setOpen(false)}>Cancelar</button></div>
    </form></div>}
  </>;
}

function Dashboard(){const[s,setS]=useState({revenue:0,expenses:0,investments:0,result:0}),[counts,setCounts]=useState({}),[verse,setVerse]=useState(null);useEffect(()=>{(async()=>{const{data}=await supabase.from('global_financial_summary').select('*').single();if(data)setS(data);const pairs=await Promise.all(['businesses','contacts','tasks','campaigns'].map(async t=>[t,(await supabase.from(t).select('*',{count:'exact',head:true})).count||0]));setCounts(Object.fromEntries(pairs));const{data:v}=await supabase.from('bible_encouragements').select('*').eq('active',true).limit(1).maybeSingle();setVerse(v)})()},[]);const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});return <><h2>Visão Geral</h2><p className="muted">Sua central para acompanhar todos os negócios.</p><div className="cards"><div className="card">Receitas<b>{money(s.revenue)}</b></div><div className="card">Despesas<b>{money(s.expenses)}</b></div><div className="card">Investimentos<b>{money(s.investments)}</b></div><div className="card">Resultado<b>{money(s.result)}</b></div></div><div className="grid2"><div className="panel"><h3>Resumo operacional</h3><p>Negócios: <b>{counts.businesses||0}</b></p><p>Clientes: <b>{counts.contacts||0}</b></p><p>Tarefas: <b>{counts.tasks||0}</b></p><p>Campanhas: <b>{counts.campaigns||0}</b></p></div><div className="panel verse"><h3>Propósito e constância</h3>{verse?<><b>{verse.reference}</b><p>{verse.passage}</p><small className="muted">{verse.context}</small></>:<p className="muted">Ao alcançar uma meta, o sistema poderá apresentar uma mensagem e um texto bíblico com contexto.</p>}</div></div></>}

function Campaigns(){const[camps,setCamps]=useState([]),[groups,setGroups]=useState([]),[senders,setSenders]=useState([]),[open,setOpen]=useState(false),[f,setF]=useState({channel:'email',name:'',group_id:'',sender_profile_id:'',body:''}),[msg,setMsg]=useState('');async function load(){const[a,b,c]=await Promise.all([supabase.from('campaigns').select('*').order('created_at',{ascending:false}),supabase.from('contact_groups').select('*'),supabase.from('sender_profiles').select('*')]);setCamps(a.data||[]);setGroups(b.data||[]);setSenders(c.data||[])}useEffect(()=>{load()},[]);async function save(e){e.preventDefault();const{error}=await supabase.from('campaigns').insert(f);if(error)return setMsg(error.message);setOpen(false);load()}async function prepare(id){setMsg('Preparando fila...');const{data,error}=await supabase.functions.invoke('prepare-campaign',{body:{campaign_id:id}});setMsg(error?error.message:`Fila preparada: ${data.queued} destinatário(s).`);load()}return <><div className="sectiontitle"><div><h2>Campanhas</h2><p className="muted">E-mail e WhatsApp, com grupos e remetentes independentes.</p></div><button className="btn" onClick={()=>setOpen(true)}>+ Nova campanha</button></div>{msg&&<div className="notice">{msg}</div>}<div className="panel">{camps.length?<table className="table"><thead><tr><th>Nome</th><th>Canal</th><th>Status</th><th>Destinatários</th><th></th></tr></thead><tbody>{camps.map(c=><tr key={c.id}><td>{c.name}</td><td><span className="pill">{c.channel}</span></td><td>{c.status}</td><td>{c.total_recipients}</td><td><button className="btn alt" onClick={()=>prepare(c.id)}>Preparar fila</button></td></tr>)}</tbody></table>:<div className="empty">Crie sua primeira campanha.</div>}</div>{open&&<div className="modalbg"><form className="modal" onSubmit={save}><h3>Nova campanha</h3><div className="field"><label>Nome</label><input required onChange={e=>setF({...f,name:e.target.value})}/></div><div className="field"><label>Canal</label><select value={f.channel} onChange={e=>setF({...f,channel:e.target.value})}><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option></select></div><div className="field"><label>Grupo</label><select required value={f.group_id} onChange={e=>setF({...f,group_id:e.target.value})}><option value="">Selecione</option>{groups.filter(g=>!g.channel||g.channel===f.channel).map(g=><option value={g.id} key={g.id}>{g.name}</option>)}</select></div><div className="field"><label>Remetente</label><select value={f.sender_profile_id} onChange={e=>setF({...f,sender_profile_id:e.target.value})}><option value="">Selecione</option>{senders.filter(s=>s.channel===f.channel).map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></div>{f.channel==='email'&&<div className="field"><label>Assunto</label><input onChange={e=>setF({...f,subject:e.target.value})}/></div>}<div className="field"><label>Mensagem</label><textarea rows="6" required onChange={e=>setF({...f,body:e.target.value})}/></div><div className="toolbar"><button className="btn">Salvar</button><button type="button" className="btn alt" onClick={()=>setOpen(false)}>Cancelar</button></div></form></div>}</>}

function App(){const[session,setSession]=useState(null),[page,setPage]=useState('dashboard');useEffect(()=>{if(!configured)return;supabase.auth.getSession().then(({data})=>setSession(data.session));const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);if(!configured)return <div className="login"><div className="panel"><h2>Meu Painel de Gestão</h2><div className="notice danger">Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para conectar este painel ao novo Supabase.</div></div></div>;if(!session)return <Login/>;const special=['collections','reports','settings'];return <div className="shell"><aside className="side"><div className="brand">Meu Painel de Gestão<small>CENTRAL DE NEGÓCIOS</small></div><nav className="nav">{sections.map(([n,k])=><button key={k} className={page===k?'on':''} onClick={()=>setPage(k)}>{n}</button>)}</nav></aside><main className="main"><header className="top"><div><h1>{sections.find(x=>x[1]===page)?.[0]}</h1><span className="muted">Organização, clareza e controle.</span></div><button className="btn alt" onClick={()=>supabase.auth.signOut()}>Sair</button></header>{page==='dashboard'?<Dashboard/>:page==='campaigns'?<Campaigns/>:special.includes(page)?<div className="panel"><h2>{sections.find(x=>x[1]===page)?.[0]}</h2><p className="muted">Esta área consolida os dados das demais áreas e será alimentada automaticamente conforme você usar o sistema.</p></div>:<Generic table={page}/>}</main></div>}
createRoot(document.getElementById('root')).render(<App/>);