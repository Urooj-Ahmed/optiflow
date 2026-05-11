import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/* ════════════════════════════════════════════════════════════
   THEME
════════════════════════════════════════════════════════════ */
const T="#0D5E48", T2="#1A8C6A", TL="#E4F5EF", TLL="#F2FAF7";
const ALL_ROLES=["Admin","Doctor","Salesman","Glass Operator","Fitter","Delivery"];
const RM={
  "Admin":          {icon:"⚙️",color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE"},
  "Doctor":         {icon:"👁️",color:"#0284C7",bg:"#F0F9FF",border:"#BAE6FD"},
  "Salesman":       {icon:"🛍️",color:"#0D5E48",bg:"#E4F5EF",border:"#6EE7C7"},
  "Glass Operator": {icon:"🔭",color:"#B45309",bg:"#FFFBEB",border:"#FDE68A"},
  "Fitter":         {icon:"🔧",color:"#DC2626",bg:"#FEF2F2",border:"#FECACA"},
  "Delivery":       {icon:"🚚",color:"#6D28D9",bg:"#F5F3FF",border:"#DDD6FE"},
};
const STATUSES=["Order Created","Glass Ordered","Glass Arrived","Processing","Completed","Delivered"];
const SS={
  "Order Created":{c:"#4338CA",bg:"#EEF2FF",dot:"#818CF8"},
  "Glass Ordered":{c:"#B45309",bg:"#FFFBEB",dot:"#F59E0B"},
  "Glass Arrived":{c:"#0F766E",bg:"#F0FDFA",dot:"#2DD4BF"},
  "Processing":   {c:"#0369A1",bg:"#E0F2FE",dot:"#38BDF8"},
  "Completed":    {c:"#15803D",bg:"#F0FDF4",dot:"#4ADE80"},
  "Delivered":    {c:"#0D5E48",bg:"#E4F5EF",dot:"#1A8C6A"},
};
const GLASS_TYPES=["Blue Block","Progressive","Single Vision","Anti-glare","Photochromic","Bifocal","Tinted","UV Protection","High Index","Polarized"];
const VENDORS=["VisionCare Optics","ClearView Labs","PrimeLens Co","OptikPro","LensWorld"];
const FITTERS=["Ramesh K.","Suresh P.","Anjali M.","Vikram S."];

/* ════════════════════════════════════════════════════════════
   ADVANCED OPTICAL OPTIONS
════════════════════════════════════════════════════════════ */
const TINT_SOLIDS=[
  {id:"blue",     label:"Blue",     hex:"#3B82F6"},
  {id:"grey",     label:"Grey",     hex:"#6B7280"},
  {id:"brown",    label:"Brown",    hex:"#92400E"},
  {id:"green",    label:"Green",    hex:"#16A34A"},
  {id:"yellow",   label:"Yellow",   hex:"#CA8A04"},
  {id:"rose",     label:"Rose",     hex:"#E11D48"},
  {id:"orange",   label:"Orange",   hex:"#EA580C"},
  {id:"purple",   label:"Purple",   hex:"#7C3AED"},
  {id:"pink",     label:"Pink",     hex:"#DB2777"},
];
const TINT_GRADIENTS=[
  {id:"g_blue",   label:"Gradient Blue",  from:"#93C5FD",to:"#1D4ED8"},
  {id:"g_brown",  label:"Gradient Brown", from:"#D97706",to:"#78350F"},
  {id:"g_green",  label:"Gradient Green", from:"#86EFAC",to:"#14532D"},
  {id:"g_grey",   label:"Gradient Grey",  from:"#D1D5DB",to:"#374151"},
  {id:"g_rose",   label:"Gradient Rose",  from:"#FDA4AF",to:"#9F1239"},
  {id:"g_purple", label:"Gradient Purple",from:"#C4B5FD",to:"#4C1D95"},
];
const MIRROR_COATINGS=[
  {id:"m_silver",label:"Mirror Silver",hex:"#C0C0C0"},
  {id:"m_gold",  label:"Mirror Gold",  hex:"#D4A017"},
  {id:"m_blue",  label:"Mirror Blue",  hex:"#1E40AF"},
  {id:"m_pink",  label:"Mirror Pink",  hex:"#BE185D"},
  {id:"m_green", label:"Mirror Green", hex:"#15803D"},
  {id:"m_red",   label:"Mirror Red",   hex:"#B91C1C"},
];
const SURFACE_COATINGS=["Premium AR","Standard AR","Anti-Scratch","Anti-Fog","Easy-Clean","Blue Cut","UV420 Block"];
const EDGE_TREATMENTS=["Standard","Polish","Matt","Beveled","Grooved","Step Bevel"];
const FRAME_TYPES=["Full Rim","Semi-Rimless","Rimless","Drill Mount","Nylor"];
const FITTING_TYPES=["Normal","Fashion","Sports","Safety","Reading"];

/* ════════════════════════════════════════════════════════════
   PERMISSIONS
════════════════════════════════════════════════════════════ */
const PERMS={
  dashboard:["Admin"],
  checkups:["Admin","Doctor","Salesman"],
  addCheckup:["Admin","Doctor"],
  editCheckup:["Admin","Doctor"],
  deleteCheckup:["Admin"],
  orders:["Admin","Salesman","Glass Operator","Fitter","Delivery"],
  addOrder:["Admin","Salesman"],
  editOrder:["Admin","Salesman"],
  deleteOrder:["Admin"],
  pipeline:["Admin","Salesman","Glass Operator","Fitter","Delivery"],
  glassAction:["Admin","Glass Operator"],
  fitterAction:["Admin","Fitter"],
  deliveryAction:["Admin","Delivery"],
  reports:["Admin"],
  manageUsers:["Admin"],
};
const can=(roles,p)=>(Array.isArray(roles)?roles:[roles]).some(r=>(PERMS[p]||[]).includes(r));

/* ════════════════════════════════════════════════════════════
   SEED DATA
════════════════════════════════════════════════════════════ */
const emptyEye=()=>({sph:"",cyl:"",axis:"",add:""});
const emptyAdvanced=()=>({
  tintType:"none", tintSolid:"", tintGradient:"", mirrorCoating:"",
  tintDensity:"70", coatings:[], edgeTreatment:"Standard",
  frameType:"Full Rim", fittingType:"Normal",
  pdRight:"", pdLeft:"", pdBino:"", segHeight:"", ocHeight:"",
  prismRight:{val:"",base:""}, prismLeft:{val:"",base:""},
  expectedDelivery:"", remarks:""
});
const SEED_USERS=[
  {id:1,name:"Arjun Mehta",     username:"admin",   password:"admin123",roles:["Admin"],               active:true,createdAt:"2026-01-01"},
  {id:2,name:"Dr. Priya Singh", username:"doctor",  password:"doc123",  roles:["Doctor"],              active:true,createdAt:"2026-01-01"},
  {id:3,name:"Rahul Sharma",    username:"rahul",   password:"sales123",roles:["Salesman"],            active:true,createdAt:"2026-01-01"},
  {id:4,name:"Deepa Nair",      username:"deepa",   password:"sales123",roles:["Salesman","Delivery"],active:true,createdAt:"2026-01-01"},
  {id:5,name:"Suresh Optical",  username:"glass",   password:"glass123",roles:["Glass Operator"],     active:true,createdAt:"2026-01-01"},
  {id:6,name:"Anand Fitter",    username:"fitter",  password:"fit123",  roles:["Fitter"],              active:true,createdAt:"2026-01-01"},
  {id:7,name:"Meena Delivery",  username:"delivery",password:"del123",  roles:["Delivery"],            active:true,createdAt:"2026-01-01"},
];
const SEED_CHECKUPS=[
  {id:"EC1",name:"Priya Sharma",phone:"9876543210",re:{sph:"-1.50",cyl:"-0.50",axis:"180",add:""},le:{sph:"-2.00",cyl:"-0.75",axis:"175",add:""},by:"Dr. Priya Singh",date:"2026-05-06",converted:true,  updatedAt:"2026-05-06"},
  {id:"EC2",name:"Amit Verma",  phone:"8765432109",re:{sph:"+0.50",cyl:"",axis:"",add:"+1.00"},  le:{sph:"+0.75",cyl:"",axis:"",add:"+1.00"},  by:"Dr. Priya Singh",date:"2026-05-07",converted:false,updatedAt:"2026-05-07"},
  {id:"EC3",name:"Sunita Rao",  phone:"7654321098",re:{sph:"-3.00",cyl:"-1.00",axis:"90",add:""},le:{sph:"-2.75",cyl:"-0.75",axis:"85",add:""}, by:"Dr. Priya Singh",date:"2026-05-08",converted:false,updatedAt:"2026-05-08"},
];
const SEED_ORDERS=[
  {id:"ORD1",rc:"RC1",name:"Priya Sharma", phone:"9876543210",src:"Internal",cref:"EC1",re:{sph:"-1.50",cyl:"-0.50",axis:"180",add:""},le:{sph:"-2.00",cyl:"-0.75",axis:"175",add:""},glasses:["Blue Block","Single Vision"],adv2:emptyAdvanced(),qty:1,total:3500,adv:1000,rem:2500,pm:"Cash", status:"Glass Arrived",vendor:"VisionCare Optics",fitter:"",         specDate:"",          by:"Rahul Sharma",  date:"2026-05-06",ordDate:"2026-05-06",arrDate:"2026-05-07",framePhoto:null,updatedAt:"2026-05-07"},
  {id:"ORD2",rc:"RC2",name:"Kiran Patel",  phone:"9845671230",src:"External",cref:null, re:{sph:"-0.75",cyl:"",axis:"",add:""},       le:{sph:"-1.00",cyl:"-0.25",axis:"170",add:""},glasses:["Anti-glare","Single Vision"],  adv2:emptyAdvanced(),qty:1,total:2800,adv:800, rem:2000,pm:"UPI", status:"Processing",   vendor:"ClearView Labs",  fitter:"Ramesh K.", specDate:"2026-05-09",by:"Deepa Nair",     date:"2026-05-07",ordDate:"2026-05-07",arrDate:"2026-05-08",framePhoto:null,updatedAt:"2026-05-09"},
  {id:"ORD3",rc:"RC3",name:"Mohan Das",    phone:"9123456789",src:"External",cref:null, re:{sph:"+2.00",cyl:"-1.00",axis:"120",add:"+1.50"},le:{sph:"+2.25",cyl:"-0.75",axis:"115",add:"+1.50"},glasses:["Progressive"],       adv2:{...emptyAdvanced(),tintType:"solid",tintSolid:"brown",coatings:["Premium AR"],edgeTreatment:"Polish",pdBino:"64"},qty:1,total:6500,adv:3000,rem:3500,pm:"Card",status:"Completed",    vendor:"PrimeLens Co",    fitter:"Suresh P.", specDate:"2026-05-08",by:"Rahul Sharma",  date:"2026-05-05",ordDate:"2026-05-05",arrDate:"2026-05-07",framePhoto:null,updatedAt:"2026-05-08"},
  {id:"ORD4",rc:"RC4",name:"Lakshmi Iyer", phone:"8899001122",src:"Internal",cref:null, re:{sph:"-4.50",cyl:"-1.50",axis:"90",add:""},  le:{sph:"-4.00",cyl:"-1.25",axis:"95",add:""},  glasses:["Blue Block","High Index"],  adv2:{...emptyAdvanced(),coatings:["Premium AR","Anti-Scratch"],pdRight:"31",pdLeft:"31"},qty:1,total:8000,adv:8000,rem:0,pm:"UPI",  status:"Delivered",    vendor:"OptikPro",        fitter:"Anjali M.", specDate:"2026-05-03",by:"Deepa Nair",     date:"2026-05-02",ordDate:"2026-05-02",arrDate:"2026-05-04",framePhoto:null,updatedAt:"2026-05-04"},
  {id:"ORD5",rc:"RC5",name:"Vijay Kumar",  phone:"9765432100",src:"External",cref:null, re:{sph:"-1.25",cyl:"",axis:"",add:""},         le:{sph:"-1.50",cyl:"",axis:"",add:""},         glasses:["Single Vision"],            adv2:emptyAdvanced(),qty:1,total:1800,adv:500, rem:1300,pm:"Cash",status:"Order Created",vendor:"",               fitter:"",         specDate:"",          by:"Rahul Sharma",  date:"2026-05-08",ordDate:"",         arrDate:"",          framePhoto:null,updatedAt:"2026-05-08"},
];
const SEED_COUNTERS={uc:7,cc:3,oc:5};

/* ════════════════════════════════════════════════════════════
   SHARED DATABASE  (window.storage with shared=true)
   Acts as a multi-user SQL-like store shared across all devices
════════════════════════════════════════════════════════════ */

const SharedDB = {
  async loadAll() {
    const users = JSON.parse(localStorage.getItem("users")) || SEED_USERS;
    const checkups = JSON.parse(localStorage.getItem("checkups")) || SEED_CHECKUPS;
    const orders = JSON.parse(localStorage.getItem("orders")) || SEED_ORDERS;
    const counters = JSON.parse(localStorage.getItem("counters")) || SEED_COUNTERS;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("checkups", JSON.stringify(checkups));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("counters", JSON.stringify(counters));

    return { users, checkups, orders, counters };
  },

  async save(table, data) {
    localStorage.setItem(table, JSON.stringify(data));
    return true;
  },

  async poll(table) {
    return JSON.parse(localStorage.getItem(table));
  }
};

/* ════════════════════════════════════════════════════════════
   STYLE TOKENS
════════════════════════════════════════════════════════════ */
const lbl={fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"};
const inp={width:"100%",padding:"10px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,color:"#1e293b",outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"white"};
const card={background:"white",borderRadius:16,padding:16,border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
const btn={background:T,color:"white",border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:800,cursor:"pointer"};
const btnSm={border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer"};
const backBtn={background:"none",border:"none",color:T,fontSize:13,fontWeight:700,cursor:"pointer",padding:"0 0 16px",display:"flex",alignItems:"center",gap:5};

/* ════════════════════════════════════════════════════════════
   CONFIRM DIALOG
════════════════════════════════════════════════════════════ */
function ConfirmDialog({title,message,onConfirm,onCancel,danger=false}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{...card,maxWidth:380,width:"100%",padding:26}}>
        <div style={{fontSize:36,marginBottom:12,textAlign:"center"}}>{danger?"🗑️":"⚠️"}</div>
        <h3 style={{margin:"0 0 8px",fontSize:16,fontWeight:900,color:"#0f172a",textAlign:"center"}}>{title}</h3>
        <p style={{margin:"0 0 22px",fontSize:13,color:"#64748b",textAlign:"center",lineHeight:1.6}}>{message}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:11,borderRadius:9,border:"1.5px solid #e2e8f0",background:"white",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:11,borderRadius:9,border:"none",background:danger?"#dc2626":T,color:"white",fontWeight:800,fontSize:13,cursor:"pointer"}}>{danger?"Delete":"Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SQUARE IMAGE CROPPER  (crops any image to 1:1 on canvas)
════════════════════════════════════════════════════════════ */
function cropToSquare(src,size=600){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const side=Math.min(img.width,img.height);
      const sx=(img.width-side)/2, sy=(img.height-side)/2;
      const canvas=document.createElement("canvas");
      canvas.width=size;canvas.height=size;
      canvas.getContext("2d").drawImage(img,sx,sy,side,side,0,0,size,size);
      resolve(canvas.toDataURL("image/jpeg",0.88));
    };
    img.src=src;
  });
}

/* ════════════════════════════════════════════════════════════
   CAMERA CAPTURE — forces square crop
════════════════════════════════════════════════════════════ */
function CameraCapture({onCapture,onClose}){
  const videoRef=useRef(null),canvasRef=useRef(null),streamRef=useRef(null);
  const [phase,setPhase]=useState("starting");
  const [captured,setCaptured]=useState(null);
  const [facing,setFacing]=useState("environment");
  const [errMsg,setErrMsg]=useState("");

  const startCam=useCallback(async(fm)=>{
    setPhase("starting");
    try{
      if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:fm,width:{ideal:1280},height:{ideal:720}},audio:false});
      streamRef.current=s;
      if(videoRef.current){videoRef.current.srcObject=s;await videoRef.current.play();}
      setPhase("live");
    }catch(e){
      setErrMsg(e.name==="NotAllowedError"?"Camera access denied. Enable camera in browser settings.":"Cannot access camera: "+e.message);
      setPhase("error");
    }
  },[]);

  useEffect(()=>{startCam("environment");return()=>{if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());};},[]);

  const capture=async()=>{
    const v=videoRef.current,c=canvasRef.current;if(!v||!c)return;
    const side=Math.min(v.videoWidth||640,v.videoHeight||480);
    c.width=side;c.height=side;
    const ctx=c.getContext("2d");
    const sx=(v.videoWidth-side)/2,sy=(v.videoHeight-side)/2;
    ctx.drawImage(v,sx,sy,side,side,0,0,side,side);
    const raw=c.toDataURL("image/jpeg",0.88);
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    setCaptured(raw);setPhase("preview");
  };

  const flip=()=>{const n=facing==="environment"?"user":"environment";setFacing(n);startCam(n);};

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.94)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px"}}>
        <div>
          <div style={{color:"white",fontWeight:800,fontSize:15}}>📸 Frame Photo</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:2}}>Images are auto-cropped to square</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",borderRadius:"50%",width:36,height:36,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{width:"100%",maxWidth:380,padding:"0 16px",flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {phase==="error"?
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:28,textAlign:"center",color:"white"}}>
            <div style={{fontSize:40,marginBottom:12}}>📷</div>
            <div style={{fontSize:13,color:"#fca5a5",marginBottom:14,lineHeight:1.5}}>{errMsg}</div>
            <button onClick={()=>startCam(facing)} style={{...btn,background:"white",color:T}}>Retry</button>
          </div>
        :phase==="starting"?
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.4)"}}><div style={{fontSize:32,marginBottom:10}}>⏳</div><div style={{fontSize:13}}>Starting camera…</div></div>
        :phase==="preview"&&captured?
          /* Square preview */
          <div style={{width:"100%",maxWidth:360}}>
            <img src={captured} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:14,display:"block",border:`3px solid ${T2}`}}/>
            <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:8}}>✂️ Auto-cropped to square</div>
          </div>
        :
          /* Square viewfinder overlay */
          <div style={{position:"relative",width:"100%",maxWidth:360}}>
            <video ref={videoRef} playsInline muted style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:14,display:"block",background:"#000"}}/>
            {/* Corner guides */}
            {[[0,0,"top","left"],[0,1,"top","right"],[1,0,"bottom","left"],[1,1,"bottom","right"]].map(([r,c,vt,hz],i)=>(
              <div key={i} style={{position:"absolute",[vt]:12,[hz]:12,width:30,height:30,
                borderTop:r===0?`3px solid ${T2}`:"none",borderBottom:r===1?`3px solid ${T2}`:"none",
                borderLeft:c===0?`3px solid ${T2}`:"none",borderRight:c===1?`3px solid ${T2}`:"none",borderRadius:4}}/>
            ))}
            <div style={{position:"absolute",inset:0,border:`2px dashed rgba(255,255,255,0.15)`,borderRadius:14,pointerEvents:"none"}}/>
          </div>
        }
      </div>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <div style={{width:"100%",maxWidth:480,padding:20,display:"flex",gap:12,justifyContent:"center",alignItems:"center"}}>
        {phase==="live"?<>
          <button onClick={flip} style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.2)",color:"white",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔄</button>
          <button onClick={capture} style={{width:74,height:74,borderRadius:"50%",background:T2,border:"4px solid white",fontSize:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 0 3px ${T2}55`}}>📸</button>
          <div style={{width:50}}/>
        </>:phase==="preview"?
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>{setCaptured(null);startCam(facing);}} style={{...btn,background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.25)"}}>↩ Retake</button>
            <button onClick={()=>onCapture(captured)} style={{...btn,background:T2}}>✓ Use Photo</button>
          </div>
        :null}
      </div>
    </div>
  );
}

/* Frame photo picker with square crop on file upload too */
function FramePhotoPicker({photo,onChange}){
  const [showCam,setShowCam]=useState(false);
  const fileRef=useRef(null);
  const handleFile=async e=>{
    const f=e.target.files?.[0];if(!f)return;
    const reader=new FileReader();
    reader.onload=async ev=>{const sq=await cropToSquare(ev.target.result);onChange(sq);};
    reader.readAsDataURL(f);
    e.target.value="";
  };
  return(
    <div style={{marginBottom:18}}>
      <label style={lbl}>Frame Photo <span style={{fontSize:9,color:"#94a3b8",fontWeight:400,textTransform:"none"}}>(auto-cropped 1:1)</span></label>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
      {photo?
        <div>
          <img src={photo} style={{width:120,height:120,objectFit:"cover",borderRadius:12,border:`2px solid ${T}40`,display:"block",marginBottom:8}}/>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setShowCam(true)} style={{...btnSm,background:TL,color:T}}>📸 Retake</button>
            <button onClick={()=>fileRef.current.click()} style={{...btnSm,background:"#f8fafc",color:"#64748b"}}>📁 Change</button>
            <button onClick={()=>onChange(null)} style={{...btnSm,background:"#fef2f2",color:"#dc2626"}}>✕</button>
          </div>
        </div>:
        <div style={{display:"flex",gap:10}}>
          <button type="button" onClick={()=>setShowCam(true)} style={{flex:1,padding:"18px 10px",borderRadius:12,border:`2px dashed ${T}50`,background:TLL,color:T,fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <span style={{fontSize:26}}>📸</span>Camera
          </button>
          <button type="button" onClick={()=>fileRef.current.click()} style={{flex:1,padding:"18px 10px",borderRadius:12,border:"2px dashed #e2e8f0",background:"#fafbfc",color:"#64748b",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <span style={{fontSize:26}}>📁</span>Upload
          </button>
        </div>
      }
      {showCam&&<CameraCapture onCapture={img=>{onChange(img);setShowCam(false);}} onClose={()=>setShowCam(false)}/>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PRINT RECEIPT
════════════════════════════════════════════════════════════ */
function buildPrintHTML(o){
  const ey=(lb,eye)=>`<tr><td class="ey">${lb}</td>${["sph","cyl","axis","add"].map(k=>`<td class="ec">${eye[k]||"—"}</td>`).join("")}</tr>`;
  const a=o.adv2||emptyAdvanced();
  const tintLabel=a.tintType==="solid"?TINT_SOLIDS.find(x=>x.id===a.tintSolid)?.label:a.tintType==="gradient"?TINT_GRADIENTS.find(x=>x.id===a.tintGradient)?.label:a.tintType==="mirror"?MIRROR_COATINGS.find(x=>x.id===a.mirrorCoating)?.label:"None";
  const advancedRows=[
    a.tintType!=="none"&&`<tr><td>Tint</td><td>${tintLabel}${a.tintDensity?` (${a.tintDensity}%)`:""}</td></tr>`,
    a.coatings?.length&&`<tr><td>Coatings</td><td>${a.coatings.join(", ")}</td></tr>`,
    a.edgeTreatment&&a.edgeTreatment!=="Standard"&&`<tr><td>Edge</td><td>${a.edgeTreatment}</td></tr>`,
    a.frameType&&`<tr><td>Frame</td><td>${a.frameType}</td></tr>`,
    (a.pdRight||a.pdLeft||a.pdBino)&&`<tr><td>PD</td><td>${a.pdBino?`Bino: ${a.pdBino}mm`:`R:${a.pdRight} / L:${a.pdLeft}`}</td></tr>`,
    a.segHeight&&`<tr><td>Seg Height</td><td>${a.segHeight}mm</td></tr>`,
    a.expectedDelivery&&`<tr><td>Delivery</td><td>${a.expectedDelivery}</td></tr>`,
    a.remarks&&`<tr><td>Remarks</td><td>${a.remarks}</td></tr>`,
  ].filter(Boolean).join("");

  const sec=(title,internal)=>`
    <div class="sec">
      <p class="copy-lbl">${title}</p>
      <div class="brand">👓 OptiFlow <span class="bsub">Optical Store</span></div>
      ${o.framePhoto?`<div style="text-align:center;margin:8px 0"><img src="${o.framePhoto}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #ccc"/></div>`:""}
      <div class="grid2">
        ${[["Receipt",o.rc],["Date",o.date],["Customer",o.name],["Phone",o.phone],["Salesman",o.by],["Payment",o.pm],...(internal?[["Order ID",o.id],["Source",o.src]]:[])]
          .map(([k,v])=>`<div><div class="fk">${k}</div><div class="fv">${v}</div></div>`).join("")}
      </div>
      <table class="eyetab">
        <thead><tr><th>Eye</th><th>SPH</th><th>CYL</th><th>AXIS</th><th>ADD</th></tr></thead>
        <tbody>${ey("R.E.",o.re)}${ey("L.E.",o.le)}</tbody>
      </table>
      <p class="glasses">Glass: <b>${o.glasses.join(", ")||"—"}</b></p>
      ${advancedRows?`<table class="advtab"><tbody>${advancedRows}</tbody></table>`:""}
      <div class="money">
        <div><div class="mk">Total</div><div class="mv">₹${o.total.toLocaleString("en-IN")}</div></div>
        <div><div class="mk">Advance</div><div class="mv green">₹${o.adv.toLocaleString("en-IN")}</div></div>
        <div><div class="mk">Balance</div><div class="mv ${o.rem>0?"amber":"green"}">₹${o.rem.toLocaleString("en-IN")}</div></div>
      </div>
      <div class="st-row">Status: <b>${o.status}</b></div>
    </div>`;
  return`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${o.rc}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1e293b;background:#eee;padding:12px}
    .wrap{max-width:380px;margin:0 auto}
    .sec{background:white;border:1px solid #ddd;border-radius:10px;padding:14px;margin-bottom:8px}
    .copy-lbl{text-align:center;font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
    .brand{text-align:center;font-size:16px;font-weight:900;color:#0D5E48;padding-bottom:8px;border-bottom:1px dashed #e2e8f0;margin-bottom:10px}
    .bsub{font-size:10px;color:#94a3b8;font-weight:400;margin-left:6px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;margin-bottom:10px}
    .fk{font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase}
    .fv{font-size:11px;font-weight:700;color:#1e293b}
    .eyetab{width:100%;border-collapse:collapse;margin-bottom:8px}
    .eyetab th{padding:4px 6px;font-size:9px;font-weight:800;color:#0D5E48;background:#F2FAF7;text-align:center}
    .eyetab th:first-child{text-align:left}
    .ey{padding:4px 6px;font-size:10px;font-weight:800;color:#0D5E48}
    .ec{padding:4px 6px;font-size:11px;text-align:center;border-bottom:1px solid #f8fafc}
    .glasses{font-size:11px;color:#475569;margin:6px 0}
    .advtab{width:100%;border-collapse:collapse;margin:6px 0}
    .advtab td{font-size:10px;padding:3px 6px;border-bottom:1px solid #f8fafc;color:#475569}
    .advtab td:first-child{font-weight:700;color:#334155;width:80px}
    .money{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin:10px 0}
    .money>div{text-align:center;background:#f8fafc;border-radius:7px;padding:6px 4px}
    .mk{font-size:8px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:2px}
    .mv{font-size:13px;font-weight:900;color:#1e293b}
    .mv.green{color:#15803d}.mv.amber{color:#d97706}
    .st-row{font-size:10px;color:#64748b;padding-top:6px;border-top:1px solid #f1f5f9}
    .divider{text-align:center;color:#ccc;font-size:9px;margin:5px 0;letter-spacing:3px}
    .noprint{text-align:center;margin:14px 0}
    .noprint button{padding:9px 24px;border-radius:8px;border:none;background:#0D5E48;color:white;font-size:13px;font-weight:800;cursor:pointer;margin:0 4px}
    @media print{.noprint{display:none}body{background:white;padding:0}}
  </style></head><body>
  <div class="wrap">
    ${sec("CUSTOMER COPY",false)}
    <div class="divider">— — — — — — — — — — — — —</div>
    ${sec("SHOP COPY",true)}
    <div class="noprint">
      <button onclick="window.print()">🖨️ Print</button>
      <button onclick="window.close()">✕ Close</button>
    </div>
  </div>
</body></html>`;
}
function printReceipt(o){
  const w=window.open("","_blank","width=460,height=820,scrollbars=yes");
  if(!w){alert("Pop-ups are blocked.\n\nPlease allow pop-ups for this site to enable printing, then try again.");return;}
  w.document.write(buildPrintHTML(o));w.document.close();w.focus();
  setTimeout(()=>{try{w.print();}catch{}},700);
}

/* ════════════════════════════════════════════════════════════
   ATOMS
════════════════════════════════════════════════════════════ */
function StatusBadge({status,small}){
  const m=SS[status]||{c:"#555",bg:"#f5f5f5",dot:"#999"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:small?"2px 8px":"4px 11px",borderRadius:20,background:m.bg,color:m.c,fontSize:small?10:11,fontWeight:700,whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:m.dot,flexShrink:0}}/>{status}</span>;
}
function RolePill({role,small}){
  const m=RM[role]||{color:"#555",bg:"#f5f5f5",border:"#e2e8f0"};
  return <span style={{fontSize:small?9:10,fontWeight:800,padding:small?"2px 7px":"3px 10px",borderRadius:20,background:m.bg,color:m.color,border:`1px solid ${m.border}`,display:"inline-block",whiteSpace:"nowrap"}}>{m.icon} {role}</span>;
}
function EyeGrid({re,le}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:260}}>
        <thead><tr style={{background:TLL}}><th style={{padding:"5px 8px",fontSize:10,fontWeight:800,color:T,textAlign:"left"}}>Eye</th>{["SPH","CYL","AXIS","ADD"].map(h=><th key={h} style={{padding:"5px 8px",fontSize:10,fontWeight:800,color:T,textAlign:"center"}}>{h}</th>)}</tr></thead>
        <tbody>{[["R.E.",re],["L.E.",le]].map(([lb,eye])=><tr key={lb} style={{borderBottom:"1px solid #f8fafc"}}><td style={{padding:"6px 8px",fontSize:11,fontWeight:800,color:T}}>{lb}</td>{["sph","cyl","axis","add"].map(k=><td key={k} style={{padding:"6px 8px",fontSize:12,textAlign:"center",color:eye[k]?"#1e293b":"#cbd5e1"}}>{eye[k]||"—"}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function EyeInputs({label,eye,onChange,readOnly}){
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:800,color:T,marginBottom:8,textTransform:"uppercase",letterSpacing:"1px",display:"flex",alignItems:"center",gap:6}}><span style={{width:20,height:2.5,background:T,borderRadius:2}}/>{label}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
        {["sph","cyl","axis","add"].map(f=><div key={f}><label style={{...lbl,fontSize:9}}>{f}</label><input style={{...inp,background:readOnly?"#f8fafc":"white",textAlign:"center",padding:"9px 6px"}} value={eye[f]} onChange={e=>onChange(f,e.target.value)} readOnly={readOnly} placeholder="—"/></div>)}
      </div>
    </div>
  );
}
function GlassTags({selected,onToggle}){
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
      {GLASS_TYPES.map(g=><button key={g} onClick={()=>onToggle(g)} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${selected.includes(g)?T:"#e2e8f0"}`,background:selected.includes(g)?TL:"white",color:selected.includes(g)?T:"#64748b",fontSize:12,fontWeight:selected.includes(g)?800:400,cursor:"pointer"}}>{g}</button>)}
    </div>
  );
}
function StepProgress({status}){
  const idx=STATUSES.indexOf(status);
  return(
    <div style={{display:"flex",alignItems:"flex-start",overflowX:"auto",paddingBottom:4,scrollbarWidth:"none",marginBottom:14}}>
      {STATUSES.map((s,i)=>{const done=i<idx,cur=i===idx,m=SS[s];return(
        <div key={s} style={{display:"flex",alignItems:"flex-start",flexShrink:0}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:done?T2:cur?m.dot:"#e2e8f0",border:`2.5px solid ${done?T2:cur?m.c:"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done||cur?"white":"#94a3b8",fontWeight:900}}>{done?"✓":i+1}</div>
            <span style={{fontSize:8,color:cur?m.c:done?T2:"#94a3b8",fontWeight:cur||done?700:400,maxWidth:48,textAlign:"center",lineHeight:1.2}}>{s}</span>
          </div>
          {i<STATUSES.length-1&&<div style={{width:18,height:2,background:done?T2:"#e2e8f0",margin:"11px 2px 0",flexShrink:0}}/>}
        </div>
      );})}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ADVANCED OPTICAL SECTION
════════════════════════════════════════════════════════════ */
function AdvancedOpticalSection({adv2,onChange}){
  const [open,setOpen]=useState(false);
  const set=(key,val)=>onChange({...adv2,[key]:val});
  const setPrism=(eye,key,val)=>onChange({...adv2,[`prism${eye}`]:{...adv2[`prism${eye}`],[key]:val}});
  const toggleCoating=c=>set("coatings",adv2.coatings.includes(c)?adv2.coatings.filter(x=>x!==c):[...adv2.coatings,c]);

  // Summary for collapsed state
  const summary=useMemo(()=>{
    const parts=[];
    if(adv2.tintType!=="none"){
      const tl=adv2.tintType==="solid"?TINT_SOLIDS.find(x=>x.id===adv2.tintSolid)?.label:adv2.tintType==="gradient"?TINT_GRADIENTS.find(x=>x.id===adv2.tintGradient)?.label:MIRROR_COATINGS.find(x=>x.id===adv2.mirrorCoating)?.label;
      if(tl)parts.push(tl);
    }
    if(adv2.coatings?.length)parts.push(...adv2.coatings);
    if(adv2.pdBino)parts.push(`PD ${adv2.pdBino}mm`);
    else if(adv2.pdRight||adv2.pdLeft)parts.push(`PD R:${adv2.pdRight||"—"} L:${adv2.pdLeft||"—"}`);
    if(adv2.expectedDelivery)parts.push(`Deliver: ${adv2.expectedDelivery}`);
    return parts;
  },[adv2]);

  const tintSwatch=(color,isGradient,from,to)=>{
    if(isGradient)return`linear-gradient(135deg,${from},${to})`;
    return color;
  };

  return(
    <div style={{marginBottom:18}}>
      <button type="button" onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1.5px solid ${open?T:"#e2e8f0"}`,background:open?TLL:"#fafbfc",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left"}}>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:open?T:"#334155"}}>
            {open?"▲":"▼"} &nbsp;Advanced Optical Options
          </div>
          {!open&&summary.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:5}}>
              {summary.map((s,i)=><span key={i} style={{fontSize:10,background:TL,color:T,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{s}</span>)}
            </div>
          )}
          {!open&&summary.length===0&&<div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>Tint, coatings, PD, prism, delivery & more</div>}
        </div>
      </button>

      {open&&(
        <div style={{background:"#fafbfc",border:`1.5px solid ${T}30`,borderTop:"none",borderRadius:"0 0 11px 11px",padding:16}}>

          {/* ── TINT / COLOR ── */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:800,color:"#334155",marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:16}}>🎨</span> Lens Tint / Color
            </div>
            <div style={{display:"flex",gap:7,marginBottom:12}}>
              {[["none","None"],["solid","Solid"],["gradient","Gradient"],["mirror","Mirror"]].map(([v,l])=>(
                <button key={v} onClick={()=>set("tintType",v)} style={{flex:1,padding:"8px 4px",borderRadius:9,border:`1.5px solid ${adv2.tintType===v?T:"#e2e8f0"}`,background:adv2.tintType===v?TL:"white",color:adv2.tintType===v?T:"#64748b",fontSize:11,fontWeight:800,cursor:"pointer"}}>{l}</button>
              ))}
            </div>

            {adv2.tintType==="solid"&&(
              <>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
                  {TINT_SOLIDS.map(c=>(
                    <button key={c.id} onClick={()=>set("tintSolid",c.id)} title={c.label} style={{width:34,height:34,borderRadius:"50%",background:c.hex,border:`3px solid ${adv2.tintSolid===c.id?"#1e293b":"transparent"}`,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
                  ))}
                </div>
                {adv2.tintSolid&&<div style={{fontSize:11,color:T,fontWeight:700,marginBottom:8}}>{TINT_SOLIDS.find(x=>x.id===adv2.tintSolid)?.label}</div>}
                <div>
                  <label style={lbl}>Density %</label>
                  <input style={{...inp,maxWidth:120}} value={adv2.tintDensity} onChange={e=>set("tintDensity",e.target.value)} placeholder="70" inputMode="numeric"/>
                </div>
              </>
            )}

            {adv2.tintType==="gradient"&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {TINT_GRADIENTS.map(g=>(
                  <button key={g.id} onClick={()=>set("tintGradient",g.id)} style={{padding:"6px 12px",borderRadius:20,border:`2px solid ${adv2.tintGradient===g.id?"#1e293b":"transparent"}`,background:`linear-gradient(135deg,${g.from},${g.to})`,color:"white",fontSize:11,fontWeight:700,cursor:"pointer",textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{g.label}</button>
                ))}
              </div>
            )}

            {adv2.tintType==="mirror"&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {MIRROR_COATINGS.map(m=>(
                  <button key={m.id} onClick={()=>set("mirrorCoating",m.id)} style={{padding:"7px 13px",borderRadius:20,border:`2px solid ${adv2.mirrorCoating===m.id?"#1e293b":"transparent"}`,background:m.hex,color:"white",fontSize:11,fontWeight:700,cursor:"pointer",textShadow:"0 1px 2px rgba(0,0,0,0.5)"}}>{m.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* ── SURFACE COATINGS ── */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:800,color:"#334155",marginBottom:10,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>🛡️</span> Surface Coatings</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {SURFACE_COATINGS.map(c=>(
                <button key={c} onClick={()=>toggleCoating(c)} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${adv2.coatings.includes(c)?T:"#e2e8f0"}`,background:adv2.coatings.includes(c)?TL:"white",color:adv2.coatings.includes(c)?T:"#64748b",fontSize:11,fontWeight:adv2.coatings.includes(c)?800:400,cursor:"pointer"}}>{c}</button>
              ))}
            </div>
          </div>

          {/* ── EDGE + FRAME + FITTING ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
            <div>
              <label style={lbl}>Edge Treatment</label>
              <select style={inp} value={adv2.edgeTreatment} onChange={e=>set("edgeTreatment",e.target.value)}>
                {EDGE_TREATMENTS.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Frame Type</label>
              <select style={inp} value={adv2.frameType} onChange={e=>set("frameType",e.target.value)}>
                {FRAME_TYPES.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Fitting Type</label>
              <select style={inp} value={adv2.fittingType} onChange={e=>set("fittingType",e.target.value)}>
                {FITTING_TYPES.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* ── PUPILLARY DISTANCE ── */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:800,color:"#334155",marginBottom:10,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>📏</span> Pupillary Distance (PD)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div><label style={lbl}>PD Right (mm)</label><input style={inp} value={adv2.pdRight} onChange={e=>set("pdRight",e.target.value)} placeholder="e.g. 32" inputMode="decimal"/></div>
              <div><label style={lbl}>PD Left (mm)</label><input style={inp} value={adv2.pdLeft} onChange={e=>set("pdLeft",e.target.value)} placeholder="e.g. 31" inputMode="decimal"/></div>
              <div><label style={lbl}>Bino PD (mm)</label><input style={inp} value={adv2.pdBino} onChange={e=>set("pdBino",e.target.value)} placeholder="e.g. 63" inputMode="decimal"/></div>
            </div>
          </div>

          {/* ── HEIGHTS ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            <div><label style={lbl}>Seg Height (mm)</label><input style={inp} value={adv2.segHeight} onChange={e=>set("segHeight",e.target.value)} placeholder="For bifocal/progressive" inputMode="decimal"/></div>
            <div><label style={lbl}>OC Height (mm)</label><input style={inp} value={adv2.ocHeight} onChange={e=>set("ocHeight",e.target.value)} placeholder="Optical centre" inputMode="decimal"/></div>
          </div>

          {/* ── PRISM ── */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:800,color:"#334155",marginBottom:10,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>🔺</span> Prism (if required)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
              <div><label style={{...lbl,fontSize:9}}>R. Prism (Δ)</label><input style={inp} value={adv2.prismRight.val} onChange={e=>setPrism("Right","val",e.target.value)} placeholder="0.00" inputMode="decimal"/></div>
              <div><label style={{...lbl,fontSize:9}}>R. Base</label><input style={inp} value={adv2.prismRight.base} onChange={e=>setPrism("Right","base",e.target.value)} placeholder="Up/Down/In/Out"/></div>
              <div><label style={{...lbl,fontSize:9}}>L. Prism (Δ)</label><input style={inp} value={adv2.prismLeft.val} onChange={e=>setPrism("Left","val",e.target.value)} placeholder="0.00" inputMode="decimal"/></div>
              <div><label style={{...lbl,fontSize:9}}>L. Base</label><input style={inp} value={adv2.prismLeft.base} onChange={e=>setPrism("Left","base",e.target.value)} placeholder="Up/Down/In/Out"/></div>
            </div>
          </div>

          {/* ── DELIVERY + REMARKS ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>Expected Delivery</label><input type="date" style={inp} value={adv2.expectedDelivery} onChange={e=>set("expectedDelivery",e.target.value)}/></div>
            <div><label style={lbl}>Special Remarks</label><input style={inp} value={adv2.remarks} onChange={e=>set("remarks",e.target.value)} placeholder="Any instructions…"/></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════════════════════ */
function LoginScreen({users,onLogin}){
  const [uname,setUname]=useState("");
  const [pwd,setPwd]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [shake,setShake]=useState(false);
  const submit=async()=>{
    if(!uname.trim()||!pwd.trim())return setErr("Please enter username and password");
    setLoading(true);setErr("");
    await new Promise(r=>setTimeout(r,400));
    const u=users.find(u=>u.username.toLowerCase()===uname.trim().toLowerCase()&&u.password===pwd);
    setLoading(false);
    if(!u){setErr("Invalid username or password");setShake(true);setTimeout(()=>setShake(false),500);return;}
    if(!u.active){setErr("Account disabled — contact admin.");return;}
    onLogin(u);
  };
  return(
    <div style={{minHeight:"100vh",background:"#040f0c",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      {[["#0D5E48","18%","12%","380px",0.14],["#1A8C6A","72%","60%","280px",0.10],["#063d2e","8%","68%","200px",0.17]].map(([c,l,t,s,o],i)=>(
        <div key={i} style={{position:"absolute",left:l,top:t,width:s,height:s,borderRadius:"50%",background:c,opacity:o,filter:"blur(90px)",pointerEvents:"none"}}/>
      ))}
      <div style={{width:"100%",maxWidth:420,position:"relative",animation:shake?"shake 0.4s ease":"none"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:58,marginBottom:12,filter:"drop-shadow(0 0 28px #1A8C6A88)"}}>👓</div>
          <h1 style={{color:"white",fontSize:36,fontWeight:900,margin:0,letterSpacing:"-2px"}}>Opti<span style={{color:T2}}>Flow</span></h1>
          <p style={{color:"rgba(255,255,255,0.35)",margin:"8px 0 0",fontSize:13}}>Optical Store Management System</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:32}}>
          <h2 style={{color:"white",fontSize:18,fontWeight:800,margin:"0 0 22px"}}>Sign in to continue</h2>
          {err&&<div style={{background:"rgba(220,38,38,0.12)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fca5a5",marginBottom:16}}>⚠️ {err}</div>}
          <div style={{marginBottom:14}}>
            <label style={{...lbl,color:"rgba(255,255,255,0.4)"}}>Username</label>
            <input style={{...inp,background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.1)",color:"white",caretColor:T2}} value={uname} onChange={e=>{setUname(e.target.value);setErr("");}} placeholder="Enter username" onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{...lbl,color:"rgba(255,255,255,0.4)"}}>Password</label>
            <div style={{position:"relative"}}>
              <input style={{...inp,background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.1)",color:"white",caretColor:T2,paddingRight:44}} type={showPwd?"text":"password"} value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} placeholder="Enter password" onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <button onClick={()=>setShowPwd(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:16}}>{showPwd?"🙈":"👁️"}</button>
            </div>
          </div>
          <button onClick={submit} disabled={loading} style={{...btn,width:"100%",padding:14,fontSize:15,background:`linear-gradient(135deg,${T} 0%,${T2} 100%)`,boxShadow:`0 8px 24px ${T}60`,opacity:loading?0.7:1}}>{loading?"Signing in…":"Sign In →"}</button>
        </div>
        <div style={{marginTop:22}}>
          <p style={{color:"rgba(255,255,255,0.18)",fontSize:10,textAlign:"center",margin:"0 0 10px",letterSpacing:"1.5px",textTransform:"uppercase"}}>Quick Demo Access</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {users.filter(u=>u.active).map(u=>(
              <button key={u.id} onClick={()=>{setUname(u.username);setPwd(u.password);setErr("");}} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"9px 12px",cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:2}}>@{u.username}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{u.roles.map(r=>RM[r]?.icon).join(" ")} {u.roles.join(", ")}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   USER MANAGEMENT
════════════════════════════════════════════════════════════ */
function UserManagement({users,setUsers}){
  const empty={name:"",username:"",password:"",roles:[],active:true};
  const [form,setForm]=useState(null);
  const [editId,setEditId]=useState(null);
  const [err,setErr]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [search,setSearch]=useState("");
  const [confirm,setConfirm]=useState(null);
  const close=()=>{setForm(null);setEditId(null);setErr("");};
  const toggleRole=r=>setForm(f=>({...f,roles:f.roles.includes(r)?f.roles.filter(x=>x!==r):[...f.roles,r]}));
  const save=()=>{
    if(!form.name.trim())return setErr("Full name required");
    if(!form.username.trim())return setErr("Username required");
    if(!editId&&!form.password.trim())return setErr("Password required");
    if(form.password&&form.password.length<4)return setErr("Min 4 chars");
    if(!form.roles.length)return setErr("At least one role required");
    if(users.find(u=>u.username.toLowerCase()===form.username.trim().toLowerCase()&&u.id!==editId))return setErr("Username taken");
    if(editId){
      const pw=users.find(u=>u.id===editId)?.password;
      setUsers(p=>p.map(u=>u.id===editId?{...form,id:editId,password:form.password||pw,updatedAt:new Date().toISOString()}:u));
    }else{
      setUsers(p=>[...p,{...form,id:Date.now(),username:form.username.trim().toLowerCase(),createdAt:new Date().toISOString()}]);
    }
    close();
  };
  const filtered=users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.username.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:0,letterSpacing:"-0.5px"}}>User Management</h2>
        <button onClick={()=>{setForm({...empty});setEditId(null);setErr("");setShowPwd(false);}} style={btn}>+ Add User</button>
      </div>
      <div style={{marginBottom:14,position:"relative"}}><input style={{...inp,paddingLeft:36}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"/><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:0.4}}>🔍</span></div>
      {form&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{...card,width:"100%",maxWidth:490,maxHeight:"92vh",overflowY:"auto",padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:900,color:"#0f172a"}}>{editId?"Edit User":"Add User"}</h3>
              <button onClick={close} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
            {err&&<div style={{background:"#fef2f2",color:"#dc2626",borderRadius:8,padding:"9px 12px",fontSize:12,marginBottom:14}}>⚠️ {err}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div style={{gridColumn:"1/-1"}}><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Rahul Sharma"/></div>
              <div><label style={lbl}>Username *</label><input style={inp} value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value.trim().toLowerCase()}))} placeholder="e.g. rahul"/></div>
              <div><label style={lbl}>{editId?"New Password":"Password *"}</label>
                <div style={{position:"relative"}}><input style={{...inp,paddingRight:40}} type={showPwd?"text":"password"} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder={editId?"Leave blank to keep":""} autoComplete="new-password"/><button onClick={()=>setShowPwd(p=>!p)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#94a3b8"}}>{showPwd?"🙈":"👁️"}</button></div>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={lbl}>Roles * — select all that apply</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                {ALL_ROLES.map(r=>{const m=RM[r],sel=form.roles.includes(r);return(
                  <button key={r} onClick={()=>toggleRole(r)} style={{padding:"11px 12px",borderRadius:10,border:`2px solid ${sel?m.color:m.border}`,background:sel?m.bg:"white",color:sel?m.color:"#64748b",fontSize:12,fontWeight:sel?800:500,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:17}}>{m.icon}</span><span style={{flex:1}}>{r}</span>{sel&&<span style={{fontSize:14}}>✓</span>}
                  </button>);})}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"10px 12px",background:"#f8fafc",borderRadius:9}}>
              <span style={{fontSize:12,fontWeight:700,color:"#475569",flex:1}}>Account Status</span>
              <button onClick={()=>setForm(f=>({...f,active:!f.active}))} style={{padding:"5px 16px",borderRadius:20,border:`1.5px solid ${form.active?T:"#e2e8f0"}`,background:form.active?TL:"white",color:form.active?T:"#94a3b8",fontSize:12,fontWeight:800,cursor:"pointer"}}>{form.active?"✓ Active":"✕ Disabled"}</button>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={save} style={{...btn,flex:1}}>{editId?"Save Changes":"Create User"}</button>
              <button onClick={close} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:10,padding:"10px 18px",cursor:"pointer",fontWeight:700}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm&&<ConfirmDialog {...confirm}/>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(u=>(
          <div key={u.id} style={{...card,opacity:u.active?1:0.55}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",flex:1,minWidth:0}}>
                <div style={{width:44,height:44,borderRadius:12,background:u.active?TL:"#f1f5f9",color:u.active?T:"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,flexShrink:0}}>{u.name[0].toUpperCase()}</div>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:2}}>
                    <span style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{u.name}</span>
                    {!u.active&&<span style={{fontSize:9,fontWeight:800,color:"#94a3b8",background:"#f1f5f9",padding:"2px 7px",borderRadius:20}}>DISABLED</span>}
                    {u.id===1&&<span style={{fontSize:9,fontWeight:800,color:"#7C3AED",background:"#F5F3FF",padding:"2px 7px",borderRadius:20}}>OWNER</span>}
                  </div>
                  <div style={{fontSize:11,color:"#94a3b8",marginBottom:7}}>@{u.username}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{u.roles.map(r=><RolePill key={r} role={r} small/>)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0,flexDirection:"column",alignItems:"flex-end"}}>
                <button onClick={()=>{setForm({...u,password:""});setEditId(u.id);setErr("");setShowPwd(false);}} style={{...btnSm,background:TL,color:T}}>✏️ Edit</button>
                <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,active:!x.active}:x))} style={{...btnSm,background:u.active?"#fef3c7":"#dcfce7",color:u.active?"#b45309":"#15803d"}}>{u.active?"Disable":"Enable"}</button>
                {u.id!==1&&<button onClick={()=>setConfirm({title:"Delete User",message:`Delete "${u.name}"?`,danger:true,onConfirm:()=>{setUsers(p=>p.filter(x=>x.id!==u.id));setConfirm(null);},onCancel:()=>setConfirm(null)})} style={{...btnSm,background:"#fef2f2",color:"#dc2626"}}>🗑️</button>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:48}}>No users found</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CHECKUP FORM
════════════════════════════════════════════════════════════ */
function CheckupForm({initial,onSave,onCancel,user}){
  const isEdit=!!initial?.id;
  const [name,setName]=useState(initial?.name||"");
  const [phone,setPhone]=useState(initial?.phone||"");
  const [re,setRe]=useState(initial?.re||emptyEye());
  const [le,setLe]=useState(initial?.le||emptyEye());
  const [err,setErr]=useState("");
  const save=()=>{
    if(!name.trim())return setErr("Customer name required");
    if(!/^\d{10}$/.test(phone))return setErr("Phone must be 10 digits");
    if(!Object.values(re).some(v=>v.trim())&&!Object.values(le).some(v=>v.trim()))return setErr("At least one eye required");
    onSave({...(initial||{}),name,phone,re,le,by:initial?.by||user.name,date:initial?.date||new Date().toISOString().slice(0,10),converted:initial?.converted||false,updatedAt:new Date().toISOString()});
  };
  return(
    <div style={{...card,border:`1.5px solid ${T}40`,marginBottom:16}}>
      <h3 style={{margin:"0 0 18px",fontSize:15,fontWeight:900,color:T}}>{isEdit?"Edit Checkup":"New Eye Checkup"}</h3>
      {err&&<div style={{background:"#fef2f2",color:"#dc2626",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:14}}>⚠️ {err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div><label style={lbl}>Customer Name *</label><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></div>
        <div><label style={lbl}>Phone *</label><input style={inp} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10 digits" maxLength={10} inputMode="numeric"/></div>
      </div>
      <EyeInputs label="Right Eye" eye={re} onChange={(f,v)=>setRe(p=>({...p,[f]:v}))}/>
      <EyeInputs label="Left Eye"  eye={le} onChange={(f,v)=>setLe(p=>({...p,[f]:v}))}/>
      <div style={{display:"flex",gap:10}}>
        <button onClick={save} style={{...btn,flex:1}}>{isEdit?"Save Changes":"Save Checkup"}</button>
        <button onClick={onCancel} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:10,padding:"10px 18px",cursor:"pointer",fontWeight:700}}>Cancel</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   EYE CHECKUPS
════════════════════════════════════════════════════════════ */
function EyeCheckups({checkups,setCheckups,user,onOrderFromCheckup,counters,setCounters}){
  const [mode,setMode]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const handleSave=(data)=>{
    if(mode==="add"){const nc=counters.cc+1;setCounters(c=>({...c,cc:nc}));setCheckups(p=>[...p,{...data,id:`EC${nc}`}]);}
    else setCheckups(p=>p.map(c=>c.id===mode?data:c));
    setMode(null);
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:0,letterSpacing:"-0.5px"}}>Eye Checkups</h2>
        {can(user.roles,"addCheckup")&&<button onClick={()=>setMode("add")} style={btn}>+ New</button>}
      </div>
      {mode==="add"&&<CheckupForm user={user} onSave={handleSave} onCancel={()=>setMode(null)}/>}
      {confirm&&<ConfirmDialog {...confirm}/>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {checkups.map(c=>(
          <div key={c.id} style={card}>
            {mode===c.id?<CheckupForm initial={c} user={user} onSave={handleSave} onCancel={()=>setMode(null)}/>:(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div><div style={{fontSize:15,fontWeight:800,color:"#1e293b"}}>{c.name}</div><div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{c.id} · 📞 {c.phone} · 📅 {c.date}</div></div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                    {c.converted?<span style={{fontSize:10,background:"#dcfce7",color:"#15803d",padding:"3px 9px",borderRadius:20,fontWeight:800}}>✓ Converted</span>:<span style={{fontSize:10,background:"#f8fafc",color:"#94a3b8",padding:"3px 9px",borderRadius:20}}>Not converted</span>}
                  </div>
                </div>
                <EyeGrid re={c.re} le={c.le}/>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:8,marginBottom:10}}>👤 {c.by}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {!c.converted&&can(user.roles,"addOrder")&&<button onClick={()=>onOrderFromCheckup(c)} style={{...btnSm,background:TL,color:T}}>Create Order →</button>}
                  {can(user.roles,"editCheckup")&&<button onClick={()=>setMode(c.id)} style={{...btnSm,background:"#f0f9ff",color:"#0284C7"}}>✏️ Edit</button>}
                  {can(user.roles,"deleteCheckup")&&<button onClick={()=>setConfirm({title:"Delete Checkup",message:`Delete checkup for "${c.name}"?`,danger:true,onConfirm:()=>{setCheckups(p=>p.filter(x=>x.id!==c.id));setConfirm(null);},onCancel:()=>setConfirm(null)})} style={{...btnSm,background:"#fef2f2",color:"#dc2626"}}>🗑️</button>}
                </div>
              </>
            )}
          </div>
        ))}
        {checkups.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:48}}>No checkups yet</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ORDER FORM  (add + edit, with advanced optical section)
════════════════════════════════════════════════════════════ */
function OrderForm({initial,initCheckup,onSave,onCancel,user}){
  const isEdit=!!(initial?.id);
  const locked=!isEdit&&!!initCheckup;
  const [src,setSrc]=useState(initial?.src||(locked?"Internal":"External"));
  const [name,setName]=useState(initial?.name||initCheckup?.name||"");
  const [phone,setPhone]=useState(initial?.phone||initCheckup?.phone||"");
  const [re,setRe]=useState(initial?.re||initCheckup?.re||emptyEye());
  const [le,setLe]=useState(initial?.le||initCheckup?.le||emptyEye());
  const [glasses,setGlasses]=useState(initial?.glasses||[]);
  const [total,setTotal]=useState(initial?.total?.toString()||"");
  const [adv,setAdv]=useState(initial?.adv?.toString()||"");
  const [pm,setPm]=useState(initial?.pm||"Cash");
  const [framePhoto,setFramePhoto]=useState(initial?.framePhoto||null);
  const [adv2,setAdv2]=useState(initial?.adv2||emptyAdvanced());
  const [err,setErr]=useState("");
  const rem=Math.max(0,(+total||0)-(+adv||0));
  const save=()=>{
    if(!name.trim())return setErr("Customer name required");
    if(!/^\d{10}$/.test(phone))return setErr("Valid 10-digit phone required");
    if(!total||+total<=0)return setErr("Total price required");
    if(+adv>+total)return setErr("Advance cannot exceed total");
    const base=initial||{cref:initCheckup?.id||null,by:user.name,date:new Date().toISOString().slice(0,10),ordDate:"",arrDate:"",status:"Order Created",vendor:"",fitter:"",specDate:""};
    onSave({...base,src,name,phone,re,le,glasses,qty:1,total:+total,adv:+adv,rem,pm,framePhoto,adv2,updatedAt:new Date().toISOString()});
  };
  return(
    <div style={{...card,marginBottom:0}}>
      <h3 style={{margin:"0 0 18px",fontSize:16,fontWeight:900,color:"#0f172a"}}>{isEdit?"Edit Order":"New Order"}</h3>
      {err&&<div style={{background:"#fef2f2",color:"#dc2626",borderRadius:8,padding:"9px 12px",fontSize:13,marginBottom:14}}>⚠️ {err}</div>}
      {!isEdit&&(
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {["Internal","External"].map(t=><button key={t} onClick={()=>!locked&&setSrc(t)} style={{flex:1,padding:11,borderRadius:11,border:`2px solid ${src===t?T:"#e2e8f0"}`,background:src===t?TL:"white",color:src===t?T:"#94a3b8",fontSize:13,fontWeight:800,cursor:locked?"default":"pointer"}}>{t==="Internal"?"🏥":"📋"} {t}</button>)}
        </div>
      )}
      {initCheckup&&!isEdit&&<div style={{background:"#f0f9ff",borderRadius:9,padding:"9px 13px",fontSize:12,color:"#0369a1",marginBottom:16}}>📎 From checkup <b>{initCheckup.id}</b> — eye data locked</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div><label style={lbl}>Customer Name *</label><input style={{...inp,background:locked?"#f8fafc":"white"}} value={name} onChange={e=>setName(e.target.value)} readOnly={locked}/></div>
        <div><label style={lbl}>Phone *</label><input style={{...inp,background:locked?"#f8fafc":"white"}} value={phone} onChange={e=>setPhone(e.target.value)} readOnly={locked} maxLength={10} inputMode="numeric"/></div>
      </div>
      <EyeInputs label="Right Eye" eye={re} onChange={(f,v)=>setRe(p=>({...p,[f]:v}))} readOnly={locked&&!isEdit}/>
      <EyeInputs label="Left Eye"  eye={le} onChange={(f,v)=>setLe(p=>({...p,[f]:v}))} readOnly={locked&&!isEdit}/>
      <div style={{marginBottom:18}}><label style={lbl}>Glass Types</label><div style={{marginTop:6}}><GlassTags selected={glasses} onToggle={g=>setGlasses(p=>p.includes(g)?p.filter(x=>x!==g):[...p,g])}/></div></div>
      <FramePhotoPicker photo={framePhoto} onChange={setFramePhoto}/>

      {/* ADVANCED OPTICAL — collapsed by default */}
      <AdvancedOpticalSection adv2={adv2} onChange={setAdv2}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        <div><label style={lbl}>Total (₹) *</label><input style={inp} type="number" value={total} onChange={e=>setTotal(e.target.value)} placeholder="0" inputMode="numeric"/></div>
        <div><label style={lbl}>Advance (₹)</label><input style={inp} type="number" value={adv} onChange={e=>setAdv(e.target.value)} placeholder="0" inputMode="numeric"/></div>
        <div><label style={lbl}>Balance</label><div style={{...inp,background:"#f8fafc",display:"flex",alignItems:"center",fontWeight:800,color:rem>0?"#d97706":"#16a34a"}}>₹{rem.toLocaleString("en-IN")}</div></div>
      </div>
      <div style={{marginBottom:20}}><label style={lbl}>Payment Mode</label><div style={{display:"flex",gap:8}}>{["Cash","UPI","Card"].map(m=><button key={m} onClick={()=>setPm(m)} style={{flex:1,padding:10,borderRadius:9,border:`1.5px solid ${pm===m?T:"#e2e8f0"}`,background:pm===m?TL:"white",color:pm===m?T:"#94a3b8",fontSize:13,fontWeight:pm===m?800:500,cursor:"pointer"}}>{m}</button>)}</div></div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={save} style={{...btn,flex:1,padding:13,fontSize:14}}>{isEdit?"💾 Save Changes":"🧾 Create Order"}</button>
        <button onClick={onCancel} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:10,padding:"13px 18px",cursor:"pointer",fontWeight:700}}>Cancel</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   RECEIPT VIEW
════════════════════════════════════════════════════════════ */
function ReceiptView({o,onBack}){
  const msg=`Hello ${o.name}! Your order ${o.rc} at OptiFlow.\n\nGlass: ${o.glasses.join(", ")||"—"}\nTotal: ₹${o.total.toLocaleString("en-IN")} | Paid: ₹${o.adv.toLocaleString("en-IN")} | Balance: ₹${o.rem.toLocaleString("en-IN")}\nStatus: ${o.status}\n\nThank you! 🙏`;
  const a=o.adv2||emptyAdvanced();
  const advTags=[
    a.tintType==="solid"&&TINT_SOLIDS.find(x=>x.id===a.tintSolid)?.label,
    a.tintType==="gradient"&&TINT_GRADIENTS.find(x=>x.id===a.tintGradient)?.label,
    a.tintType==="mirror"&&MIRROR_COATINGS.find(x=>x.id===a.mirrorCoating)?.label,
    ...(a.coatings||[]),
    a.edgeTreatment&&a.edgeTreatment!=="Standard"&&a.edgeTreatment,
    a.pdBino&&`PD ${a.pdBino}mm`,
  ].filter(Boolean);
  return(
    <div>
      {onBack&&<button onClick={onBack} style={backBtn}>← Back</button>}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={()=>printReceipt(o)} style={{...btn,display:"flex",alignItems:"center",gap:6}}>🖨️ Print Receipt</button>
        <a href={`https://wa.me/91${o.phone}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" style={{...btn,background:"#25D366",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6}}>💬 WhatsApp</a>
      </div>
      <div style={{maxWidth:400,margin:"0 auto"}}>
        {[false,true].map((internal,i)=>(
          <div key={i}>
            {i===1&&<div style={{textAlign:"center",color:"#cbd5e1",fontSize:10,margin:"8px 0",letterSpacing:"3px"}}>— — — — — — — — — — — —</div>}
            <div style={{border:"1px solid #e2e8f0",borderRadius:12,padding:16,marginBottom:8,background:"white"}}>
              <div style={{textAlign:"center",fontSize:9,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"2px",marginBottom:12}}>{internal?"SHOP COPY":"CUSTOMER COPY"}</div>
              <div style={{textAlign:"center",fontSize:17,fontWeight:900,color:T,marginBottom:2}}>👓 OptiFlow</div>
              <div style={{textAlign:"center",fontSize:10,color:"#94a3b8",marginBottom:12,paddingBottom:10,borderBottom:"1px dashed #f1f5f9"}}>Optical Store</div>
              {o.framePhoto&&<div style={{textAlign:"center",marginBottom:10}}><img src={o.framePhoto} style={{width:100,height:100,objectFit:"cover",borderRadius:9,border:`1px solid ${T}30`}}/></div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 14px",marginBottom:10}}>
                {[["Receipt",o.rc],["Date",o.date],["Customer",o.name],["Phone",o.phone],["Salesman",o.by],["Payment",o.pm],...(internal?[["Order ID",o.id],["Source",o.src]]:[])].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:9,fontWeight:800,color:"#94a3b8",textTransform:"uppercase"}}>{k}</div><div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:1}}>{v}</div></div>
                ))}
              </div>
              <EyeGrid re={o.re} le={o.le}/>
              <div style={{fontSize:11,color:"#475569",margin:"8px 0"}}><b>Glass: </b>{o.glasses.join(", ")||"—"}</div>
              {advTags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"6px 0"}}>{advTags.map((t,i)=><span key={i} style={{fontSize:10,background:TL,color:T,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{t}</span>)}</div>}
              {a.pdBino&&!advTags.includes(`PD ${a.pdBino}mm`)&&<div style={{fontSize:11,color:"#64748b",margin:"4px 0"}}>PD: {a.pdBino}mm (bino)</div>}
              {(a.pdRight||a.pdLeft)&&!a.pdBino&&<div style={{fontSize:11,color:"#64748b",margin:"4px 0"}}>PD: R {a.pdRight||"—"}mm / L {a.pdLeft||"—"}mm</div>}
              {a.expectedDelivery&&<div style={{fontSize:11,color:"#64748b",margin:"4px 0"}}>Expected: {a.expectedDelivery}</div>}
              {a.remarks&&<div style={{fontSize:11,color:"#64748b",fontStyle:"italic",margin:"4px 0"}}>"{a.remarks}"</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,margin:"10px 0"}}>
                {[["Total","#1e293b",o.total],["Advance",T,o.adv],["Balance",o.rem>0?"#d97706":"#16a34a",o.rem]].map(([k,c,v])=>(
                  <div key={k} style={{textAlign:"center",background:"#f8fafc",borderRadius:7,padding:"7px 4px"}}>
                    <div style={{fontSize:8,color:"#94a3b8",fontWeight:800,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:900,color:c}}>₹{v.toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid #f8fafc"}}><span style={{fontSize:11,color:"#94a3b8"}}>Status</span><StatusBadge status={o.status} small/></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ORDERS
════════════════════════════════════════════════════════════ */
function Orders({orders,setOrders,checkups,setCheckups,user,initCheckup,clearInit,counters,setCounters}){
  const [view,setView]=useState(initCheckup?"create":"list");
  const [formCheckup]=useState(initCheckup);
  const [selected,setSelected]=useState(null);
  const [editTarget,setEditTarget]=useState(null);
  const [confirm,setConfirm]=useState(null);

  const handleCreate=(o)=>{
    const nc=counters.oc+1;setCounters(c=>({...c,oc:nc}));
    const newOrder={...o,id:`ORD${nc}`,rc:`RC${nc}`};
    setOrders(p=>[...p,newOrder]);
    if(formCheckup)setCheckups(p=>p.map(c=>c.id===formCheckup.id?{...c,converted:true}:c));
    clearInit?.();setSelected(newOrder);setView("receipt");
  };

  if(view==="receipt"&&selected)return <ReceiptView o={selected} onBack={()=>setView("list")}/>;
  if(view==="create")return(
    <div>
      <button onClick={()=>{setView("list");clearInit?.();}} style={backBtn}>← Back to Orders</button>
      <OrderForm initCheckup={formCheckup} user={user} onSave={handleCreate} onCancel={()=>{setView("list");clearInit?.();}}/>
    </div>
  );
  return(
    <div>
      {confirm&&<ConfirmDialog {...confirm}/>}
      {editTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:16,overflowY:"auto"}}>
          <div style={{width:"100%",maxWidth:580,marginTop:16}}>
            <OrderForm initial={editTarget} user={user}
              onSave={o=>{setOrders(p=>p.map(x=>x.id===editTarget.id?{...editTarget,...o,id:editTarget.id,rc:editTarget.rc}:x));setEditTarget(null);}}
              onCancel={()=>setEditTarget(null)}/>
          </div>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:0,letterSpacing:"-0.5px"}}>Orders</h2>
        {can(user.roles,"addOrder")&&<button onClick={()=>setView("create")} style={btn}>+ New Order</button>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {[...orders].reverse().map(o=>(
          <div key={o.id} style={card}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div><div style={{fontSize:15,fontWeight:800,color:"#1e293b"}}>{o.name}</div><div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{o.rc} · {o.id} · {o.date}</div></div>
              <StatusBadge status={o.status} small/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:10,background:o.src==="Internal"?TL:"#f0f9ff",color:o.src==="Internal"?T:"#0369a1",padding:"2px 9px",borderRadius:20,fontWeight:700}}>{o.src}</span>
              {o.glasses.map(g=><span key={g} style={{fontSize:10,background:"#f8fafc",color:"#475569",padding:"2px 9px",borderRadius:20}}>{g}</span>)}
            </div>
            {o.framePhoto&&<div style={{marginBottom:8}}><img src={o.framePhoto} style={{width:56,height:56,objectFit:"cover",borderRadius:8,border:`1.5px solid ${T}30`}}/></div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:12,color:"#64748b"}}><b style={{color:"#1e293b"}}>₹{o.total.toLocaleString("en-IN")}</b>{o.rem>0&&<span style={{color:"#d97706"}}> · Bal ₹{o.rem.toLocaleString("en-IN")}</span>}{o.rem===0&&<span style={{color:"#16a34a"}}> · Paid ✓</span>}</span>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>{setSelected(o);setView("receipt");}} style={{...btnSm,background:TL,color:T}}>🧾</button>
                {can(user.roles,"editOrder")&&<button onClick={()=>setEditTarget(o)} style={{...btnSm,background:"#f0f9ff",color:"#0284C7"}}>✏️</button>}
                {can(user.roles,"deleteOrder")&&<button onClick={()=>setConfirm({title:"Delete Order",message:`Delete order "${o.rc}" for ${o.name}?`,danger:true,onConfirm:()=>{setOrders(p=>p.filter(x=>x.id!==o.id));setConfirm(null);},onCancel:()=>setConfirm(null)})} style={{...btnSm,background:"#fef2f2",color:"#dc2626"}}>🗑️</button>}
              </div>
            </div>
          </div>
        ))}
        {orders.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:48}}>No orders yet</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   WORKFLOW PANEL
════════════════════════════════════════════════════════════ */
function WorkflowPanel({o,user,onUpdate}){
  const [gVendor,setGVendor]=useState(o.vendor||"");
  const [gTypes,setGTypes]=useState(o.glasses||[]);
  const [fitFitter,setFitFitter]=useState("");
  const [fitDate,setFitDate]=useState("");
  const [delPay,setDelPay]=useState("");
  const [delMode,setDelMode]=useState("Cash");
  const roles=user.roles;
  if(o.status==="Delivered") return roles.includes("Admin")?<div style={{background:"#f0fdf4",borderRadius:10,padding:12,fontSize:12,color:"#15803d",fontWeight:700,display:"flex",alignItems:"center",gap:8}}>✅ Delivered — Admin can edit via Orders</div>:<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0",fontStyle:"italic"}}>Delivered & locked.</div>;
  if(o.status==="Order Created"){if(!can(roles,"glassAction"))return <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>Awaiting Glass Operator</div>;return(<div style={{background:TLL,borderRadius:10,padding:14,border:`1px solid ${TL}`}}><div style={{fontSize:12,fontWeight:800,color:T,marginBottom:12}}>🔭 Glass Operator</div><div style={{marginBottom:10}}><label style={lbl}>Vendor *</label><select style={inp} value={gVendor} onChange={e=>setGVendor(e.target.value)}><option value="">Select…</option>{VENDORS.map(v=><option key={v}>{v}</option>)}</select></div><div style={{marginBottom:12}}><label style={lbl}>Glass Types *</label><div style={{marginTop:5,display:"flex",flexWrap:"wrap",gap:5}}>{GLASS_TYPES.map(g=><button key={g} onClick={()=>setGTypes(p=>p.includes(g)?p.filter(x=>x!==g):[...p,g])} style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${gTypes.includes(g)?T:"#e2e8f0"}`,background:gTypes.includes(g)?TL:"white",color:gTypes.includes(g)?T:"#64748b",fontSize:11,cursor:"pointer"}}>{g}</button>)}</div></div><button onClick={()=>{if(!gVendor)return alert("Select vendor");if(!gTypes.length)return alert("Select glass types");onUpdate({status:"Glass Ordered",vendor:gVendor,glasses:gTypes,ordDate:new Date().toISOString().slice(0,10)});}} style={btn}>Mark Glass Ordered ✓</button></div>);}
  if(o.status==="Glass Ordered"){if(!can(roles,"glassAction"))return <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>Awaiting arrival</div>;return(<div style={{background:"#fffbeb",borderRadius:10,padding:14,border:"1px solid #fde68a"}}><div style={{fontSize:12,fontWeight:800,color:"#b45309",marginBottom:8}}>🔭 Confirm Glass Arrival</div><div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Vendor: <b>{o.vendor}</b> · Ordered: {o.ordDate}</div><button onClick={()=>onUpdate({status:"Glass Arrived",arrDate:new Date().toISOString().slice(0,10)})} style={{...btn,background:"#b45309"}}>Mark Glass Arrived ✓</button></div>);}
  if(o.status==="Glass Arrived"){if(!can(roles,"fitterAction"))return <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>Awaiting Fitter</div>;return(<div style={{background:"#e0f2fe",borderRadius:10,padding:14,border:"1px solid #bae6fd"}}><div style={{fontSize:12,fontWeight:800,color:"#0369a1",marginBottom:12}}>🔧 Assign Fitter</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}><div><label style={lbl}>Fitter *</label><select style={inp} value={fitFitter} onChange={e=>setFitFitter(e.target.value)}><option value="">Select…</option>{FITTERS.map(f=><option key={f}>{f}</option>)}</select></div><div><label style={lbl}>Ready Date</label><input type="date" style={inp} value={fitDate} onChange={e=>setFitDate(e.target.value)}/></div></div><button onClick={()=>{if(!fitFitter)return alert("Assign a fitter");onUpdate({status:"Processing",fitter:fitFitter,specDate:fitDate});}} style={{...btn,background:"#0369a1"}}>Start Processing ✓</button></div>);}
  if(o.status==="Processing"){if(!can(roles,"fitterAction"))return <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>Processing…</div>;return(<div style={{background:"#f0fdf4",borderRadius:10,padding:14,border:"1px solid #bbf7d0"}}><div style={{fontSize:12,fontWeight:800,color:"#15803d",marginBottom:8}}>🔧 Mark Completed</div><div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Fitter: <b>{o.fitter}</b>{o.specDate&&` · Ready: ${o.specDate}`}</div><button onClick={()=>onUpdate({status:"Completed"})} style={{...btn,background:"#15803d"}}>Mark Completed ✓</button></div>);}
  if(o.status==="Completed"){if(!can(roles,"deliveryAction"))return <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>Ready for delivery</div>;return(<div style={{background:TLL,borderRadius:10,padding:14,border:`1px solid ${TL}`}}><div style={{fontSize:12,fontWeight:800,color:T,marginBottom:12}}>🚚 Deliver & Collect</div>{o.rem>0&&<div style={{marginBottom:10}}><label style={lbl}>Final Payment — Pending ₹{o.rem.toLocaleString("en-IN")}</label><input type="number" style={inp} value={delPay} onChange={e=>setDelPay(e.target.value)} inputMode="numeric"/></div>}{o.rem===0&&<div style={{fontSize:12,color:"#16a34a",fontWeight:700,marginBottom:10}}>✓ Fully paid</div>}<div style={{display:"flex",gap:8,marginBottom:12}}>{["Cash","UPI","Card"].map(m=><button key={m} onClick={()=>setDelMode(m)} style={{flex:1,padding:9,borderRadius:8,border:`1.5px solid ${delMode===m?T:"#e2e8f0"}`,background:delMode===m?TL:"white",color:delMode===m?T:"#94a3b8",fontSize:12,fontWeight:delMode===m?800:500,cursor:"pointer"}}>{m}</button>)}</div><button onClick={()=>{const fp=+(delPay||0),nr=Math.max(0,o.rem-fp);if(nr>0)return alert(`₹${nr.toLocaleString("en-IN")} still pending`);onUpdate({status:"Delivered",rem:0,adv:o.adv+fp,pm:delMode});}} style={btn}>🚚 Mark Delivered ✓</button></div>);}
  return null;
}

/* ════════════════════════════════════════════════════════════
   PIPELINE
════════════════════════════════════════════════════════════ */
function Pipeline({orders,setOrders,user}){
  const [tab,setTab]=useState("All");
  const [exp,setExp]=useState(null);
  const [recView,setRV]=useState(null);
  const [editTarget,setEditTarget]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const filtered=useMemo(()=>tab==="All"?orders:orders.filter(o=>o.status===tab),[orders,tab]);
  const counts=useMemo(()=>Object.fromEntries(STATUSES.map(s=>[s,orders.filter(o=>o.status===s).length])),[orders]);
  const upd=(id,patch)=>setOrders(p=>p.map(o=>o.id===id?{...o,...patch,updatedAt:new Date().toISOString()}:o));
  if(recView)return <ReceiptView o={recView} onBack={()=>setRV(null)}/>;
  return(
    <div>
      {confirm&&<ConfirmDialog {...confirm}/>}
      {editTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:16,overflowY:"auto"}}>
          <div style={{width:"100%",maxWidth:580,marginTop:16}}>
            <OrderForm initial={editTarget} user={user} onSave={o=>{setOrders(p=>p.map(x=>x.id===editTarget.id?{...editTarget,...o,id:editTarget.id,rc:editTarget.rc}:x));setEditTarget(null);}} onCancel={()=>setEditTarget(null)}/>
          </div>
        </div>
      )}
      <h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:"0 0 16px",letterSpacing:"-0.5px"}}>Order Pipeline</h2>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:20,scrollbarWidth:"none"}}>
        {["All",...STATUSES].map(t=>{const cnt=t==="All"?orders.length:counts[t],m=t!=="All"?SS[t]:null,a=tab===t;return<button key={t} onClick={()=>setTab(t)} style={{flexShrink:0,padding:"7px 14px",borderRadius:24,border:`1.5px solid ${a?(m?.dot||T):"#e2e8f0"}`,background:a?(m?.bg||TL):"white",color:a?(m?.c||T):"#64748b",fontSize:11,fontWeight:a?800:500,cursor:"pointer",whiteSpace:"nowrap"}}>{t}{cnt>0?` (${cnt})`:""}</button>;})}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map(o=>(
          <div key={o.id} style={{...card,padding:0,overflow:"hidden"}}>
            <div onClick={()=>setExp(e=>e===o.id?null:o.id)} style={{padding:16,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}><span style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{o.name}</span><StatusBadge status={o.status} small/></div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{o.rc} · {o.phone} · {o.date}</div>
              </div>
              <span style={{color:"#cbd5e1",fontSize:13,flexShrink:0}}>{exp===o.id?"▲":"▼"}</span>
            </div>
            {exp===o.id&&(
              <div style={{borderTop:"1px solid #f8fafc",padding:16}}>
                <StepProgress status={o.status}/>
                {o.framePhoto&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Frame Photo</div><img src={o.framePhoto} style={{width:72,height:72,objectFit:"cover",borderRadius:9,border:`1.5px solid ${T}30`}}/></div>}
                <EyeGrid re={o.re} le={o.le}/>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"10px 0"}}>{o.glasses.map(g=><span key={g} style={{fontSize:10,background:"#f8fafc",color:"#475569",padding:"3px 10px",borderRadius:20,border:"1px solid #e2e8f0"}}>{g}</span>)}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                  {[["Total","#1e293b",o.total],["Advance",T,o.adv],["Balance",o.rem>0?"#d97706":"#16a34a",o.rem]].map(([k,c,v])=>(
                    <div key={k} style={{textAlign:"center",background:"#f8fafc",borderRadius:8,padding:9}}><div style={{fontSize:9,color:"#94a3b8",fontWeight:800,textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:14,fontWeight:900,color:c}}>₹{v.toLocaleString("en-IN")}</div></div>
                  ))}
                </div>
                {(o.vendor||o.fitter)&&<div style={{display:"flex",gap:14,fontSize:11,color:"#64748b",marginBottom:12,flexWrap:"wrap"}}>{o.vendor&&<span>🏭 {o.vendor}</span>}{o.fitter&&<span>🔧 {o.fitter}</span>}</div>}
                <WorkflowPanel o={o} user={user} onUpdate={patch=>upd(o.id,patch)}/>
                <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #f8fafc",display:"flex",gap:7,flexWrap:"wrap"}}>
                  <button onClick={()=>setRV(o)} style={{...btnSm,background:TL,color:T}}>🧾 Receipt</button>
                  {can(user.roles,"editOrder")&&<button onClick={()=>setEditTarget(o)} style={{...btnSm,background:"#f0f9ff",color:"#0284C7"}}>✏️ Edit</button>}
                  {can(user.roles,"deleteOrder")&&<button onClick={()=>setConfirm({title:"Delete Order",message:`Delete "${o.rc}" for ${o.name}?`,danger:true,onConfirm:()=>{setOrders(p=>p.filter(x=>x.id!==o.id));setConfirm(null);},onCancel:()=>setConfirm(null)})} style={{...btnSm,background:"#fef2f2",color:"#dc2626"}}>🗑️ Delete</button>}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:48}}>No orders in this stage</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
function Dashboard({orders}){
  const today=new Date().toISOString().slice(0,10);
  const todayAdv=orders.filter(o=>o.date===today).reduce((s,o)=>s+o.adv,0);
  const pendBal=orders.filter(o=>o.rem>0&&o.status!=="Delivered").reduce((s,o)=>s+o.rem,0);
  const monthly=orders.reduce((s,o)=>s+o.total,0);
  const bySM=orders.reduce((a,o)=>{a[o.by]=(a[o.by]||0)+o.total;return a;},{});
  return(
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:0,letterSpacing:"-0.5px"}}>Dashboard</h2><p style={{fontSize:12,color:"#94a3b8",margin:"4px 0 0"}}>{new Date().toDateString()}</p></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[{label:"Today's Collection",val:`₹${todayAdv.toLocaleString("en-IN")}`,col:T,sub:"Advance collected"},{label:"Pending Balance",val:`₹${pendBal.toLocaleString("en-IN")}`,col:"#D97706",sub:"Active orders"},{label:"Active Orders",val:orders.filter(o=>o.status!=="Delivered").length,col:"#2563EB",sub:"In pipeline"},{label:"Monthly Revenue",val:`₹${monthly.toLocaleString("en-IN")}`,col:"#7C3AED",sub:"All orders"}].map(s=>(
          <div key={s.label} style={{...card,padding:"15px 14px"}}><div style={{fontSize:22,fontWeight:900,color:s.col}}>{s.val}</div><div style={{fontSize:11,fontWeight:700,color:"#334155",marginTop:4}}>{s.label}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{s.sub}</div></div>
        ))}
      </div>
      <div style={{...card,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:"#334155",marginBottom:14}}>Pipeline Overview</div>
        {STATUSES.map(s=>{const cnt=orders.filter(o=>o.status===s).length,m=SS[s],pct=orders.length?cnt/orders.length*100:0;return(
          <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:6,minWidth:112}}><span style={{width:7,height:7,borderRadius:"50%",background:m.dot}}/><span style={{fontSize:11,color:"#475569"}}>{s}</span></div><div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:6,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:m.dot,borderRadius:6}}/></div><span style={{fontSize:12,fontWeight:800,color:m.c,minWidth:18,textAlign:"right"}}>{cnt}</span></div>
        );})}
      </div>
      <div style={card}>
        <div style={{fontSize:13,fontWeight:800,color:"#334155",marginBottom:12}}>Sales by Staff</div>
        {Object.entries(bySM).sort((a,b)=>b[1]-a[1]).map(([n,t])=>(
          <div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:9,background:TL,color:T,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900}}>{n[0]}</div><span style={{fontSize:13,color:"#334155"}}>{n}</span></div>
            <span style={{fontSize:13,fontWeight:800,color:T}}>₹{t.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   REPORTS
════════════════════════════════════════════════════════════ */
function Reports({orders}){
  const monthly=orders.reduce((s,o)=>s+o.total,0),collected=orders.reduce((s,o)=>s+o.adv,0),pending=orders.filter(o=>o.rem>0&&o.status!=="Delivered").reduce((s,o)=>s+o.rem,0);
  const bySM=orders.reduce((a,o)=>{a[o.by]=(a[o.by]||0)+o.total;return a;},{});
  return(
    <div>
      <h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:"0 0 20px",letterSpacing:"-0.5px"}}>Reports</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[{label:"Total Revenue",val:`₹${monthly.toLocaleString("en-IN")}`,col:T},{label:"Total Collected",val:`₹${collected.toLocaleString("en-IN")}`,col:"#2563EB"},{label:"Pending Balance",val:`₹${pending.toLocaleString("en-IN")}`,col:"#D97706"},{label:"Total Orders",val:orders.length,col:"#7C3AED"}].map(s=>(
          <div key={s.label} style={{...card,padding:"15px 14px"}}><div style={{fontSize:22,fontWeight:900,color:s.col}}>{s.val}</div><div style={{fontSize:11,fontWeight:700,color:"#64748b",marginTop:4}}>{s.label}</div></div>
        ))}
      </div>
      <div style={{...card,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:"#334155",marginBottom:14}}>Status Breakdown</div>
        {STATUSES.map(s=>{const cnt=orders.filter(o=>o.status===s).length,m=SS[s],pct=orders.length?cnt/orders.length*100:0;return(
          <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:6,minWidth:112}}><span style={{width:7,height:7,borderRadius:"50%",background:m.dot}}/><span style={{fontSize:11,color:"#475569"}}>{s}</span></div><div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:6,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:m.dot,borderRadius:6}}/></div><span style={{fontSize:12,fontWeight:800,color:m.c,minWidth:18,textAlign:"right"}}>{cnt}</span></div>
        );})}
      </div>
      <div style={card}>
        <div style={{fontSize:13,fontWeight:800,color:"#334155",marginBottom:12}}>Sales by Staff</div>
        {Object.entries(bySM).sort((a,b)=>b[1]-a[1]).map(([n,t])=>(
          <div key={n} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:9,background:TL,color:T,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900}}>{n[0]}</div><span style={{fontSize:13,color:"#334155"}}>{n}</span></div>
            <span style={{fontSize:13,fontWeight:800,color:T}}>₹{t.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   NAV
════════════════════════════════════════════════════════════ */
const NAV=[
  {id:"dashboard",label:"Home",    icon:"📊",perm:"dashboard"},
  {id:"checkups", label:"Checkups",icon:"👁️", perm:"checkups"},
  {id:"orders",   label:"Orders",  icon:"📋",perm:"orders"},
  {id:"pipeline", label:"Pipeline",icon:"🔄",perm:"pipeline"},
  {id:"reports",  label:"Reports", icon:"📈",perm:"reports"},
  {id:"users",    label:"Users",   icon:"👥",perm:"manageUsers"},
];

/* ════════════════════════════════════════════════════════════
   ROOT APP — SharedDB via window.storage (shared=true)
   All writes are visible to every user on every device
════════════════════════════════════════════════════════════ */
export default function App(){
  const [ready,    setReady]   =useState(false);
  const [dbErr,    setDbErr]   =useState(false);
  const [users,    setUsersRaw]=useState(SEED_USERS);
  const [checkups, setChkRaw]  =useState(SEED_CHECKUPS);
  const [orders,   setOrdRaw]  =useState(SEED_ORDERS);
  const [counters, setCntRaw]  =useState(SEED_COUNTERS);
  const [currentUser,setCurrentUser]=useState(null);
  const [view,     setView]    =useState("dashboard");
  const [initCheckup,setIC]    =useState(null);
  const [syncStatus,setSync]   =useState(""); // "" | "saved" | "syncing" | "error"
  const saveTimer=useRef(null);
  const pollTimer=useRef(null);

  /* ── Initial load */
  useEffect(()=>{
    SharedDB.loadAll().then(data=>{
      setUsersRaw(data.users);setChkRaw(data.checkups);setOrdRaw(data.orders);setCntRaw(data.counters);
      setReady(true);
    }).catch(()=>{setReady(true);setDbErr(true);});
  },[]);

  /* ── Live sync poll every 8 seconds (picks up changes from other users/devices) */
  useEffect(()=>{
    if(!ready)return;
    pollTimer.current=setInterval(async()=>{
      try{
        const [u,c,o,cnt]=await Promise.all([SharedDB.poll("users"),SharedDB.poll("checkups"),SharedDB.poll("orders"),SharedDB.poll("counters")]);
        if(u)setUsersRaw(u);if(c)setChkRaw(c);if(o)setOrdRaw(o);if(cnt)setCntRaw(cnt);
      }catch{}
    },8000);
    return()=>clearInterval(pollTimer.current);
  },[ready]);

  /* ── Debounced save (triggers 600ms after last state change) */
  const persist=useCallback((u,c,o,cnt)=>{
    setSync("syncing");
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      const ok=await Promise.all([SharedDB.save("users",u),SharedDB.save("checkups",c),SharedDB.save("orders",o),SharedDB.save("counters",cnt)]);
      if(ok.every(Boolean)){setSync("saved");setTimeout(()=>setSync(""),2500);}
      else setSync("error");
    },600);
  },[]);

  /* Wrapped setters → auto-persist on every change */
  const setUsers=   v=>{const n=typeof v==="function"?v(users):v;    setUsersRaw(n);    persist(n,checkups,orders,counters);};
  const setCheckups=v=>{const n=typeof v==="function"?v(checkups):v; setChkRaw(n);      persist(users,n,orders,counters);};
  const setOrders=  v=>{const n=typeof v==="function"?v(orders):v;   setOrdRaw(n);      persist(users,checkups,n,counters);};
  const setCounters=v=>{const n=typeof v==="function"?v(counters):v; setCntRaw(n);      persist(users,checkups,orders,n);};

  /* ── Loading splash */
  if(!ready)return(
    <div style={{minHeight:"100vh",background:"#040f0c",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{fontSize:58,marginBottom:16,filter:"drop-shadow(0 0 28px #1A8C6A88)"}}>👓</div>
      <h1 style={{color:"white",fontSize:28,fontWeight:900,margin:0,letterSpacing:"-1px"}}>Opti<span style={{color:T2}}>Flow</span></h1>
      <p style={{color:"rgba(255,255,255,0.35)",margin:"14px 0 0",fontSize:13}}>Connecting to shared database…</p>
      <div style={{width:200,height:3,background:"rgba(255,255,255,0.1)",borderRadius:3,marginTop:24,overflow:"hidden"}}>
        <div style={{height:"100%",background:T2,borderRadius:3,animation:"prog 1.5s ease-in-out infinite"}}/>
      </div>
      <style>{`@keyframes prog{0%{width:0;marginLeft:0}50%{width:60%;marginLeft:20%}100%{width:0;marginLeft:100%}}`}</style>
    </div>
  );

  if(!currentUser)return <LoginScreen users={users} onLogin={u=>{setCurrentUser(u);const first=NAV.find(n=>can(u.roles,n.perm));setView(first?.id||"pipeline");}}/>;

  const navItems=NAV.filter(n=>can(currentUser.roles,n.perm));
  const navTo=id=>{if(id!=="orders")setIC(null);setView(id);};

  const syncDot=syncStatus==="saved"?{bg:TL,color:T,text:"✓ Saved to DB"}:syncStatus==="syncing"?{bg:"#fef3c7",color:"#b45309",text:"Syncing…"}:syncStatus==="error"?{bg:"#fef2f2",color:"#dc2626",text:"Sync failed"}:null;

  return(
    <div style={{minHeight:"100vh",background:"#f5f7fa",fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif"}}>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"white",borderBottom:"1px solid #f1f5f9",padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>👓</span>
          <span style={{fontSize:18,fontWeight:900,color:T,letterSpacing:"-0.8px"}}>Opti<span style={{color:T2}}>Flow</span></span>
          {syncDot&&<span style={{fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20,background:syncDot.bg,color:syncDot.color,whiteSpace:"nowrap"}}>{syncDot.text}</span>}
          {dbErr&&<span style={{fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20,background:"#fef3c7",color:"#b45309"}}>Offline mode</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#1e293b"}}>{currentUser.name}</div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"flex-end",marginTop:2}}>{currentUser.roles.map(r=><RolePill key={r} role={r} small/>)}</div>
          </div>
          <button onClick={()=>{setCurrentUser(null);setView("dashboard");setIC(null);}} style={{width:34,height:34,borderRadius:9,background:"#f8fafc",border:"1px solid #e2e8f0",color:"#64748b",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}} title="Logout">↪</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"20px 16px 88px",maxWidth:640,margin:"0 auto"}}>
        {view==="dashboard"&&can(currentUser.roles,"dashboard")   &&<Dashboard orders={orders}/>}
        {view==="checkups" &&can(currentUser.roles,"checkups")    &&<EyeCheckups checkups={checkups} setCheckups={setCheckups} user={currentUser} onOrderFromCheckup={c=>{setIC(c);setView("orders");}} counters={counters} setCounters={setCounters}/>}
        {view==="orders"   &&can(currentUser.roles,"orders")      &&<Orders key={initCheckup?.id||"fresh"} orders={orders} setOrders={setOrders} checkups={checkups} setCheckups={setCheckups} user={currentUser} initCheckup={initCheckup} clearInit={()=>setIC(null)} counters={counters} setCounters={setCounters}/>}
        {view==="pipeline" &&can(currentUser.roles,"pipeline")    &&<Pipeline orders={orders} setOrders={setOrders} user={currentUser}/>}
        {view==="reports"  &&can(currentUser.roles,"reports")     &&<Reports orders={orders}/>}
        {view==="users"    &&can(currentUser.roles,"manageUsers") &&<UserManagement users={users} setUsers={setUsers}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-around",padding:"8px 0 max(8px,env(safe-area-inset-bottom,8px))",zIndex:50,boxShadow:"0 -1px 10px rgba(0,0,0,0.05)"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>navTo(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",padding:"2px 8px",minWidth:44}}>
            <span style={{fontSize:20,opacity:view===n.id?1:0.3,transition:"opacity 0.15s"}}>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:800,color:view===n.id?T:"#94a3b8"}}>{n.label}</span>
            {view===n.id&&<span style={{width:14,height:2.5,background:T,borderRadius:2,marginTop:1}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
