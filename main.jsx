// ╔══════════════════════════════════════════════════════════════╗
// ║  BW PRODUÇÕES — Sistema de Aprovação de Conteúdo            ║
// ║  Versão Supabase — dados em tempo real                      ║
// ║                                                              ║
// ║  CONFIGURE AQUI ANTES DE PUBLICAR:                          ║
// ╚══════════════════════════════════════════════════════════════╝
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

var SUPABASE_URL = "https://inzcoabyzfdskwbksjip.supabase.co";
var SUPABASE_KEY = "sb_publishable_q7skA7kXZrlJyTBzAJpdXQ_il1CZV2X";

// ── SUPABASE CLIENT (sem biblioteca — fetch puro) ─────────────────────────────
function sbHeaders() {
  return { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY, "Prefer": "return=representation" };
}
async function sbSelect(table, filter) {
  var url = SUPABASE_URL + "/rest/v1/" + table + "?" + (filter || "");
  var r = await fetch(url, { headers: sbHeaders() });
  if (!r.ok) return [];
  return r.json();
}
async function sbInsert(table, row) {
  var r = await fetch(SUPABASE_URL + "/rest/v1/" + table, { method: "POST", headers: sbHeaders(), body: JSON.stringify(row) });
  return r.ok;
}
async function sbUpdate(table, id, data) {
  var r = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?id=eq." + id, { method: "PATCH", headers: sbHeaders(), body: JSON.stringify(data) });
  return r.ok;
}
async function sbDelete(table, id) {
  var r = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?id=eq." + id, { method: "DELETE", headers: sbHeaders() });
  return r.ok;
}

// ── IDENTIDADE BW PRODUÇÕES ───────────────────────────────────────────────────
var BG      = "#0a0a0a";
var BG2     = "#111111";
var CARD    = "#161616";
var CARD2   = "#1c1c1c";
var BORDER  = "#2a2a2a";
var BORDER2 = "#333333";
var WHITE   = "#ffffff";
var W60     = "rgba(255,255,255,0.6)";
var W30     = "rgba(255,255,255,0.3)";
var W10     = "rgba(255,255,255,0.08)";
var W05     = "rgba(255,255,255,0.04)";
var MUTED   = "#666666";
var MUTED2  = "#3a3a3a";
var GREEN   = "#7fff7f";
var REDC    = "#ff6b6b";

var STATUS = {
  pending:  { label: "Aguardando", color: WHITE, bg: W10,                       border: BORDER2,                   icon: "◐" },
  approved: { label: "Aprovado",   color: GREEN, bg: "rgba(127,255,127,0.08)",  border: "rgba(127,255,127,0.25)",  icon: "✓" },
  revision: { label: "Revisão",    color: REDC,  bg: "rgba(255,107,107,0.08)",  border: "rgba(255,107,107,0.25)",  icon: "↩" },
};

var PLATFORMS     = ["Instagram","Facebook","LinkedIn","TikTok","Twitter/X","YouTube","Pinterest"];
var CONTENT_AREAS = ["Feed","Story"];

var CLIENTS = [
  { id: "gris",      name: "Gris",      pin: "grisbw123"      },
  { id: "flavia",    name: "Flávia",    pin: "fláviabw123"    },
  { id: "noah",      name: "Noah",      pin: "noahbw123"      },
  { id: "q3",        name: "Q3",        pin: "q3bw123"        },
  { id: "bizinelli", name: "Bizinelli", pin: "bizinellibw123" },
  { id: "essencial", name: "Essencial", pin: "essencialbw123" },
  { id: "r3",        name: "R3",        pin: "r3bw123"        },
  { id: "gruposul",  name: "Grupo Sul", pin: "grupo sulbw123" },
  { id: "prismat",   name: "Prismat",   pin: "prismatbw123"   },
];
var CLIENT_MAP = {};
CLIENTS.forEach(function(c) { CLIENT_MAP[c.id] = c; });
var CREATOR = { id: "bwcreator", name: "BW Produções", role: "creator", pin: "bwadmin2026" };

var CSS_TEXT = [
  "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');",
  "* { box-sizing: border-box; margin: 0; padding: 0; }",
  "body { background: #0a0a0a; font-family: 'DM Sans', sans-serif; color: #fff; }",
  "::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }",
  "input, textarea, select { font-family: 'DM Sans', sans-serif; color: #fff; }",
  "select option { background: #161616; color: #fff; }",
  "@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }",
  ".pcard { animation: fadeUp .28s ease; transition: border-color .18s; }",
  ".pcard:hover { border-color: #3a3a3a !important; }",
  ".bw { transition: all .18s; } .bw:hover { opacity: .8; }",
  ".btn-inv:hover { background: rgba(255,255,255,0.85) !important; }",
  ".btn-ghost:hover { background: rgba(255,255,255,0.06) !important; }",
  ".btn-green:hover { background: rgba(127,255,127,0.15) !important; }",
  ".btn-red:hover { background: rgba(255,107,107,0.15) !important; }",
].join("\n");

var uid = function() { return Math.random().toString(36).slice(2, 10); };
function fmtDate(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}
function fmtDT(d) {
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}
function isVid(url, type) {
  if (!url) return false;
  // Se começa com data: é upload direto — checa o tipo do base64
  if (url.startsWith("data:")) {
    return url.startsWith("data:video/");
  }
  if (type === "Vídeo" || type === "Reels/Short") return true;
  if (/\.(mp4|webm|ogg|mov)$/i.test(url)) return true;
  if (url.indexOf("youtube") >= 0 || url.indexOf("youtu.be") >= 0) return true;
  if (url.indexOf("vimeo") >= 0) return true;
  return false;
}

// ── LOGO ──────────────────────────────────────────────────────────────────────
function LogoBW({ size }) {
  var s = size || 28;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: s, height: s, borderRadius: "50%", background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: s * 0.52, color: BG, letterSpacing: "1px" }}>BW</span>
      </div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: s * 0.72, color: WHITE, letterSpacing: "3px", lineHeight: 1 }}>BW PRODUÇÕES</div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  var [usuario, setUsuario] = useState("");
  var [senha, setSenha] = useState("");
  var [err, setErr] = useState("");
  var senhaRef = useRef();

  function tryLogin() {
    var u = usuario.trim().toLowerCase();
    var s = senha.trim();
    if (!u || !s) { setErr("Preencha usuário e senha."); return; }
    if ((u === "bw" || u === "bwproducoes") && s === CREATOR.pin) {
      onLogin({ role: "creator", id: CREATOR.id, name: CREATOR.name }); return;
    }
    var found = null;
    CLIENTS.forEach(function(c) {
      if (s === c.pin) {
        var cN = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        var uN = u.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (u === c.id || uN === cN) found = c;
      }
    });
    if (found) { onLogin({ role: "client", id: found.id, name: found.name }); return; }
    setErr("Usuário ou senha incorretos."); setSenha(""); if (senhaRef.current) senhaRef.current.focus();
  }

  var deco = { position: "absolute", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" };
  var inp  = { width: "100%", background: W05, border: "1px solid " + BORDER2, borderRadius: 8, padding: "13px 14px", color: WHITE, fontSize: 14, outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{CSS_TEXT}</style>
      <div style={{ ...deco, top: -140, right: -140, width: 420, height: 420 }} />
      <div style={{ ...deco, top: -70,  right: -70,  width: 240, height: 240, borderColor: "rgba(255,255,255,0.06)" }} />
      <div style={{ ...deco, bottom: -100, left: -100, width: 320, height: 320 }} />
      <div style={{ width: "100%", maxWidth: 380, animation: "fadeUp .55s ease", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: BG, letterSpacing: "1px" }}>BW</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: WHITE, letterSpacing: "5px", marginBottom: 6 }}>BW PRODUÇÕES</div>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: "2px" }}>SISTEMA DE APROVAÇÃO DE CONTEÚDO</div>
        </div>
        <div style={{ background: W10, border: "1px solid " + BORDER, borderRadius: 14, padding: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>USUÁRIO</div>
              <input value={usuario} onChange={function(e) { setUsuario(e.target.value); setErr(""); }}
                onKeyDown={function(e) { if (e.key === "Enter" && senhaRef.current) senhaRef.current.focus(); }}
                style={inp} placeholder="Digite seu usuário" autoComplete="username" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>SENHA</div>
              <input ref={senhaRef} type="password" value={senha}
                onChange={function(e) { setSenha(e.target.value); setErr(""); }}
                onKeyDown={function(e) { if (e.key === "Enter") tryLogin(); }}
                style={{ ...inp, border: err ? "1px solid " + REDC : "1px solid " + BORDER2 }}
                placeholder="Digite sua senha" autoComplete="current-password" />
            </div>
            {err && <div style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,.25)", borderRadius: 7, padding: "10px 14px" }}>
              <p style={{ color: REDC, fontSize: 12, margin: 0 }}>{err}</p>
            </div>}
            <button className="btn-inv" onClick={tryLogin}
              style={{ width: "100%", background: WHITE, border: "none", borderRadius: 8, padding: 15, fontWeight: 700, fontSize: 13, cursor: "pointer", color: BG, letterSpacing: "2px", marginTop: 4 }}>
              ENTRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MEDIA PREVIEW ─────────────────────────────────────────────────────────────
function MediaPreview({ url, mediaType, height, width }) {
  var h = height || 110; var w = width || "100%";
  if (!url) return (
    <div style={{ width: w, height: h, background: CARD2, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 5, color: MUTED2, fontSize: 10, flexShrink: 0 }}>
      <span style={{ fontSize: 20, opacity: 0.3 }}>◻</span><span style={{ letterSpacing: "1px" }}>SEM MÍDIA</span>
    </div>
  );
  var vid = isVid(url, mediaType);
  if (vid) {
    var ytM = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
    if (ytM) return <div style={{ width: w, height: h, background: "#000", flexShrink: 0 }}><iframe src={"https://www.youtube.com/embed/" + ytM[1]} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen title="yt" /></div>;
    var vmM = url.match(/vimeo\.com\/(\d+)/);
    if (vmM) return <div style={{ width: w, height: h, background: "#000", flexShrink: 0 }}><iframe src={"https://player.vimeo.com/video/" + vmM[1]} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen title="vim" /></div>;
    return <div style={{ width: w, height: h, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><video src={url} controls style={{ maxWidth: "100%", maxHeight: "100%" }} /></div>;
  }
  return <div style={{ width: w, height: h, overflow: "hidden", flexShrink: 0 }}><img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={function(e) { e.target.style.display = "none"; }} /></div>;
}

// ── COMENTÁRIOS ───────────────────────────────────────────────────────────────
function CommentsPanel({ postId, clientId, currentUser, onReload }) {
  var [list, setList]   = useState([]);
  var [text, setText]   = useState("");
  var [loading, setLoading] = useState(true);
  var bottomRef = useRef();

  useEffect(function() {
    sbSelect("comments", "post_id=eq." + postId + "&client_id=eq." + clientId + "&order=created_at.asc")
      .then(function(rows) { setList(rows); setLoading(false); });
  }, [postId]);

  useEffect(function() { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [list.length]);

  function send() {
    if (!text.trim()) return;
    var comment = { id: uid(), post_id: postId, client_id: clientId, user_id: currentUser.id, user_name: currentUser.name, role: currentUser.role, body: text.trim(), created_at: Date.now() };
    sbInsert("comments", comment).then(function() {
      setList(function(l) { return l.concat([comment]); }); setText("");
    });
  }

  return (
    <div style={{ borderTop: "1px solid " + BORDER, padding: "16px 20px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14 }}>COMENTÁRIOS — {list.length}</div>
      <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {!loading && list.length === 0 && <p style={{ color: MUTED2, fontSize: 12, fontStyle: "italic" }}>Nenhum comentário ainda.</p>}
        {list.map(function(c) {
          var isBW = c.role === "creator";
          return (
            <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isBW ? WHITE : BORDER2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 10, color: isBW ? BG : WHITE }}>{isBW ? "BW" : c.user_name.slice(0,2).toUpperCase()}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: WHITE }}>{isBW ? "BW Produções" : c.user_name}</span>
                  <span style={{ fontSize: 10, color: MUTED }}>{fmtDT(c.created_at)}</span>
                </div>
                <div style={{ fontSize: 13, color: W60, lineHeight: 1.55, background: W05, borderRadius: 6, padding: "8px 12px", border: "1px solid " + BORDER }}>{c.body}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={function(e) { setText(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") send(); }}
          style={{ flex: 1, background: W05, border: "1px solid " + BORDER, borderRadius: 6, padding: "9px 12px", fontSize: 13, color: WHITE, outline: "none" }}
          placeholder="Escreva um comentário…" />
        <button className="btn-inv" onClick={send}
          style={{ background: WHITE, border: "none", borderRadius: 6, padding: "9px 16px", color: BG, fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: "1px" }}>ENVIAR</button>
      </div>
    </div>
  );
}

// ── CARROSSEL VIEWER ──────────────────────────────────────────────────────────
function CarouselViewer({ urls, mediaType, isStory, height, thumbSize }) {
  var [idx, setIdx] = useState(0);
  var list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
  if (list.length === 0) return <MediaPreview url={null} mediaType={mediaType} height={height} width="100%" />;

  // Story: aspect ratio 9:16 vertical. Feed: 4:5 ou paisagem
  var aspectStyle = isStory
    ? { width: "100%", maxWidth: 360, margin: "0 auto", aspectRatio: "9/16", position: "relative", background: "#000" }
    : { width: "100%", aspectRatio: "4/5", maxHeight: 600, position: "relative", background: "#000" };

  var ts = thumbSize || 52;

  return (
    <div>
      <div style={aspectStyle}>
        {isVid(list[idx], mediaType)
          ? <video src={list[idx]} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          : <img src={list[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        }
        {list.length > 1 && (
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", display: "flex", justifyContent: "space-between", padding: "0 10px", pointerEvents: "none" }}>
            <button onClick={function(e) { e.stopPropagation(); setIdx(function(i) { return i === 0 ? list.length - 1 : i - 1; }); }}
              style={{ pointerEvents: "all", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.65)", border: "none", color: WHITE, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <button onClick={function(e) { e.stopPropagation(); setIdx(function(i) { return i === list.length - 1 ? 0 : i + 1; }); }}
              style={{ pointerEvents: "all", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.65)", border: "none", color: WHITE, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          </div>
        )}
        {list.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
            {list.map(function(_, i) {
              return <div key={i} onClick={function() { setIdx(i); }} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? WHITE : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all .2s" }} />;
            })}
          </div>
        )}
        {/* Contador */}
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.6)", borderRadius: 4, padding: "3px 8px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: WHITE }}>{idx + 1}/{list.length}</span>
        </div>
      </div>

      {/* Miniaturas */}
      {list.length > 1 && (
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", background: CARD2 }}>
          {list.map(function(u, i) {
            return (
              <div key={i} onClick={function() { setIdx(i); }}
                style={{ width: ts, height: ts, flexShrink: 0, borderRadius: 6, overflow: "hidden", cursor: "pointer", border: i === idx ? "2px solid " + WHITE : "2px solid rgba(255,255,255,.15)", opacity: i === idx ? 1 : 0.55, transition: "all .2s" }}>
                {isVid(u, mediaType)
                  ? <div style={{ width: "100%", height: "100%", background: CARD2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
                  : <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── POST FORM ─────────────────────────────────────────────────────────────────
function PostForm({ initial, onSave, onClose, clientId, area }) {
  var initMedias = initial ? (initial.mediaUrls || (initial.mediaUrl ? [initial.mediaUrl] : [])) : [];
  var [form, setForm] = useState(initial || { title: "", caption: "", platform: "Instagram", area: area || "Feed", scheduledAt: "", hashtags: "", notes: "" });
  var [medias, setMedias] = useState(initMedias);
  var [urlInput, setUrlInput] = useState("");
  var [uploading, setUploading] = useState(false);
  var fileRef = useRef();

  function sf(k) { return function(e) { setForm(function(f) { var n = Object.assign({}, f); n[k] = e.target.value; return n; }); }; }

  function addUrl() {
    var u = urlInput.trim();
    if (!u) return;
    setMedias(function(m) { return m.concat([u]); });
    setUrlInput("");
  }

  function compressImage(file, quality, maxW) {
    return new Promise(function(resolve) {
      // Vídeos não comprimem
      if (file.type.startsWith("video/")) {
        var r = new FileReader();
        r.onload = function(ev) { resolve(ev.target.result); };
        r.readAsDataURL(file);
        return;
      }
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function() {
        var w = img.width;
        var h = img.height;
        var mw = maxW || 1920;
        if (w > mw) { h = Math.round(h * mw / w); w = mw; }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality || 0.85));
      };
      img.src = url;
    });
  }

  function handleFiles(e) {
    var files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    var loaded = 0;
    var results = [];
    files.forEach(function(file, i) {
      compressImage(file, 0.85, 1920).then(function(compressed) {
        results[i] = compressed;
        loaded++;
        if (loaded === files.length) {
          setMedias(function(m) { return m.concat(results); });
          setUploading(false);
        }
      });
    });
  }

  function removeMedia(i) { setMedias(function(m) { return m.filter(function(_, idx) { return idx !== i; }); }); }
  function moveUp(i)      { if (i === 0) return; setMedias(function(m) { var a = m.slice(); var t = a[i-1]; a[i-1] = a[i]; a[i] = t; return a; }); }
  function moveDown(i)    { setMedias(function(m) { if (i === m.length-1) return m; var a = m.slice(); var t = a[i+1]; a[i+1] = a[i]; a[i] = t; return a; }); }

  var inp = { width: "100%", background: W05, border: "1px solid " + BORDER, borderRadius: 8, padding: "11px 14px", fontSize: 14, color: WHITE, outline: "none" };
  var lbl = { display: "block", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ borderBottom: "1px solid " + BORDER, paddingBottom: 18 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: WHITE, letterSpacing: "2px" }}>{initial ? "EDITAR POST" : "NOVO POST"}</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{clientId ? (CLIENT_MAP[clientId] ? CLIENT_MAP[clientId].name : clientId) : "BW Produções"} — {form.area}</div>
      </div>
      <div><label style={lbl}>Título *</label><input style={inp} value={form.title} onChange={sf("title")} placeholder="Ex: Post Lançamento" /></div>
      <div><label style={lbl}>Legenda *</label>
        <textarea style={{ width: "100%", background: W05, border: "1px solid " + BORDER, borderRadius: 8, padding: "11px 14px", fontSize: 14, color: WHITE, outline: "none", minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
          value={form.caption} onChange={sf("caption")} placeholder="Legenda completa…" /></div>
      <div><label style={lbl}>Hashtags</label><input style={inp} value={form.hashtags} onChange={sf("hashtags")} placeholder="#bwproducoes #marketing" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div><label style={lbl}>Área</label>
          <select style={inp} value={form.area} onChange={sf("area")}>{CONTENT_AREAS.map(function(a) { return <option key={a}>{a}</option>; })}</select></div>
        <div><label style={lbl}>Plataforma</label>
          <select style={inp} value={form.platform} onChange={sf("platform")}>{PLATFORMS.map(function(p) { return <option key={p}>{p}</option>; })}</select></div>
        <div><label style={lbl}>Data programada</label><input type="date" style={inp} value={form.scheduledAt} onChange={sf("scheduledAt")} /></div>
      </div>

      {/* MÍDIAS MÚLTIPLAS */}
      <div>
        <label style={lbl}>MÍDIAS — {medias.length > 0 ? medias.length + " arquivo(s)" : "imagens ou vídeos"}</label>
        <div style={{ fontSize: 10, color: MUTED, marginBottom: 10 }}>Adicione quantas quiser — perfeito para carrosséis e stories com várias telas</div>

        {/* Upload de arquivo */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{ display: "none" }} />
          <button className="btn-ghost" onClick={function() { if (fileRef.current) fileRef.current.click(); }}
            style={{ flex: 1, background: W05, border: "1px dashed " + BORDER2, borderRadius: 8, padding: "14px", cursor: "pointer", color: MUTED, fontSize: 12, transition: "all .2s" }}>
            {uploading ? "⏳ Carregando…" : "📂 Selecionar arquivos (múltiplos permitidos)"}
          </button>
        </div>

        {/* Adicionar por URL */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={urlInput} onChange={function(e) { setUrlInput(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") addUrl(); }}
            style={{ flex: 1, background: W05, border: "1px solid " + BORDER, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: WHITE, outline: "none" }}
            placeholder="Ou cole uma URL e pressione +" />
          <button className="btn-inv" onClick={addUrl}
            style={{ padding: "10px 18px", background: WHITE, border: "none", borderRadius: 8, color: BG, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+</button>
        </div>

        {/* Lista de mídias adicionadas */}
        {medias.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {medias.map(function(u, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: W05, border: "1px solid " + BORDER, borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                    {isVid(u, form.area)
                      ? <div style={{ width: "100%", height: "100%", background: CARD2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
                      : <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, fontSize: 10, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {i + 1}. {u.startsWith("data:") ? "Arquivo local" : u}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={function() { moveUp(i); }} style={{ width: 24, height: 24, background: W10, border: "none", borderRadius: 4, color: MUTED, cursor: "pointer", fontSize: 12 }}>↑</button>
                    <button onClick={function() { moveDown(i); }} style={{ width: 24, height: 24, background: W10, border: "none", borderRadius: 4, color: MUTED, cursor: "pointer", fontSize: 12 }}>↓</button>
                    <button onClick={function() { removeMedia(i); }} style={{ width: 24, height: 24, background: "rgba(255,107,107,0.1)", border: "none", borderRadius: 4, color: REDC, cursor: "pointer", fontSize: 12 }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div><label style={lbl}>Observações para o cliente</label><input style={inp} value={form.notes} onChange={sf("notes")} placeholder="Contexto, instruções…" /></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid " + BORDER }}>
        <button className="btn-ghost" onClick={onClose}
          style={{ padding: "12px 24px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: "pointer", color: MUTED, letterSpacing: "1px" }}>CANCELAR</button>
        <button className="btn-inv" onClick={function() {
          if (!form.title.trim() || !form.caption.trim()) { alert("Preencha título e legenda."); return; }
          onSave(Object.assign({}, form, { mediaUrls: medias, mediaUrl: medias[0] || "" })); onClose();
        }} style={{ padding: "12px 28px", background: WHITE, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: "pointer", color: BG, letterSpacing: "1px" }}>
          {initial ? "SALVAR" : "ADICIONAR"}</button>
      </div>
    </div>
  );
}

// ── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({ post, clientId, isCreator, currentUser, onEdit, onDelete, onApprove, onRevision, onResolve }) {
  var [expanded, setExpanded] = useState(false);
  var [showRev, setShowRev]   = useState(false);
  var [revNote, setRevNote]   = useState("");
  var [commentCount, setCommentCount] = useState(0);
  var st = STATUS[post.status];
  var isStory = post.area === "Story";
  var mediaUrls = [];
  try { mediaUrls = post.media_urls ? JSON.parse(post.media_urls) : (post.media_url ? [post.media_url] : []); } catch(e) { mediaUrls = post.media_url ? [post.media_url] : []; }
  var firstUrl = mediaUrls[0] || null;
  var mediaCount = mediaUrls.length;

  useEffect(function() {
    sbSelect("comments", "post_id=eq." + post.id + "&client_id=eq." + clientId + "&select=id")
      .then(function(r) { setCommentCount(r.length); });
  }, [post.id]);

  return (
    <div className="pcard" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <div style={{ display: "flex" }}>
        <div style={{ width: isStory ? 66 : 110, minHeight: 110, flexShrink: 0, position: "relative" }}>
          <MediaPreview url={firstUrl} mediaType={post.area === "Story" ? "Vídeo" : "Imagem"} height={110} width={isStory ? 66 : 110} />
          {isStory && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,.7)", padding: "3px 0", textAlign: "center" }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: WHITE, letterSpacing: "1px" }}>STORY</span></div>}
          {mediaCount > 1 && <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.75)", borderRadius: 4, padding: "2px 6px" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: WHITE }}>1/{mediaCount}</span></div>}
        </div>
        <div style={{ flex: 1, padding: "13px 15px 11px", display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: WHITE, letterSpacing: "1px", lineHeight: 1.1 }}>{post.title}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: st.bg, color: st.color, border: "1px solid " + st.border, letterSpacing: ".5px" }}>{st.icon} {st.label.toUpperCase()}</span>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: isStory ? "rgba(255,255,255,0.1)" : W05, color: isStory ? WHITE : MUTED, border: "1px solid " + (isStory ? BORDER2 : BORDER), letterSpacing: ".5px" }}>{isStory ? "STORY" : "FEED"}</span>
            {mediaCount > 1 && <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,0.06)", color: MUTED, border: "1px solid " + BORDER, letterSpacing: ".5px" }}>🖼 {mediaCount} MÍDIAS</span>}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, background: W05, border: "1px solid " + BORDER, borderRadius: 4, padding: "2px 7px", color: MUTED }}>{post.platform}</span>
            {post.scheduled_at
              ? <span style={{ fontSize: 9, color: GREEN, fontWeight: 700 }}>📅 Publicação: {fmtDate(post.scheduled_at)}</span>
              : <span style={{ fontSize: 9, color: MUTED }}>📅 Sem data definida</span>
            }
          </div>
          <p style={{ fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.55, margin: 0 }}>{post.caption}</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <button className="btn-ghost" onClick={function() { setExpanded(function(v) { return !v; }); }}
              style={{ padding: "5px 11px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", color: MUTED, letterSpacing: ".5px" }}>{expanded ? "▲ FECHAR" : "▼ VER"}</button>
            <button className="btn-ghost" onClick={function() { setExpanded(true); }}
              style={{ padding: "5px 11px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 5, fontSize: 9, cursor: "pointer", color: MUTED }}>💬 {commentCount}</button>
            {isCreator && <button className="btn-ghost" onClick={function() { onEdit(post); }}
              style={{ padding: "5px 11px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", color: MUTED, letterSpacing: ".5px" }}>EDITAR</button>}
            {isCreator && <button className="btn-red" onClick={function() { onDelete(post.id); }}
              style={{ padding: "5px 11px", background: "transparent", border: "1px solid rgba(255,107,107,.2)", borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", color: REDC, letterSpacing: ".5px" }}>EXCLUIR</button>}
            {isCreator && post.status === "revision" && <button className="btn-inv" onClick={function() { onResolve(post.id); }}
              style={{ padding: "5px 13px", background: WHITE, border: "none", borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", color: BG, letterSpacing: ".5px" }}>✓ REENVIAR</button>}
            {!isCreator && post.status === "pending" && <button className="btn-green" onClick={function() { onApprove(post.id); }}
              style={{ padding: "5px 13px", background: "rgba(127,255,127,0.08)", border: "1px solid rgba(127,255,127,.25)", borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", color: GREEN, letterSpacing: ".5px" }}>✓ APROVAR</button>}
            {!isCreator && post.status === "pending" && <button className="btn-red" onClick={function() { setShowRev(function(v) { return !v; }); }}
              style={{ padding: "5px 13px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,.25)", borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", color: REDC, letterSpacing: ".5px" }}>↩ REVISÃO</button>}
          </div>
          {showRev && (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={revNote} onChange={function(e) { setRevNote(e.target.value); }}
                onKeyDown={function(e) { if (e.key === "Enter") { onRevision(post.id, revNote); setShowRev(false); setRevNote(""); } }}
                style={{ flex: 1, background: W05, border: "1px solid " + BORDER, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: WHITE, outline: "none" }}
                placeholder="Descreva o que precisa ser ajustado…" autoFocus />
              <button onClick={function() { onRevision(post.id, revNote); setShowRev(false); setRevNote(""); }}
                style={{ padding: "8px 14px", background: REDC, border: "none", borderRadius: 6, color: "#000", fontWeight: 700, fontSize: 10, cursor: "pointer" }}>ENVIAR</button>
            </div>
          )}
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid " + BORDER }}>
          {mediaUrls.length > 0 && (
            <div style={{ borderBottom: "1px solid " + BORDER }}>
              <CarouselViewer urls={mediaUrls} mediaType={post.area === "Story" ? "Vídeo" : "Imagem"} isStory={isStory} />
            </div>
          )}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>LEGENDA COMPLETA</div>
                <p style={{ fontSize: 14, color: W60, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{post.caption}</p>
                {post.hashtags && <p style={{ fontSize: 12, color: W30, marginTop: 10, lineHeight: 1.7 }}>{post.hashtags}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {post.notes && <div style={{ background: W05, border: "1px solid " + BORDER, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>OBSERVAÇÕES</div>
                  <p style={{ fontSize: 13, color: W60 }}>{post.notes}</p></div>}
                {post.revision_note && <div style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,.2)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: REDC, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>REVISÃO SOLICITADA</div>
                  <p style={{ fontSize: 13, color: REDC }}>{post.revision_note}</p></div>}
                <div style={{ fontSize: 11, color: MUTED2 }}>
                  <div>Enviado em: {fmtDate(post.created_at)}</div>
                  {post.scheduled_at
                    ? <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: WHITE }}>📅 Publicação: {fmtDate(post.scheduled_at)}</div>
                    : <div style={{ marginTop: 6, fontSize: 12, color: MUTED }}>📅 Data de publicação não definida</div>
                  }
                </div>
              </div>
            </div>
          </div>
          <CommentsPanel postId={post.id} clientId={clientId} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
}

// ── CALENDÁRIO ────────────────────────────────────────────────────────────────
function CalendarView({ posts }) {
  var now = new Date();
  var [year, setYear]   = useState(now.getFullYear());
  var [month, setMonth] = useState(now.getMonth());
  var mn = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, month));
  var fd = new Date(year, month, 1).getDay();
  var dm = new Date(year, month + 1, 0).getDate();
  var byDay = {};
  posts.forEach(function(p) {
    if (!p.scheduled_at) return;
    var d = new Date(p.scheduled_at);
    if (d.getFullYear() === year && d.getMonth() === month) { var day = d.getDate(); if (!byDay[day]) byDay[day] = []; byDay[day].push(p); }
  });
  var cells = []; for (var i = 0; i < fd; i++) cells.push(null); for (var d2 = 1; d2 <= dm; d2++) cells.push(d2);
  function isToday(d) { return d === now.getDate() && month === now.getMonth() && year === now.getFullYear(); }
  function prev() { if (month === 0) { setMonth(11); setYear(function(y) { return y - 1; }); } else setMonth(function(m) { return m - 1; }); }
  function next() { if (month === 11) { setMonth(0); setYear(function(y) { return y + 1; }); } else setMonth(function(m) { return m + 1; }); }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <button className="btn-ghost" onClick={prev} style={{ padding: "8px 16px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 18, color: MUTED }}>‹</button>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: WHITE, letterSpacing: "2px", textTransform: "uppercase" }}>{mn}</div>
        <button className="btn-ghost" onClick={next} style={{ padding: "8px 16px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 18, color: MUTED }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
        {["DOM","SEG","TER","QUA","QUI","SEX","SÁB"].map(function(d) { return <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: MUTED, padding: "4px 0", letterSpacing: "1px" }}>{d}</div>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map(function(d, i) {
          return <div key={i} style={{ minHeight: 64, background: d ? (isToday(d) ? WHITE : CARD2) : "transparent", borderRadius: 8, border: d ? "1px solid " + (isToday(d) ? WHITE : BORDER) : "none", padding: d ? "6px" : 0 }}>
            {d && <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: isToday(d) ? BG : MUTED, marginBottom: 3 }}>{d}</div>
              {(byDay[d] || []).map(function(p) { var s = STATUS[p.status]; return <div key={p.id} style={{ fontSize: 9, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 3, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>; })}
            </div>}
          </div>;
        })}
      </div>
      <div style={{ marginTop: 18, display: "flex", gap: 18, flexWrap: "wrap" }}>
        {Object.entries(STATUS).map(function(e) { return <div key={e[0]} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: MUTED }}><div style={{ width: 8, height: 8, borderRadius: 2, background: e[1].color }} />{e[1].label.toUpperCase()}</div>; })}
      </div>
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsBar({ posts }) {
  var total = posts.length;
  var approved = posts.filter(function(p) { return p.status === "approved"; }).length;
  var pending  = posts.filter(function(p) { return p.status === "pending"; }).length;
  var revision = posts.filter(function(p) { return p.status === "revision"; }).length;
  var rate  = total ? Math.round(approved / total * 100) : 0;
  var feed  = posts.filter(function(p) { return p.area === "Feed"; }).length;
  var story = posts.filter(function(p) { return p.area === "Story"; }).length;
  var items = [
    { label: "TOTAL",      val: total,      c: WHITE, b: BORDER },
    { label: "APROVADOS",  val: approved,   c: GREEN, b: "rgba(127,255,127,.2)" },
    { label: "AGUARDANDO", val: pending,    c: WHITE, b: BORDER },
    { label: "REVISÃO",    val: revision,   c: REDC,  b: "rgba(255,107,107,.2)" },
    { label: "FEED",       val: feed,       c: WHITE, b: BORDER },
    { label: "STORY",      val: story,      c: WHITE, b: BORDER },
    { label: "APROVAÇÃO",  val: rate + "%", c: WHITE, b: BORDER },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7, marginBottom: 22 }}>
      {items.map(function(it) { return <div key={it.label} style={{ background: CARD, border: "1px solid " + it.b, borderRadius: 10, padding: "12px 12px" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: it.c, letterSpacing: "1px" }}>{it.val}</div>
        <div style={{ fontSize: 8, color: MUTED, marginTop: 3, fontWeight: 700, letterSpacing: "1px" }}>{it.label}</div>
      </div>; })}
    </div>
  );
}

// ── EXPORTAR CSV ──────────────────────────────────────────────────────────────
function exportCSV(posts, clientName) {
  var header = ["Título","Área","Plataforma","Status","Data","Legenda","Hashtags"].join(";");
  var rows = posts.map(function(p) { return [p.title, p.area || "Feed", p.platform, STATUS[p.status].label, p.scheduled_at || "", '"' + (p.caption || "").replace(/"/g, '""') + '"', p.hashtags || ""].join(";"); });
  var blob = new Blob(["\ufeff" + [header].concat(rows).join("\n")], { type: "text/csv;charset=utf-8;" });
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bw_" + (clientName || "posts") + ".csv"; a.click();
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={function(e) { e.stopPropagation(); }}
        style={{ background: CARD, border: "1px solid " + BORDER2, borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", padding: 28, position: "relative", animation: "fadeUp .28s ease" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: 6, background: W05, border: "1px solid " + BORDER, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>×</button>
        {children}
      </div>
    </div>
  );
}

// ── PAINEL GENÉRICO (usado por criador e cliente) ─────────────────────────────
function Panel({ user, clientId, isCreator, onLogout }) {
  var [posts, setPosts]       = useState([]);
  var [loading, setLoading]   = useState(true);
  var [saving, setSaving]     = useState(false);
  var [tab, setTab]           = useState("posts");
  var [areaFilter, setArea]   = useState("Todos");
  var [filter, setFilter]     = useState("all");
  var [search, setSearch]     = useState("");
  var [showForm, setShowForm] = useState(false);
  var [editPost, setEditPost] = useState(null);

  function loadPosts() {
    sbSelect("posts", "client_id=eq." + clientId + "&order=created_at.desc")
      .then(function(rows) { setPosts(rows); setLoading(false); });
  }

  useEffect(function() { loadPosts(); }, [clientId]);

  function postToRow(form, existing) {
    var urls = form.mediaUrls || (form.mediaUrl ? [form.mediaUrl] : []);
    return {
      id: (existing && existing.id) || uid(),
      client_id: clientId,
      title: form.title,
      caption: form.caption,
      hashtags: form.hashtags || "",
      platform: form.platform,
      area: form.area || "Feed",
      media_url: urls[0] || "",
      media_urls: JSON.stringify(urls),
      notes: form.notes || "",
      status: (existing && existing.status) || "pending",
      revision_note: (existing && existing.revision_note) || "",
      scheduled_at: form.scheduledAt || form.scheduled_at || "",
      created_at: (existing && existing.created_at) || Date.now(),
    };
  }

  function addPost(form) {
    setSaving(true);
    var row = postToRow(form, null);
    sbInsert("posts", row).then(function() { loadPosts(); setSaving(false); });
  }
  function updatePost(form) {
    setSaving(true);
    var row = postToRow(form, editPost);
    sbUpdate("posts", editPost.id, row).then(function() { loadPosts(); setSaving(false); setEditPost(null); });
  }
  function deletePost(id) {
    if (!confirm("Excluir este post?")) return;
    sbDelete("posts", id).then(function() { setPosts(function(ps) { return ps.filter(function(p) { return p.id !== id; }); }); });
  }
  function setStatus(id, status, revNote) {
    var data = { status: status, revision_note: revNote || "" };
    sbUpdate("posts", id, data).then(function() { setPosts(function(ps) { return ps.map(function(p) { return p.id === id ? Object.assign({}, p, data) : p; }); }); });
  }

  var filtered = posts.filter(function(p) {
    if (areaFilter !== "Todos" && p.area !== areaFilter) return false;
    if (filter !== "all" && p.status !== filter) return false;
    if (search) { var q = search.toLowerCase(); if (p.title.toLowerCase().indexOf(q) < 0 && p.caption.toLowerCase().indexOf(q) < 0) return false; }
    return true;
  });

  function ns(active) { return { padding: "8px 16px", borderRadius: 6, border: active ? "1px solid " + WHITE : "1px solid " + BORDER, background: active ? WHITE : "transparent", color: active ? BG : MUTED, cursor: "pointer", fontWeight: 700, fontSize: 10, letterSpacing: "1px" }; }
  function fs(active) { return { padding: "7px 13px", background: active ? WHITE : "transparent", border: active ? "1px solid " + WHITE : "1px solid " + BORDER, borderRadius: 5, color: active ? BG : MUTED, fontSize: 9, fontWeight: 700, cursor: "pointer", letterSpacing: ".5px" }; }

  var clientName = CLIENT_MAP[clientId] ? CLIENT_MAP[clientId].name : clientId;

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <header style={{ background: BG2, borderBottom: "1px solid " + BORDER, padding: "13px 22px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap" }}>
        <LogoBW size={26} />
        <div style={{ width: 1, height: 22, background: BORDER, margin: "0 2px" }} />
        <div style={{ display: "flex", gap: 5 }}>
          <button style={ns(tab === "posts")} onClick={function() { setTab("posts"); }}>POSTS</button>
          <button style={ns(tab === "calendar")} onClick={function() { setTab("calendar"); }}>CALENDÁRIO</button>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {isCreator && <button className="btn-ghost" onClick={function() { exportCSV(posts, clientId); }}
            style={{ padding: "7px 13px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", color: MUTED, letterSpacing: "1px" }}>↓ CSV</button>}
          {isCreator && <button className="btn-inv" onClick={function() { setShowForm(true); }}
            style={{ padding: "8px 18px", background: WHITE, border: "none", borderRadius: 6, fontWeight: 700, fontSize: 10, cursor: "pointer", color: BG, letterSpacing: "1px" }}>+ NOVO POST</button>}
          {saving && <span style={{ fontSize: 11, color: MUTED, letterSpacing: ".5px" }}>Salvando…</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: W10, border: "1px solid " + BORDER, borderRadius: 99 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: isCreator ? WHITE : BORDER2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 9, color: isCreator ? BG : WHITE }}>{isCreator ? "BW" : user.name.slice(0,2).toUpperCase()}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: WHITE, letterSpacing: ".5px" }}>{isCreator ? "CRIADOR" : user.name.toUpperCase()}</span>
            <button className="bw" onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED2, fontSize: 10, marginLeft: 2 }}>SAIR</button>
          </div>
        </div>
      </header>

      <div style={{ padding: "24px 22px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid " + BORDER }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: WHITE, letterSpacing: "3px", lineHeight: 1 }}>{clientName.toUpperCase()}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{isCreator ? posts.length + " posts cadastrados" : "Aprovação de conteúdo — BW Produções"}</div>
        </div>

        {!loading && <StatsBar posts={posts} />}

        {tab === "calendar" ? (
          <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: 26 }}><CalendarView posts={posts} /></div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid " + BORDER }}>
              {["Todos","Feed","Story"].map(function(a) {
                var isA = areaFilter === a;
                var count = a === "Todos" ? posts.length : posts.filter(function(p) { return p.area === a; }).length;
                return <button key={a} onClick={function() { setArea(a); }}
                  style={{ padding: "10px 20px", background: "transparent", border: "none", borderBottom: isA ? "2px solid " + WHITE : "2px solid transparent", color: isA ? WHITE : MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "1px" }}>
                  {a.toUpperCase()} <span style={{ fontSize: 9, marginLeft: 4, opacity: .7 }}>({count})</span></button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={function(e) { setSearch(e.target.value); }}
                style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 7, padding: "8px 13px", fontSize: 12, color: WHITE, outline: "none", width: 190 }}
                placeholder="Buscar posts…" />
              <div style={{ display: "flex", gap: 5 }}>
                {["all","pending","approved","revision"].map(function(f) {
                  return <button key={f} onClick={function() { setFilter(f); }} style={fs(filter === f)}>{f === "all" ? "TODOS" : STATUS[f].label.toUpperCase()}</button>;
                })}
              </div>
              <span style={{ marginLeft: "auto", fontSize: 10, color: MUTED2 }}>{filtered.length} POST{filtered.length !== 1 ? "S" : ""}</span>
            </div>
            {loading && <div style={{ textAlign: "center", color: MUTED, padding: 60 }}>Carregando…</div>}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, border: "1px dashed " + BORDER, borderRadius: 12, background: CARD }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: BORDER, letterSpacing: "4px", marginBottom: 10 }}>BW</div>
                <div style={{ fontWeight: 600, color: WHITE, fontSize: 12, letterSpacing: "1px" }}>{posts.length === 0 ? (isCreator ? "NENHUM POST PARA ESTE CLIENTE" : "NENHUM CONTEÚDO AINDA") : "NENHUM RESULTADO"}</div>
                {posts.length === 0 && !isCreator && <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Aguarde a BW Produções enviar seu conteúdo</div>}
              </div>
            )}
            {!loading && filtered.map(function(post) {
              return <PostCard key={post.id} post={post} clientId={clientId} isCreator={isCreator} currentUser={user}
                onEdit={setEditPost} onDelete={deletePost}
                onApprove={function(id) { setStatus(id, "approved", ""); }}
                onRevision={function(id, note) { setStatus(id, "revision", note); }}
                onResolve={function(id) { setStatus(id, "pending", ""); }} />;
            })}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid " + BORDER, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, color: MUTED2, letterSpacing: "1px" }}>BW PRODUÇÕES © 2026</div>
        <div style={{ fontSize: 9, color: MUTED2 }}>SISTEMA DE APROVAÇÃO DE CONTEÚDO</div>
      </div>

      <Modal open={showForm} onClose={function() { setShowForm(false); }}>
        <PostForm onSave={addPost} onClose={function() { setShowForm(false); }} clientId={clientId} area={areaFilter !== "Todos" ? areaFilter : "Feed"} />
      </Modal>
      <Modal open={!!editPost} onClose={function() { setEditPost(null); }}>
        {editPost && <PostForm initial={{
          title: editPost.title, caption: editPost.caption, hashtags: editPost.hashtags,
          platform: editPost.platform, area: editPost.area,
          scheduledAt: editPost.scheduled_at || "",
          mediaUrl: editPost.media_url, notes: editPost.notes,
          mediaUrls: (function() { try { return editPost.media_urls ? JSON.parse(editPost.media_urls) : (editPost.media_url ? [editPost.media_url] : []); } catch(e) { return editPost.media_url ? [editPost.media_url] : []; } })()
        }} onSave={updatePost} onClose={function() { setEditPost(null); }} clientId={clientId} />}
      </Modal>
    </div>
  );
}

// ── PAINEL CRIADOR — seletor de cliente ───────────────────────────────────────
function CreatorHome({ user, onLogout }) {
  var [clientView, setClientView] = useState(null);
  var [counts, setCounts] = useState({});

  useEffect(function() {
    CLIENTS.forEach(function(c) {
      sbSelect("posts", "client_id=eq." + c.id + "&select=id,status").then(function(rows) {
        setCounts(function(prev) {
          var n = Object.assign({}, prev);
          n[c.id] = { pending: rows.filter(function(r) { return r.status === "pending"; }).length, revision: rows.filter(function(r) { return r.status === "revision"; }).length };
          return n;
        });
      });
    });
  }, [clientView]);

  if (clientView) return <Panel user={user} clientId={clientView} isCreator={true} onLogout={function() { setClientView(null); }} />;

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <style>{CSS_TEXT}</style>
      <header style={{ background: BG2, borderBottom: "1px solid " + BORDER, padding: "13px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <LogoBW size={26} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: W10, border: "1px solid " + BORDER, borderRadius: 99 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 9, color: BG }}>BW</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: WHITE }}>CRIADOR</span>
            <button className="bw" onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED2, fontSize: 10, marginLeft: 2 }}>SAIR</button>
          </div>
        </div>
      </header>
      <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid " + BORDER }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: WHITE, letterSpacing: "3px", marginBottom: 6 }}>SELECIONAR CLIENTE</div>
          <div style={{ fontSize: 12, color: MUTED }}>Escolha um cliente para gerenciar o conteúdo</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {CLIENTS.map(function(c) {
            var ct = counts[c.id] || {};
            return (
              <button key={c.id} className="bw" onClick={function() { setClientView(c.id); }}
                style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "24px 20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "border-color .18s" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: BORDER2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: WHITE, letterSpacing: "1px" }}>{c.name.slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: WHITE, letterSpacing: "1px", textAlign: "center" }}>{c.name.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {ct.pending > 0 && <span style={{ fontSize: 9, background: W10, color: WHITE, borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>{ct.pending} ⏳</span>}
                  {ct.revision > 0 && <span style={{ fontSize: 9, background: "rgba(255,107,107,0.15)", color: REDC, borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>{ct.revision} ↩</span>}
                  {!ct.pending && !ct.revision && <span style={{ fontSize: 9, color: MUTED2, letterSpacing: ".5px" }}>SEM ALERTAS</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: "1px solid " + BORDER, padding: "14px 22px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, color: MUTED2, letterSpacing: "1px" }}>BW PRODUÇÕES © 2026</div>
        <div style={{ fontSize: 9, color: MUTED2 }}>SISTEMA DE APROVAÇÃO DE CONTEÚDO</div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
function App() {
  var [user, setUser] = useState(null);
  if (!user) return <LoginScreen onLogin={setUser} />;
  if (user.role === "creator") return <CreatorHome user={user} onLogout={function() { setUser(null); }} />;
  return <Panel user={user} clientId={user.id} isCreator={false} onLogout={function() { setUser(null); }} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
