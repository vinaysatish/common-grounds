import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase";
import { ref, onValue, set, push, remove } from "firebase/database";

// ─────────────────────────────────────────────
// PALETTES
// ─────────────────────────────────────────────
const PALETTES = {
  espresso: { label:"Espresso", colors:{ navBg:"#2C1810", navText:"#D4A017", pageBg:"#F5F0E8", cardBg:"#FDFAF4", cardAlt:"#EDE8DC", accent:"#2C1810", accentLight:"#5C3D2E", headingText:"#2C1810", highlight:"#B8860B", highlightLight:"#D4A017", text:"#1A0F0A", textMuted:"#7A6558", border:"#D4C9B8", success:"#4A7C59", error:"#C0392B", errorBg:"#FDF0EE", errorBorder:"#E8C4C0" }},
  chalk:    { label:"Chalk",    colors:{ navBg:"#111111", navText:"#FFFFFF", pageBg:"#FAFAFA", cardBg:"#FFFFFF", cardAlt:"#F2F2F2", accent:"#111111", accentLight:"#333333", headingText:"#111111", highlight:"#444444", highlightLight:"#666666", text:"#111111", textMuted:"#888888", border:"#DDDDDD", success:"#2E7D32", error:"#C62828", errorBg:"#FFEBEE", errorBorder:"#FFCDD2" }},
  midnight: { label:"Midnight", colors:{ navBg:"#0F0F14", navText:"#E8B86D", pageBg:"#0F0F14", cardBg:"#1A1A24", cardAlt:"#22222F", accent:"#7B68EE", accentLight:"#9F94F0", headingText:"#E8E8F0", highlight:"#E8B86D", highlightLight:"#F0CA8A", text:"#E8E8F0", textMuted:"#8888AA", border:"#2E2E3E", success:"#4CAF7D", error:"#EF5350", errorBg:"#1C1010", errorBorder:"#5C2020" }},
  sage:     { label:"Sage",     colors:{ navBg:"#2D4A35", navText:"#C8E6C9", pageBg:"#F0F4F0", cardBg:"#F8FAF8", cardAlt:"#E4EDE4", accent:"#2D4A35", accentLight:"#4A7A57", headingText:"#2D4A35", highlight:"#8B6914", highlightLight:"#B08A2A", text:"#1A2E1F", textMuted:"#6A8570", border:"#C4D4C4", success:"#2D6A4F", error:"#C0392B", errorBg:"#FDF0EE", errorBorder:"#E8C4C0" }},
  slate:    { label:"Slate",    colors:{ navBg:"#1E3A5F", navText:"#BDD5EA", pageBg:"#F0F2F5", cardBg:"#FFFFFF", cardAlt:"#E4E8EE", accent:"#1E3A5F", accentLight:"#2E5C8A", headingText:"#1E3A5F", highlight:"#C17F3A", highlightLight:"#D4973A", text:"#0F1F33", textMuted:"#607080", border:"#CBD4DE", success:"#1B6B3A", error:"#C0392B", errorBg:"#FDF0EE", errorBorder:"#E8C4C0" }},
};

const COLOR_ROLES = [
  { key:"navBg",       label:"Nav Background" },
  { key:"navText",     label:"Nav Text" },
  { key:"pageBg",      label:"Page Background" },
  { key:"cardBg",      label:"Card Background" },
  { key:"accent",      label:"Primary Button" },
  { key:"headingText", label:"Heading Text" },
  { key:"highlight",   label:"Accent" },
  { key:"text",        label:"Body Text" },
  { key:"textMuted",   label:"Muted Text" },
  { key:"border",      label:"Borders" },
];

// ─────────────────────────────────────────────
// FONT PAIRINGS
// ─────────────────────────────────────────────
const FONT_PAIRINGS = {
  editorial: { label:"Editorial", displayName:"Playfair Display",  bodyName:"DM Sans",      detailName:"DM Mono",        display:"'Playfair Display', Georgia, serif",         body:"'DM Sans', system-ui, sans-serif",        detail:"'DM Mono', monospace",           googleUrl:"https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" },
  literary:  { label:"Literary",  displayName:"Crimson Pro",       bodyName:"Lora",         detailName:"Courier Prime",  display:"'Crimson Pro', Georgia, serif",              body:"'Lora', Georgia, serif",                  detail:"'Courier Prime', monospace",     googleUrl:"https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Courier+Prime:wght@400;700&display=swap" },
  modern:    { label:"Modern",    displayName:"Fraunces",          bodyName:"Poppins",      detailName:"Space Mono",     display:"'Fraunces', Georgia, serif",                 body:"'Poppins', system-ui, sans-serif",        detail:"'Space Mono', monospace",        googleUrl:"https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" },
  studio:    { label:"Studio",    displayName:"Cormorant Garamond",bodyName:"Montserrat",   detailName:"IBM Plex Mono",  display:"'Cormorant Garamond', Georgia, serif",       body:"'Montserrat', system-ui, sans-serif",     detail:"'IBM Plex Mono', monospace",     googleUrl:"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" },
  minimal:   { label:"Minimal",   displayName:"Spectral",          bodyName:"Rethink Sans", detailName:"Inconsolata",    display:"'Spectral', Georgia, serif",                 body:"'Rethink Sans', system-ui, sans-serif",   detail:"'Inconsolata', monospace",       googleUrl:"https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,400&family=Rethink+Sans:wght@300;400;500;600&family=Inconsolata:wght@400;500&display=swap" },
};

const GOOGLE_FONT_OPTIONS = {
  display: [
    { label:"Playfair Display",   value:"'Playfair Display', Georgia, serif",         url:"Playfair+Display:ital,wght@0,400;0,600;0,700;1,400" },
    { label:"Crimson Pro",        value:"'Crimson Pro', Georgia, serif",              url:"Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400" },
    { label:"Fraunces",           value:"'Fraunces', Georgia, serif",                url:"Fraunces:ital,wght@0,400;0,600;0,700;1,400" },
    { label:"Cormorant Garamond", value:"'Cormorant Garamond', Georgia, serif",      url:"Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400" },
    { label:"Spectral",           value:"'Spectral', Georgia, serif",                url:"Spectral:ital,wght@0,400;0,500;0,600;1,400" },
  ],
  body: [
    { label:"DM Sans",            value:"'DM Sans', system-ui, sans-serif",          url:"DM+Sans:wght@300;400;500;600" },
    { label:"Lora",               value:"'Lora', Georgia, serif",                   url:"Lora:ital,wght@0,400;0,500;1,400" },
    { label:"Poppins",            value:"'Poppins', system-ui, sans-serif",          url:"Poppins:wght@300;400;500;600" },
    { label:"Montserrat",         value:"'Montserrat', system-ui, sans-serif",       url:"Montserrat:wght@300;400;500;600" },
    { label:"Rethink Sans",       value:"'Rethink Sans', system-ui, sans-serif",     url:"Rethink+Sans:wght@300;400;500;600" },
  ],
  detail: [
    { label:"DM Mono",            value:"'DM Mono', monospace",                      url:"DM+Mono:wght@400;500" },
    { label:"Courier Prime",      value:"'Courier Prime', monospace",                url:"Courier+Prime:wght@400;700" },
    { label:"Space Mono",         value:"'Space Mono', monospace",                   url:"Space+Mono:wght@400;700" },
    { label:"IBM Plex Mono",      value:"'IBM Plex Mono', monospace",                url:"IBM+Plex+Mono:wght@400;500" },
    { label:"Inconsolata",        value:"'Inconsolata', monospace",                   url:"Inconsolata:wght@400;500" },
  ],
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_NAME_LENGTH = 40;
const MAX_REQUEST_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 200;
const STORAGE_KEYS = { session:"cafe_session", pinHash:"cafe_pin_hash", config:"cafe_config", theme:"cafe_theme" };

const DEFAULT_OPTIONS = [
  { id:"opt-milk", label:"Milk",        choices:[{id:"c1",name:"Whole",description:""},{id:"c2",name:"Oat",description:""}] },
  { id:"opt-temp", label:"Temperature", choices:[{id:"c3",name:"Hot",description:""},{id:"c4",name:"Iced",description:""}] },
];

const DEFAULT_CONFIG = {
  cafeName:"Home Café", tagline:"Crafted with care", logoEmoji:"☕",
  logoMode:"emoji", logoImage:null,
  closedMessage:"We're not open yet — check back soon.",
  accessCode:"",
  options: DEFAULT_OPTIONS,
  // Menu sections, in display order. Each drink references one via `categoryId`.
  categories: [],
  menu: [
    { id:"1", name:"Espresso",    optionIds:[],                     description:"" },
    { id:"2", name:"Cortado",     optionIds:["opt-milk"],            description:"" },
    { id:"3", name:"Cappuccino",  optionIds:["opt-milk"],            description:"" },
    { id:"4", name:"Latte",       optionIds:["opt-milk","opt-temp"], description:"" },
    { id:"5", name:"Espresso Tonic", optionIds:[],                  description:"Espresso over tonic water, served iced" },
    { id:"6", name:"Matcha Latte",optionIds:["opt-milk"],            description:"Served iced" },
  ],
};

const DEFAULT_THEME = { palette:"espresso", fonts:"editorial", customColors:null, customFonts:null, colorMode:"palette", fontMode:"pairing" };

// ─────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────
// Pure-JS SHA-256 fallback for non-secure contexts (e.g. http:// on a LAN IP),
// where the Web Crypto API (crypto.subtle) is unavailable. Produces the exact
// same hex digest as crypto.subtle.digest("SHA-256", ...), so a PIN set in one
// context verifies in the other.
const sha256hex = (msg) => {
  const bytes = new TextEncoder().encode(msg);
  const K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const l = bytes.length, bitLen = l*8, withOne = l+1;
  const pad = (56 - (withOne % 64) + 64) % 64, total = withOne + pad + 8;
  const buf = new Uint8Array(total);
  buf.set(bytes); buf[l] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(total-4, bitLen >>> 0, false);
  dv.setUint32(total-8, Math.floor(bitLen/0x100000000) >>> 0, false);
  const rotr = (x,n)=>(x>>>n)|(x<<(32-n));
  const w = new Uint32Array(64);
  for (let i=0;i<total;i+=64){
    for (let t=0;t<16;t++) w[t]=dv.getUint32(i+t*4,false);
    for (let t=16;t<64;t++){
      const s0=rotr(w[t-15],7)^rotr(w[t-15],18)^(w[t-15]>>>3);
      const s1=rotr(w[t-2],17)^rotr(w[t-2],19)^(w[t-2]>>>10);
      w[t]=(w[t-16]+s0+w[t-7]+s1)>>>0;
    }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for (let t=0;t<64;t++){
      const S1=rotr(e,6)^rotr(e,11)^rotr(e,25);
      const ch=(e&f)^(~e&g);
      const t1=(h+S1+ch+K[t]+w[t])>>>0;
      const S0=rotr(a,2)^rotr(a,13)^rotr(a,22);
      const maj=(a&b)^(a&c)^(b&c);
      const t2=(S0+maj)>>>0;
      h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;h5=(h5+f)>>>0;h6=(h6+g)>>>0;h7=(h7+h)>>>0;
  }
  const hex=(x)=>(x>>>0).toString(16).padStart(8,"0");
  return hex(h0)+hex(h1)+hex(h2)+hex(h3)+hex(h4)+hex(h5)+hex(h6)+hex(h7);
};

const hashPin = async (pin) => {
  const msg = pin + "cafe_salt_v1";
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  return sha256hex(msg);
};
const verifyPin = async (pin, hash) => (await hashPin(pin)) === hash;
const isSessionValid = (s) => s?.token === true;
const createSession = () => ({ token: true });

// ─────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────
const store = {
  get: (k,fb=null) => { try { const r=localStorage.getItem(k); return r?JSON.parse(r):fb; } catch { return fb; } },
  set: (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
const sanitizeName = (s) => s.replace(/[<>&"'/]/g,"").trim().slice(0,MAX_NAME_LENGTH);
const uid = () => (globalThis.crypto?.randomUUID
  ? crypto.randomUUID().slice(0,8)
  : Array.from({length:8},()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join(""));
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

// ─────────────────────────────────────────────
// THEME RESOLUTION
// ─────────────────────────────────────────────
const resolveTheme = (tc) => {
  const palette = PALETTES[tc.palette] || PALETTES.espresso;
  const pairing = FONT_PAIRINGS[tc.fonts] || FONT_PAIRINGS.editorial;
  const colors = tc.customColors ? { ...palette.colors, ...tc.customColors } : palette.colors;
  const fonts = tc.customFonts
    ? { display: tc.customFonts.display||pairing.display, body: tc.customFonts.body||pairing.body, detail: tc.customFonts.detail||pairing.detail }
    : { display: pairing.display, body: pairing.body, detail: pairing.detail };
  const customFontUrls = tc.customFonts
    ? [tc.customFonts.displayUrl, tc.customFonts.bodyUrl, tc.customFonts.detailUrl].filter(Boolean).map(u=>`family=${u}`).join("&")
    : null;
  const fontUrl = customFontUrls
    ? `https://fonts.googleapis.com/css2?${customFontUrls}&display=swap`
    : pairing.googleUrl;
  return { colors, fonts, fontUrl };
};

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyles = ({ theme }) => {
  const { colors:C, fonts:F, fontUrl } = theme;
  return (
    <>
      <link rel="stylesheet" href={fontUrl}/>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.pageBg};color:${C.text};font-family:${F.body};min-height:100vh}
        .app{min-height:100vh;background:${C.pageBg}}
        .nav{background:${C.navBg};padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:54px;position:sticky;top:0;z-index:100}
        .brand{font-family:${F.display};font-size:17px;color:${C.navText};display:flex;align-items:center;gap:7px;letter-spacing:.02em}
        .tabs{display:flex;gap:3px}
        .tab{padding:5px 13px;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,.58);transition:all .15s;font-family:${F.body}}
        .tab:hover{color:#fff;background:rgba(255,255,255,.1)}
        .tab.on{color:${C.navText};background:rgba(255,255,255,.12)}
        .page{max-width:700px;margin:0 auto;padding:36px 20px 80px}
        .page-wide{max-width:940px;margin:0 auto;padding:36px 20px 80px}
        .page-center{max-width:380px;margin:0 auto;padding:72px 20px}
        .eyebrow{font-family:${F.detail};font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${C.highlight};margin-bottom:7px}
        .heading{font-family:${F.display};font-size:26px;font-weight:600;color:${C.headingText};margin-bottom:22px;line-height:1.2}
        .divider{border:none;border-top:1px solid ${C.border};margin:22px 0}
        .card{background:${C.cardBg};border:1px solid ${C.border};border-radius:12px;padding:22px;margin-bottom:14px}
        .field{margin-bottom:16px}
        .field label{display:block;font-size:12.5px;font-weight:500;color:${C.accentLight};margin-bottom:5px;letter-spacing:.02em}
        .field input,.field select,.field textarea{width:100%;padding:9px 13px;border:1.5px solid ${C.border};border-radius:8px;background:${C.cardBg};color:${C.text};font-family:${F.body};font-size:14.5px;transition:border-color .15s;outline:none}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:${C.highlight}}
        .field input.err{border-color:${C.error}}
        .field textarea{resize:vertical;min-height:66px;line-height:1.5}
        .f2{display:grid;grid-template-columns:1fr 1fr;gap:11px}
        .hint{font-size:11.5px;color:${C.textMuted};margin-top:3px}
        .ferr{font-size:11.5px;color:${C.error};margin-top:3px}
        .char-count{font-size:11px;color:${C.textMuted};text-align:right;margin-top:2px}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:9px 18px;border-radius:8px;font-family:${F.body};font-size:13.5px;font-weight:500;cursor:pointer;border:none;transition:all .15s;letter-spacing:.02em}
        .btn:disabled{opacity:.4;cursor:not-allowed}
        .btn-p{background:${C.accent};color:#fff}.btn-p:hover:not(:disabled){filter:brightness(1.15)}
        .btn-h{background:${C.highlight};color:#fff}.btn-h:hover:not(:disabled){background:${C.highlightLight}}
        .btn-o{background:transparent;color:${C.accentLight};border:1.5px solid ${C.border}}.btn-o:hover:not(:disabled){border-color:${C.accentLight}}
        .btn-d{background:transparent;color:${C.error};border:1.5px solid ${C.errorBorder}}.btn-d:hover:not(:disabled){background:${C.errorBg}}
        .btn-s{background:${C.success};color:#fff}
        .sm{padding:5px 11px;font-size:12.5px}.full{width:100%}
        .dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:9px;margin-bottom:18px;align-items:stretch}
        .dtile{padding:13px;border:2px solid ${C.border};border-radius:10px;cursor:pointer;transition:all .15s;background:${C.cardBg};text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .dtile:hover{border-color:${C.accentLight};background:${C.cardAlt}}
        .dtile.on{border-color:${C.highlight};background:${C.cardAlt}}
        .dtile-name{font-size:13.5px;font-weight:600;color:${C.text};line-height:1.3;margin-bottom:3px}
        .dtile-desc{font-size:11.5px;color:${C.textMuted};line-height:1.4;margin-top:3px}
        .menu-section-title{font-family:${F.display};font-size:16px;font-weight:600;color:${C.headingText};margin:20px 0 9px;padding-bottom:5px;border-bottom:1.5px solid ${C.border}}
        .dlist{display:flex;flex-direction:column;gap:8px;margin-bottom:6px}
        .drow{display:flex;align-items:center;gap:12px;text-align:left;padding:12px 15px;border:2px solid ${C.border};border-radius:10px;cursor:pointer;transition:all .15s;background:${C.cardBg}}
        .drow:hover{border-color:${C.accentLight};background:${C.cardAlt}}
        .drow.on{border-color:${C.highlight};background:${C.cardAlt}}
        .drow-body{flex:1;min-width:0}
        .drow-name{font-size:14.5px;font-weight:600;color:${C.text};line-height:1.3}
        .drow-desc{font-size:12px;color:${C.textMuted};line-height:1.4;margin-top:3px}
        .drow-check{flex-shrink:0;width:22px;height:22px;border-radius:50%;border:2px solid ${C.border};display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;transition:all .15s}
        .drow.on .drow-check{background:${C.highlight};border-color:${C.highlight}}
        .pills{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px}
        .pill{padding:6px 15px;border:2px solid ${C.border};border-radius:100px;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .15s;background:${C.cardBg};color:${C.text};display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:34px;text-align:center}
        .pill:hover{border-color:${C.accentLight}}
        .pill.on{border-color:${C.highlight};background:${C.cardAlt};color:${C.accent}}
        .choice-card{padding:12px 16px;border:2px solid ${C.border};border-radius:10px;cursor:pointer;transition:all .15s;background:${C.cardBg};color:${C.text}}
        .choice-card:hover{border-color:${C.accentLight};background:${C.cardAlt}}
        .choice-card.on{border-color:${C.highlight};background:${C.cardAlt}}
        .choice-card-name{font-weight:600;font-size:14px}
        .choice-card-desc{font-size:12.5px;opacity:.65;margin-top:3px;line-height:1.4}
        .qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
        .qcard{background:${C.cardBg};border:1.5px solid ${C.border};border-radius:12px;overflow:hidden;transition:transform .15s,box-shadow .15s;animation:slideIn .28s ease;display:flex;flex-direction:column}
        .qcard:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.1)}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .qhead{background:${C.accent};padding:9px 13px;display:flex;align-items:center;justify-content:space-between}
        .qnum{font-family:${F.detail};font-size:10.5px;color:${C.navText};letter-spacing:.08em}
        .qtime{font-family:${F.detail};font-size:10.5px;color:rgba(255,255,255,.38)}
        .qbody{padding:14px;flex:1}
        .qphoto{width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid ${C.border};float:right;margin-left:11px}
        .qavatar{width:46px;height:46px;border-radius:50%;background:${C.cardAlt};border:2px solid ${C.border};float:right;margin-left:11px;display:flex;align-items:center;justify-content:center;font-size:19px}
        .qname{font-family:${F.display};font-size:17px;font-weight:600;color:${C.headingText};margin-bottom:2px}
        .qdrink{font-size:13.5px;font-weight:500;color:${C.text};margin-bottom:2px}
        .qmods{font-size:11.5px;color:${C.textMuted};font-family:${F.detail};margin-bottom:2px}
        .qrequest{font-size:12px;color:${C.accentLight};background:${C.cardAlt};border-radius:6px;padding:5px 8px;margin-top:6px;line-height:1.4;font-style:italic}
        .qmessage{font-size:13px;color:${C.text};background:${C.cardAlt};border-radius:6px;padding:7px 10px;margin-top:8px;line-height:1.5;border-left:3px solid ${C.highlight}}
        .qfooter{padding:11px 14px;border-top:1px solid ${C.border};display:flex;gap:7px}
        .mrow{border:1.5px solid ${C.border};border-radius:10px;background:${C.cardBg};margin-bottom:8px;overflow:hidden}
        .mrow-header{display:flex;align-items:flex-start;gap:9px;padding:11px 13px}
        .mrow-info{flex:1;min-width:0}
        .mrow-name{font-size:14px;font-weight:600;color:${C.text};margin-bottom:2px}
        .mrow-cat{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:100px;font-size:10.5px;font-weight:600;letter-spacing:.03em;color:${C.highlight};background:${C.cardAlt};border:1px solid ${C.border};vertical-align:middle}
        .mrow-desc{font-size:12px;color:${C.textMuted};line-height:1.4;margin-top:2px}
        .mrow-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .mrow-edit{background:${C.cardAlt};border-top:1px solid ${C.border};padding:13px}
        .mtoggle{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px solid ${C.border};font-family:inherit;transition:all .15s}
        .mtoggle.off{background:transparent;color:${C.textMuted};border-color:${C.border}}
        .mtoggle.on{background:${C.highlight};color:#fff;border-color:${C.highlight}}
        .hero{text-align:center;padding:44px 20px 28px}
        .hero-ico{font-size:46px;margin-bottom:11px;display:block}
        .hero-name{font-family:${F.display};font-size:34px;font-weight:700;color:${C.headingText};margin-bottom:5px}
        .hero-tag{font-size:16px;color:${C.textMuted};font-style:italic;font-family:${F.display}}
        .photo-zone{border:2px dashed ${C.border};border-radius:12px;padding:22px;text-align:center;cursor:pointer;transition:border-color .15s;margin-bottom:18px}
        .photo-zone:hover{border-color:${C.highlight}}
        .photo-thumb{width:76px;height:76px;border-radius:50%;object-fit:cover;border:3px solid ${C.highlight};margin:0 auto 11px;display:block}
        .pin-row{display:flex;gap:11px;justify-content:center;margin:22px 0}
        .pin-box{width:50px;height:62px;border:2px solid ${C.border};border-radius:10px;text-align:center;font-size:27px;font-family:${F.display};font-weight:600;color:${C.headingText};background:${C.cardBg};outline:none;transition:border-color .15s}
        .pin-box:focus{border-color:${C.highlight}}
        .pin-box.shake{border-color:${C.error};animation:shake .3s ease}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        .pin-err{color:${C.error};font-size:12.5px;min-height:18px;text-align:center}
        .trow{display:flex;align-items:center;justify-content:space-between;padding:11px 0}
        .tlabel{font-size:13.5px;font-weight:500}
        .tog{width:42px;height:23px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
        .tog.on{background:${C.highlight}}.tog.off{background:${C.border}}
        .tog::after{content:'';position:absolute;top:2.5px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s}
        .tog.on::after{left:21px}.tog.off::after{left:2.5px}
        .dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px}
        .dot-on{background:${C.success}}.dot-off{background:${C.error}}
        .palette-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
        .swatch-wrap{text-align:center;width:72px;display:flex;flex-direction:column;align-items:center;gap:5px}
        .swatch{width:40px;height:40px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:transform .15s,border-color .15s}
        .swatch:hover{transform:scale(1.1)}
        .swatch.on{border-color:${C.highlight};transform:scale(1.1)}
        .swatch-lbl{font-size:10.5px;color:${C.textMuted};margin-top:3px;font-family:${F.detail}}
        .font-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-top:10px}
        .font-card{padding:11px;border:2px solid ${C.border};border-radius:10px;cursor:pointer;transition:all .15s;background:${C.cardBg};text-align:center}
        .font-card:hover{border-color:${C.accentLight};background:${C.cardAlt}}
        .font-card.on{border-color:${C.highlight};background:${C.cardAlt}}
        .font-card-lbl{font-size:9.5px;font-family:${F.detail};letter-spacing:.07em;text-transform:uppercase;color:${C.highlight};margin-bottom:4px}
        .font-card-display{font-size:14px;font-weight:600;color:${C.headingText};line-height:1.2;margin-bottom:1px}
        .font-card-body{font-size:10.5px;color:${C.textMuted}}
        .color-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px}
        .color-row{display:flex;align-items:center;gap:9px}
        .color-swatch-btn{width:32px;height:32px;border-radius:6px;border:1.5px solid ${C.border};cursor:pointer;flex-shrink:0;position:relative;overflow:hidden}
        .color-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
        .color-lbl{font-size:12px;color:${C.text};font-weight:500;margin-bottom:3px}
        .color-hex{width:90px;padding:4px 7px;border:1.5px solid ${C.border};border-radius:6px;font-family:${F.detail};font-size:12px;color:${C.text};background:${C.cardBg};outline:none;transition:border-color .15s}
        .color-hex:focus{border-color:${C.highlight}}
        .subsection{font-size:12.5px;font-weight:600;color:${C.accentLight};margin-bottom:8px;margin-top:4px}
        /* Options admin */
        .opt-row{border:1.5px solid ${C.border};border-radius:10px;background:${C.cardBg};margin-bottom:8px;overflow:hidden}
        .opt-header{display:flex;align-items:center;gap:9px;padding:10px 13px;cursor:pointer;user-select:none}
        .opt-label{flex:1;font-size:13.5px;font-weight:600;color:${C.text}}
        .opt-chip{font-size:12px;padding:3px 10px;border-radius:100px;background:${C.cardAlt};border:1px solid ${C.border};color:${C.text};font-family:${F.detail}}
        .opt-body{background:${C.cardAlt};border-top:1px solid ${C.border};padding:13px}
        .empty{text-align:center;padding:72px 20px;color:${C.textMuted}}
        .empty-t{font-family:${F.display};font-size:21px;color:${C.headingText};margin-bottom:7px}
        .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:${C.accent};color:#fff;padding:11px 22px;border-radius:100px;font-size:13.5px;font-weight:500;z-index:999;animation:tIn .28s ease;white-space:nowrap}
        @keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:center;justify-content:center;padding:22px}
        .modal{background:${C.cardBg};border-radius:14px;padding:28px;max-width:390px;width:100%}
        .modal-t{font-family:${F.display};font-size:20px;font-weight:600;color:${C.headingText};margin-bottom:10px}
        .modal-b{font-size:13.5px;color:${C.textMuted};margin-bottom:22px;line-height:1.5}
        .modal-a{display:flex;gap:9px;justify-content:flex-end}
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────
// AVATAR EMOJI — food & drink themed set
// ─────────────────────────────────────────────
const AVATAR_EMOJIS = ["☕","🍵","🧋","🍃","🌿","🌸","🍊","🫐","🍋","🌼","🍰","🧁","🍩","🍪","🫖"];
const getAvatar = (name) => {
  // Deterministic — same name always gets same emoji within a session
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
};
// ─────────────────────────────────────────────
const Toast = ({ msg }) => msg ? <div className="toast">{msg}</div> : null;
const Confirm = ({ title, body, confirmLabel="Confirm", danger, onConfirm, onCancel }) => (
  <div className="backdrop" onClick={onCancel}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-t">{title}</div>
      <div className="modal-b">{body}</div>
      <div className="modal-a">
        <button className="btn btn-o" onClick={onCancel}>Cancel</button>
        <button className={`btn ${danger?"btn-d":"btn-p"}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// PIN SCREEN
// ─────────────────────────────────────────────
const PinScreen = ({ mode, storedHash, onSuccess, onSetPin }) => {
  const [digits, setDigits] = useState(["","","",""]);
  const [conf, setConf] = useState(["","","",""]);
  const [step, setStep] = useState("enter");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const refs = useRef([]);
  const doShake = () => { setShake(true); setTimeout(()=>setShake(false),400); };
  const handleInput = async (arr, setArr, i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next=[...arr]; next[i]=val.slice(-1); setArr(next); setErr("");
    if (val&&i<3) refs.current[i+1]?.focus();
    if (val&&i===3&&mode!=="setup") { const ok=await verifyPin(next.join(""),storedHash); if(ok){onSuccess();}else{setErr("Incorrect PIN");setDigits(["","","",""]);doShake();setTimeout(()=>refs.current[0]?.focus(),50);} }
    if (val&&i===3&&mode==="setup"&&step==="enter") { setStep("confirm");setConf(["","","",""]);setTimeout(()=>refs.current[4]?.focus(),50); }
  };
  const handleConf = async (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next=[...conf]; next[i]=val.slice(-1); setConf(next); setErr("");
    if (val&&i<3) refs.current[i+5]?.focus();
    if (val&&i===3) { if(next.join("")!==digits.join("")){setErr("PINs don't match");setConf(["","","",""]);doShake();setTimeout(()=>refs.current[4]?.focus(),50);}else{const hash=await hashPin(next.join(""));onSetPin(hash);onSuccess();} }
  };
  return (
    <div className="page-center" style={{textAlign:"center"}}>
      <div style={{fontSize:38,marginBottom:14}}>🔐</div>
      <div className="eyebrow" style={{display:"flex",justifyContent:"center"}}>{mode==="setup"?"Admin Setup":"Admin Access"}</div>
      <h2 style={{fontSize:22,fontWeight:600,margin:"6px 0 8px"}}>{mode==="setup"?(step==="enter"?"Set a PIN":"Confirm your PIN"):"Enter your PIN"}</h2>
      <p style={{fontSize:13.5,opacity:.6}}>{mode==="setup"?"Protects Admin and Queue.":"Required for Admin and Queue."}</p>
      {step==="enter"&&<div className="pin-row">{[0,1,2,3].map(i=><input key={i} ref={el=>refs.current[i]=el} className={`pin-box ${shake?"shake":""}`} type="password" inputMode="numeric" maxLength={1} value={digits[i]} autoFocus={i===0} onChange={e=>handleInput(digits,setDigits,i,e.target.value)} onKeyDown={e=>e.key==="Backspace"&&!digits[i]&&i>0&&refs.current[i-1]?.focus()}/>)}</div>}
      {step==="confirm"&&<div className="pin-row">{[0,1,2,3].map(i=><input key={`c${i}`} ref={el=>refs.current[i+4]=el} className={`pin-box ${shake?"shake":""}`} type="password" inputMode="numeric" maxLength={1} value={conf[i]} autoFocus={i===0} onChange={e=>handleConf(i,e.target.value)} onKeyDown={e=>e.key==="Backspace"&&!conf[i]&&i>0&&refs.current[i+3]?.focus()}/>)}</div>}
      <div className="pin-err">{err}</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// OPTION ROW (admin) — add/edit/delete option types
// ─────────────────────────────────────────────
const CategoryRow = ({ cat, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const save = () => { if (!name.trim()) return; onUpdate({ ...cat, name: name.trim() }); setEditing(false); };
  const cancel = () => { setName(cat.name); setEditing(false); };
  return (
    <div className="opt-row">
      <div className="opt-header">
        {editing
          ? <input value={name} onChange={e=>setName(e.target.value)} maxLength={30} autoFocus
              onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")cancel();}} style={{flex:1,minWidth:0}}/>
          : <span className="opt-label" style={{flex:1,minWidth:0}}>{cat.name}</span>}
        <div style={{display:"flex",gap:6,marginLeft:8,flexShrink:0}}>
          <button className="btn btn-o sm" onClick={onMoveUp} disabled={!onMoveUp} style={{padding:"5px 8px"}}>↑</button>
          <button className="btn btn-o sm" onClick={onMoveDown} disabled={!onMoveDown} style={{padding:"5px 8px"}}>↓</button>
          {editing
            ? <button className="btn btn-p sm" disabled={!name.trim()} onClick={save}>Save</button>
            : <button className="btn btn-o sm" onClick={()=>setEditing(true)}>Edit</button>}
          <button className="btn btn-d sm" onClick={()=>onDelete(cat.id)}>✕</button>
        </div>
      </div>
    </div>
  );
};

const OptionRow = ({ opt, onUpdate, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(opt.label);
  const [choices, setChoices] = useState(opt.choices||[]);
  const [newChoice, setNewChoice] = useState({name:"",description:""});
  const [editingChoiceId, setEditingChoiceId] = useState(null);
  const [editDraft, setEditDraft] = useState({name:"",description:""});

  const save = () => {
    if (!label.trim()||choices.length===0) return;
    onUpdate({...opt, label:label.trim(), choices});
    setOpen(false);
  };
  const cancel = () => {
    setLabel(opt.label);
    setChoices(opt.choices||[]);
    setNewChoice({name:"",description:""});
    setEditingChoiceId(null);
    setOpen(false);
  };
  const addChoice = () => {
    if (!newChoice.name.trim()) return;
    setChoices(prev=>[...prev,{id:uid(),name:newChoice.name.trim(),description:newChoice.description.trim()}]);
    setNewChoice({name:"",description:""});
  };
  const removeChoice = (id) => setChoices(prev=>prev.filter(c=>c.id!==id));
  const startEdit = (c) => { setEditingChoiceId(c.id); setEditDraft({name:c.name,description:c.description}); };
  const saveEdit = (id) => {
    if (!editDraft.name.trim()) return;
    setChoices(prev=>prev.map(c=>c.id===id?{...c,name:editDraft.name.trim(),description:editDraft.description.trim()}:c));
    setEditingChoiceId(null);
  };

  return (
    <div className="opt-row">
      <div className="opt-header" onClick={()=>setOpen(v=>!v)}>
        <div style={{flex:1,minWidth:0}}>
          <span className="opt-label">{opt.label}</span>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:5}}>
            {(opt.choices||[]).map(c=>(
              <span key={c.id||c} className="opt-chip">{c.name||c}</span>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginLeft:8,flexShrink:0}} onClick={e=>e.stopPropagation()}>
          <button className="btn btn-o sm" onClick={()=>setOpen(v=>!v)}>{open?"Cancel":"Edit"}</button>
          <button className="btn btn-d sm" onClick={()=>onDelete(opt.id)}>✕</button>
        </div>
      </div>
      {open && (
        <div className="opt-body">
          <div className="field" style={{marginBottom:14}}>
            <label>Option Label</label>
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Coffee Type" maxLength={40}/>
          </div>

          {/* Existing choices */}
          <div style={{marginBottom:10}}>
            <div className="subsection">Choices</div>
            {choices.length===0&&<div style={{fontSize:13,opacity:.5,marginBottom:8}}>No choices yet.</div>}
            {choices.map(c=>(
              <div key={c.id} style={{background:"rgba(0,0,0,.04)",borderRadius:8,padding:"10px 12px",marginBottom:7}}>
                {editingChoiceId===c.id ? (
                  <div>
                    <div className="f2" style={{marginBottom:7}}>
                      <div className="field" style={{marginBottom:0}}>
                        <label>Name</label>
                        <input value={editDraft.name} onChange={e=>setEditDraft(d=>({...d,name:e.target.value}))} maxLength={40}/>
                      </div>
                      <div className="field" style={{marginBottom:0}}>
                        <label>Description (optional)</label>
                        <input value={editDraft.description} onChange={e=>setEditDraft(d=>({...d,description:e.target.value}))} maxLength={120}/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                      <button className="btn btn-o sm" onClick={()=>setEditingChoiceId(null)}>Cancel</button>
                      <button className="btn btn-p sm" disabled={!editDraft.name.trim()} onClick={()=>saveEdit(c.id)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13.5,fontWeight:500}}>{c.name}</div>
                      {c.description&&<div style={{fontSize:12,opacity:.6,marginTop:2}}>{c.description}</div>}
                    </div>
                    <button className="btn btn-o sm" onClick={()=>startEdit(c)}>Edit</button>
                    <button className="btn btn-d sm" onClick={()=>removeChoice(c.id)}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new choice */}
          <div style={{marginBottom:12}}>
            <div className="subsection">Add Choice</div>
            <div className="f2" style={{marginBottom:7}}>
              <div className="field" style={{marginBottom:0}}>
                <label>Name</label>
                <input value={newChoice.name} onChange={e=>setNewChoice(d=>({...d,name:e.target.value}))} placeholder="e.g. Light Roast" maxLength={40} onKeyDown={e=>e.key==="Enter"&&addChoice()}/>
              </div>
              <div className="field" style={{marginBottom:0}}>
                <label>Description (optional)</label>
                <input value={newChoice.description} onChange={e=>setNewChoice(d=>({...d,description:e.target.value}))} placeholder="e.g. Dak Coffee, Notes: Blueberry" maxLength={120}/>
              </div>
            </div>
            <button className="btn btn-o sm" disabled={!newChoice.name.trim()} onClick={addChoice}>Add choice</button>
          </div>

          <div style={{display:"flex",gap:7,justifyContent:"flex-end",borderTop:`1px solid rgba(0,0,0,.08)`,paddingTop:12}}>
            <button className="btn btn-o sm" onClick={cancel}>Cancel</button>
            <button className="btn btn-p sm" disabled={!label.trim()||choices.length===0} onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MENU ITEM ROW (admin) — inline editable, generalized options
// ─────────────────────────────────────────────
const MenuItemRow = ({ drink, allOptions, allCategories=[], onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(drink);

  const toggleOpt = (id) => {
    const ids = draft.optionIds||[];
    setDraft(d=>({...d, optionIds: ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]}));
  };
  const setCategory = (id) => setDraft(d=>({...d, categoryId: d.categoryId===id ? "" : id}));
  const save = () => { onUpdate({...draft,name:draft.name.trim()}); setEditing(false); };
  const cancel = () => { setDraft(drink); setEditing(false); };

  const appliedOptions = allOptions.filter(o=>(drink.optionIds||[]).includes(o.id));
  const appliedCategory = allCategories.find(c=>c.id===drink.categoryId);

  return (
    <div className="mrow">
      <div className="mrow-header">
        <div className="mrow-info">
          <div className="mrow-name">{drink.name}{appliedCategory && <span className="mrow-cat">{appliedCategory.name}</span>}</div>
          {drink.description && <div className="mrow-desc">{drink.description}</div>}
          {appliedOptions.length > 0 && (
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
              {appliedOptions.map(o=><span key={o.id} className="mtoggle on" style={{cursor:"default",fontSize:11,padding:"3px 9px"}}>{o.label}</span>)}
            </div>
          )}
        </div>
        <div className="mrow-actions">
          <button className="btn btn-o sm" onClick={onMoveUp} disabled={!onMoveUp} style={{padding:"5px 8px"}}>↑</button>
          <button className="btn btn-o sm" onClick={onMoveDown} disabled={!onMoveDown} style={{padding:"5px 8px"}}>↓</button>
          <button className="btn btn-o sm" onClick={()=>setEditing(v=>!v)}>{editing?"Cancel":"Edit"}</button>
          <button className="btn btn-d sm" onClick={()=>onDelete(drink.id)}>✕</button>
        </div>
      </div>
      {editing && (
        <div className="mrow-edit">
          <div className="field" style={{marginBottom:10}}>
            <label>Name</label>
            <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} maxLength={50}/>
          </div>
          <div className="field" style={{marginBottom:10}}>
            <label>Description (optional)</label>
            <textarea value={draft.description||""} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} placeholder="e.g. Espresso, oat milk, house-made vanilla syrup — served iced" maxLength={200} rows={2}/>
          </div>
          {allCategories.length>0 && (
            <div style={{marginBottom:10}}>
              <div style={{fontSize:12.5,fontWeight:500,marginBottom:6,opacity:.7}}>Category</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {allCategories.map(c=>(
                  <button key={c.id} className={`mtoggle ${draft.categoryId===c.id?"on":"off"}`} onClick={()=>setCategory(c.id)}>{c.name}</button>
                ))}
              </div>
            </div>
          )}
          {allOptions.length>0 && (
            <div style={{marginBottom:10}}>
              <div style={{fontSize:12.5,fontWeight:500,marginBottom:6,opacity:.7}}>Options</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {allOptions.map(o=>(
                  <button key={o.id} className={`mtoggle ${(draft.optionIds||[]).includes(o.id)?"on":"off"}`} onClick={()=>toggleOpt(o.id)}>{o.label}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:4}}>
            <button className="btn btn-o sm" onClick={cancel}>Cancel</button>
            <button className="btn btn-p sm" disabled={!draft.name.trim()} onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// APPEARANCE PANEL
// ─────────────────────────────────────────────
const AppearancePanel = ({ themeConfig, setThemeConfig, resolvedColors }) => {
  const [colorMode, setColorModeState] = useState(themeConfig.colorMode || "palette");
  const [fontMode, setFontModeState] = useState(themeConfig.fontMode || "pairing");

  const setColorMode = (mode) => { setColorModeState(mode); setThemeConfig(t=>({...t,colorMode:mode})); };
  const setFontMode = (mode) => { setFontModeState(mode); setThemeConfig(t=>({...t,fontMode:mode})); };
  const C = resolvedColors;
  const customColors = themeConfig.customColors || PALETTES[themeConfig.palette].colors;

  const setColor = (key,val) => setThemeConfig(t=>({...t,customColors:{...(t.customColors||PALETTES[t.palette].colors),[key]:val}}));
  const resetColors = () => setThemeConfig(t=>({...t,customColors:null}));
  const setCustomFont = (role,opt) => {
    const pairing = FONT_PAIRINGS[themeConfig.fonts];
    const cur = themeConfig.customFonts||{display:pairing.display,displayUrl:"",body:pairing.body,bodyUrl:"",detail:pairing.detail,detailUrl:""};
    setThemeConfig(t=>({...t,customFonts:{...cur,[role]:opt.value,[`${role}Url`]:opt.url}}));
  };
  const resetFonts = () => setThemeConfig(t=>({...t,customFonts:null}));

  return (
    <div className="card">
      <div className="eyebrow">Appearance</div>

      <div style={{marginTop:14}}>
        <div className="subsection">Colors</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button className={`btn sm ${colorMode==="palette"?"btn-p":"btn-o"}`} onClick={()=>setColorMode("palette")}>Palettes</button>
          <button className={`btn sm ${colorMode==="custom"?"btn-p":"btn-o"}`} onClick={()=>setColorMode("custom")}>Custom</button>
          {themeConfig.customColors&&<button className="btn btn-d sm" onClick={resetColors}>Reset</button>}
        </div>
        {colorMode==="palette"&&(
          <div className="palette-row">
            {Object.entries(PALETTES).map(([key,p])=>(
              <div className="swatch-wrap" key={key}>
                <div className={`swatch ${themeConfig.palette===key&&!themeConfig.customColors?"on":""}`} style={{background:`linear-gradient(135deg, ${p.colors.accent} 50%, ${p.colors.highlight} 50%)`}} onClick={()=>setThemeConfig(t=>({...t,palette:key,customColors:null}))} title={p.label}/>
                <div className="swatch-lbl">{p.label}</div>
              </div>
            ))}
          </div>
        )}
        {colorMode==="custom"&&(
          <div className="color-grid">
            {COLOR_ROLES.map(role=>{
              const val = customColors[role.key] || "#000000";
              return (
                <div key={role.key}>
                  <div className="color-lbl">{role.label}</div>
                  <div className="color-row">
                    <div className="color-swatch-btn" style={{background:val}}>
                      <input type="color" className="color-input" value={val} onChange={e=>setColor(role.key,e.target.value)}/>
                    </div>
                    <input
                      className="color-hex"
                      value={val}
                      onChange={e=>{
                        const v = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(v)) setColor(role.key, v);
                        else if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(role.key, v);
                      }}
                      onBlur={e=>{ if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setColor(role.key, val); }}
                      maxLength={7}
                      spellCheck={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="divider"/>

      <div>
        <div className="subsection">Fonts</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button className={`btn sm ${fontMode==="pairing"?"btn-p":"btn-o"}`} onClick={()=>setFontMode("pairing")}>Pairings</button>
          <button className={`btn sm ${fontMode==="custom"?"btn-p":"btn-o"}`} onClick={()=>setFontMode("custom")}>Custom</button>
          {themeConfig.customFonts&&<button className="btn btn-d sm" onClick={resetFonts}>Reset</button>}
        </div>
        {fontMode==="pairing"&&(
          <div className="font-grid">
            {Object.entries(FONT_PAIRINGS).map(([key,f])=>(
              <div key={key} className={`font-card ${themeConfig.fonts===key&&!themeConfig.customFonts?"on":""}`} onClick={()=>setThemeConfig(t=>({...t,fonts:key,customFonts:null}))}>
                <div className="font-card-lbl">{f.label}</div>
                <div className="font-card-display" style={{fontFamily:f.display}}>{f.displayName.split(" ")[0]}</div>
                <div className="font-card-body" style={{fontFamily:f.body}}>{f.bodyName.split(" ")[0]}</div>
                <div className="font-card-body" style={{fontFamily:f.detail,fontSize:"9px",marginTop:2,opacity:.7}}>{f.detailName.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        )}
        {fontMode==="custom"&&(
          <>
            <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${[
              ...GOOGLE_FONT_OPTIONS.display,
              ...GOOGLE_FONT_OPTIONS.body,
              ...GOOGLE_FONT_OPTIONS.detail,
            ].map(o=>`family=${o.url}`).join("&")}&display=swap`}/>
            {[
              {key:"display", label:"Heading / Display Font"},
              {key:"body",    label:"Body / UI Font"},
              {key:"detail",  label:"Detail Font"},
            ].map(role=>{
              const opts = GOOGLE_FONT_OPTIONS[role.key];
              const cur = themeConfig.customFonts?.[role.key] || FONT_PAIRINGS[themeConfig.fonts][role.key];
              return (
                <div key={role.key} style={{marginBottom:16}}>
                  <div className="subsection">{role.label}</div>
                  <div className="font-grid">
                    {opts.map(o=>(
                      <div key={o.label} className={`font-card ${cur===o.value?"on":""}`} onClick={()=>setCustomFont(role.key,o)}>
                        <div className="font-card-lbl">{o.label.split(" ")[0]}</div>
                        <div className="font-card-display" style={{fontFamily:o.value}}>{o.label.split(" ")[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LOGO DISPLAY — used in nav and hero
// ─────────────────────────────────────────────
const DEFAULT_FALLBACK_EMOJI = "☕";
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB

const LogoDisplay = ({ config, size="nav" }) => {
  const useImage = config.logoMode === "image" && config.logoImage;
  const emoji = config.logoEmoji || DEFAULT_FALLBACK_EMOJI;
  if (size === "nav") {
    return useImage
      ? <img src={config.logoImage} alt="logo" style={{height:32,maxWidth:120,objectFit:"contain",borderRadius:4}}/>
      : <span>{emoji}</span>;
  }
  // hero
  return useImage
    ? <img src={config.logoImage} alt="logo" style={{height:72,maxWidth:240,objectFit:"contain",borderRadius:6,marginBottom:14,display:"block",margin:"0 auto 14px"}}/>
    : <span className="hero-ico">{emoji}</span>;
};

// ─────────────────────────────────────────────
// BRANDING CARD (admin)
// ─────────────────────────────────────────────
const BrandingCard = ({ config, upd }) => {
  const [imgError, setImgError] = useState("");
  const [emojiInput, setEmojiInput] = useState(null);
  const fileRef = useRef();
  const logoMode = config.logoMode || "emoji";

  // Slice to first grapheme cluster — handles flags, skin tones, family emoji etc.
  const firstGrapheme = (str) => {
    if (!str) return "";
    try {
      const seg = new Intl.Segmenter();
      const [first] = seg.segment(str);
      return first?.segment || "";
    } catch {
      return [...str][0] || "";
    }
  };

  const handleEmojiChange = (val) => {
    const g = firstGrapheme(val);
    setEmojiInput(g);
    if (g) upd({ logoEmoji: g });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/png","image/jpeg","image/jpg","image/webp","image/svg+xml","image/gif"];
    if (!validTypes.includes(file.type)) { setImgError("Unsupported format. Use PNG, JPG, WebP, SVG, or GIF."); return; }
    if (file.size > MAX_LOGO_BYTES) { setImgError(`Image exceeds 5 MB limit (${(file.size/1024/1024).toFixed(1)} MB). Please use a smaller file.`); return; }
    setImgError("");
    const reader = new FileReader();
    reader.onload = (ev) => upd({ logoImage: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="card">
      <div className="eyebrow">Branding</div>
      <div className="f2" style={{marginTop:11}}>
        <div className="field"><label>Café Name</label><input value={config.cafeName} onChange={e=>upd({cafeName:e.target.value})} maxLength={40}/></div>
        <div className="field"><label>Tagline</label><input value={config.tagline} onChange={e=>upd({tagline:e.target.value})} maxLength={80}/></div>
      </div>

      {/* Logo mode toggle */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12.5,fontWeight:500,marginBottom:8,opacity:.7}}>Logo</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button className={`btn sm ${logoMode==="emoji"?"btn-p":"btn-o"}`} onClick={()=>upd({logoMode:"emoji"})}>Emoji</button>
          <button className={`btn sm ${logoMode==="image"?"btn-p":"btn-o"}`} onClick={()=>upd({logoMode:"image"})}>Image</button>
        </div>

        {logoMode==="emoji" && (
          <div className="field" style={{marginBottom:0}}>
            <label>Emoji</label>
            <input
              value={emojiInput === null ? (config.logoEmoji || DEFAULT_FALLBACK_EMOJI) : emojiInput}
              onChange={e=>handleEmojiChange(e.target.value)}
              style={{width:64,fontSize:24,textAlign:"center",padding:"6px 8px"}}
            />
          </div>
        )}

        {logoMode==="image" && (
          <div>
            {config.logoImage && (
              <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <img src={config.logoImage} alt="logo preview" style={{height:48,maxWidth:160,objectFit:"contain",borderRadius:4,border:`1px solid var(--border, #ccc)`}}/>
                <button className="btn btn-d sm" onClick={()=>{ upd({logoImage:null}); setImgError(""); }}>Remove</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif" style={{display:"none"}} onChange={handleFile}/>
            <button className="btn btn-o sm" onClick={()=>fileRef.current?.click()}>
              {config.logoImage?"Replace image":"Upload image"}
            </button>
            <div className="hint" style={{marginTop:6}}>PNG, JPG, WebP, SVG, GIF · max 5 MB</div>
            {imgError && <div className="ferr" style={{marginTop:4}}>{imgError}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────
const Admin = ({ config, setConfig, isOpen, setIsOpen, orders, completed, onClearOrders, onChangePin, onSignOut, themeConfig, setThemeConfig, resolvedColors }) => {
  const [newDrink, setNewDrink] = useState({name:"",optionIds:[],description:"",categoryId:""});
  const [newOpt, setNewOpt] = useState({label:""});
  const [newCat, setNewCat] = useState({name:""});
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelOpt, setConfirmDelOpt] = useState(null);
  const [confirmDelCat, setConfirmDelCat] = useState(null);

  const upd = (patch) => setConfig(c=>({...c,...patch}));

  const updateDrink = (updated) => upd({menu:config.menu.map(d=>d.id===updated.id?updated:d)});
  const deleteDrink = (id) => upd({menu:config.menu.filter(d=>d.id!==id)});
  const moveDrink = (id, dir) => {
    const menu = [...config.menu];
    const idx = menu.findIndex(d=>d.id===id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= menu.length) return;
    [menu[idx], menu[newIdx]] = [menu[newIdx], menu[idx]];
    upd({menu});
  };
  const addDrink = () => {
    if (!newDrink.name.trim()) return;
    upd({menu:[...config.menu,{...newDrink,id:uid(),name:newDrink.name.trim()}]});
    setNewDrink({name:"",optionIds:[],description:"",categoryId:""});
  };

  const cats = config.categories||[];
  const updateCategory = (updated) => upd({categories:cats.map(c=>c.id===updated.id?updated:c)});
  const deleteCategory = (id) => {
    upd({
      categories: cats.filter(c=>c.id!==id),
      menu: config.menu.map(d=>d.categoryId===id?{...d,categoryId:""}:d),
    });
    setConfirmDelCat(null);
  };
  const addCategory = () => {
    if (!newCat.name.trim()) return;
    upd({categories:[...cats,{id:uid(),name:newCat.name.trim()}]});
    setNewCat({name:""});
  };
  const moveCategory = (id, dir) => {
    const list = [...cats];
    const idx = list.findIndex(c=>c.id===id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    upd({categories:list});
  };

  const updateOption = (updated) => upd({options:config.options.map(o=>o.id===updated.id?updated:o)});
  const deleteOption = (id) => {
    upd({
      options: config.options.filter(o=>o.id!==id),
      menu: config.menu.map(d=>({...d,optionIds:(d.optionIds||[]).filter(oid=>oid!==id)})),
    });
    setConfirmDelOpt(null);
  };
  const addOption = () => {
    if (!newOpt.label.trim()) return;
    upd({options:[...config.options,{id:uid(),label:newOpt.label.trim(),choices:[]}]});
    setNewOpt({label:""});
  };

  const toggleNewDrinkOpt = (id) => {
    const ids=newDrink.optionIds||[];
    setNewDrink(d=>({...d,optionIds:ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]}));
  };
  const setNewDrinkCat = (id) => setNewDrink(d=>({...d,categoryId:d.categoryId===id?"":id}));

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div className="eyebrow">Admin</div>
        <div style={{display:"flex",gap:7}}>
          <button className="btn btn-o sm" onClick={onChangePin}>Change PIN</button>
          <button className="btn btn-o sm" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
      <h1 className="heading">Café Configuration</h1>

      {/* Branding */}
      <BrandingCard config={config} upd={upd}/>

      {/* Appearance */}
      <AppearancePanel themeConfig={themeConfig} setThemeConfig={setThemeConfig} resolvedColors={resolvedColors}/>

      {/* Order Options */}
      <div className="card">
        <div className="eyebrow">Order Options</div>
        <div style={{fontSize:12.5,opacity:.55,marginTop:6,marginBottom:14,lineHeight:1.5}}>
          Define the customizations guests can choose for each drink.
        </div>
        {(config.options||[]).map(opt=>(
          <OptionRow key={opt.id} opt={opt} onUpdate={updateOption} onDelete={(id)=>setConfirmDelOpt(id)}/>
        ))}
        <hr className="divider" style={{margin:"14px 0"}}/>
        <div className="subsection">Add Option Type</div>
        <div style={{marginTop:9,marginBottom:10}}>
          <div className="field" style={{marginBottom:10}}>
            <label>Label</label>
            <input value={newOpt.label} onChange={e=>setNewOpt(o=>({...o,label:e.target.value}))} placeholder="e.g. Coffee Type" maxLength={40} onKeyDown={e=>e.key==="Enter"&&addOption()}/>
          </div>
        </div>
        <div className="hint" style={{marginBottom:10}}>After adding, open the option to add choices.</div>
        <button className="btn btn-p sm" disabled={!newOpt.label.trim()} onClick={addOption}>Add Option</button>
      </div>

      {/* Menu Sections */}
      <div className="card">
        <div className="eyebrow">Menu Sections</div>
        <div style={{fontSize:12.5,opacity:.55,marginTop:6,marginBottom:14,lineHeight:1.5}}>
          Group drinks into sections on the order page. Drag order with ↑↓ — that's the order guests see. Assign each drink to a section when you edit it below.
        </div>
        {cats.length===0&&<div style={{fontSize:13.5,opacity:.5,padding:"4px 0 12px"}}>No sections yet. Add one below, then assign drinks to it.</div>}
        {cats.map((cat,i)=>(
          <CategoryRow key={cat.id} cat={cat} onUpdate={updateCategory} onDelete={(id)=>setConfirmDelCat(id)}
            onMoveUp={i>0 ? ()=>moveCategory(cat.id,-1) : null}
            onMoveDown={i<cats.length-1 ? ()=>moveCategory(cat.id,1) : null}
          />
        ))}
        <hr className="divider" style={{margin:"14px 0"}}/>
        <div className="subsection">Add Section</div>
        <div style={{marginTop:9,marginBottom:10}}>
          <div className="field" style={{marginBottom:10}}>
            <label>Name</label>
            <input value={newCat.name} onChange={e=>setNewCat({name:e.target.value})} placeholder="e.g. Coffee" maxLength={30} onKeyDown={e=>e.key==="Enter"&&addCategory()}/>
          </div>
        </div>
        <button className="btn btn-p sm" disabled={!newCat.name.trim()} onClick={addCategory}>Add Section</button>
      </div>

      {/* Menu */}
      <div className="card">
        <div className="eyebrow">Menu</div>
        <div style={{marginTop:11,marginBottom:14}}>
          {config.menu.length===0&&<div style={{fontSize:13.5,opacity:.5,padding:"13px 0"}}>No drinks yet.</div>}
          {config.menu.map((d,i)=>(
            <MenuItemRow key={d.id} drink={d} allOptions={config.options||[]} allCategories={cats} onUpdate={updateDrink} onDelete={deleteDrink}
              onMoveUp={i>0 ? ()=>moveDrink(d.id,-1) : null}
              onMoveDown={i<config.menu.length-1 ? ()=>moveDrink(d.id,1) : null}
            />
          ))}
        </div>
        <hr className="divider" style={{margin:"14px 0"}}/>
        <div className="subsection">Add Drink</div>
        <div style={{marginTop:9}}>
          <div className="field" style={{marginBottom:10}}>
            <label>Name</label>
            <input value={newDrink.name} onChange={e=>setNewDrink(d=>({...d,name:e.target.value}))} placeholder="e.g. Signature Latte" maxLength={50}/>
          </div>
          <div className="field" style={{marginBottom:10}}>
            <label>Description (optional)</label>
            <textarea value={newDrink.description} onChange={e=>setNewDrink(d=>({...d,description:e.target.value}))} placeholder="e.g. Espresso, oat milk, house-made vanilla syrup — served iced" maxLength={200} rows={2}/>
          </div>
          {cats.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12.5,fontWeight:500,marginBottom:6,opacity:.7}}>Category</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {cats.map(c=>(
                  <button key={c.id} className={`mtoggle ${newDrink.categoryId===c.id?"on":"off"}`} onClick={()=>setNewDrinkCat(c.id)}>{c.name}</button>
                ))}
              </div>
            </div>
          )}
          {(config.options||[]).length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12.5,fontWeight:500,marginBottom:6,opacity:.7}}>Options</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(config.options||[]).map(o=>(
                  <button key={o.id} className={`mtoggle ${(newDrink.optionIds||[]).includes(o.id)?"on":"off"}`} onClick={()=>toggleNewDrinkOpt(o.id)}>{o.label}</button>
                ))}
              </div>
            </div>
          )}
          <button className="btn btn-p sm" disabled={!newDrink.name.trim()} onClick={addDrink}>Add Drink</button>
        </div>
      </div>

      {/* Service */}
      <div className="card">
        <div className="eyebrow">Service</div>
        <div className="trow" style={{marginTop:7}}>
          <div className="tlabel"><span className={`dot ${isOpen?"dot-on":"dot-off"}`}/>{isOpen?"Open — accepting orders":"Closed"}</div>
          <button className={`tog ${isOpen?"on":"off"}`} onClick={()=>setIsOpen(v=>!v)}/>
        </div>
        <div className="field" style={{marginBottom:8,marginTop:4}}>
          <label>Closed message</label>
          <input value={config.closedMessage||""} onChange={e=>upd({closedMessage:e.target.value})} placeholder="We're not open yet — check back soon." maxLength={120}/>
        </div>
        <div className="field" style={{marginBottom:0}}>
          <label>Access code <span style={{opacity:.5,fontWeight:400}}>(optional)</span></label>
          <input value={config.accessCode||""} onChange={e=>upd({accessCode:e.target.value.trim()})} placeholder="Leave blank for no code" maxLength={20}/>
          <div className="hint">If set, guests must enter this code before placing an order.</div>
        </div>
      </div>

      {/* Queue */}
      <div className="card">
        <div className="eyebrow">Queue</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:7}}>
          <div style={{fontSize:13.5,opacity:.6}}>{orders.length} order{orders.length!==1?"s":""} in queue</div>
          <button className="btn btn-d sm" disabled={orders.length===0&&completed.length===0} onClick={()=>setConfirmClear(true)}>Clear all orders</button>
        </div>
      </div>

      {confirmClear&&<Confirm title="Clear all orders?" body={`This will permanently remove all pending and completed orders. This cannot be undone.`} confirmLabel="Clear orders" danger onConfirm={()=>{onClearOrders();setConfirmClear(false);}} onCancel={()=>setConfirmClear(false)}/>}
      {confirmDelOpt&&<Confirm title="Delete this option?" body="This will remove the option from all drinks that use it. This cannot be undone." confirmLabel="Delete" danger onConfirm={()=>deleteOption(confirmDelOpt)} onCancel={()=>setConfirmDelOpt(null)}/>}
      {confirmDelCat&&<Confirm title="Delete this section?" body="Drinks in this section won't be deleted — they'll just become uncategorized. This cannot be undone." confirmLabel="Delete" danger onConfirm={()=>deleteCategory(confirmDelCat)} onCancel={()=>setConfirmDelCat(null)}/>}
    </div>
  );
};

// ─────────────────────────────────────────────
// GUEST
// ─────────────────────────────────────────────
const Guest = ({ config, isOpen, onOrder }) => {
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [codeUnlocked, setCodeUnlocked] = useState(false);
  const isUnlocked = !config.accessCode || codeUnlocked;

  const handleCodeSubmit = () => {
    if (codeInput.trim() === config.accessCode) {
      setCodeUnlocked(true);
      setCodeErr("");
    } else {
      setCodeErr("Incorrect code — try again");
      setCodeInput("");
    }
  };
  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [photo, setPhoto] = useState(null);
  const [drinkId, setDrinkId] = useState(null);
  const [selections, setSelections] = useState({}); // { optionId: choiceValue }
  const [request, setRequest] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cam, setCam] = useState(false);
  const vidRef = useRef(null);
  const streamRef = useRef(null);

  const drink = config.menu.find(d=>d.id===drinkId);
  const drinkOptions = drink ? (config.options||[]).filter(o=>(drink.optionIds||[]).includes(o.id)) : [];
  const valid = () => !!sanitizeName(name) && !!drinkId && drinkOptions.every(o=>selections[o.id]);

  const selectDrink = (id) => { setDrinkId(id); setSelections({}); };

  const openCam = async () => {
    setCam(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          advanced: [{ zoom: 1 }],
        }
      });
      streamRef.current=s;
      if(vidRef.current) vidRef.current.srcObject=s;
    }
    catch { setCam(false); }
  };
  const snap = () => {
    const c=document.createElement("canvas");
    c.width=vidRef.current.videoWidth; c.height=vidRef.current.videoHeight;
    c.getContext("2d").drawImage(vidRef.current,0,0);
    setPhoto(c.toDataURL("image/jpeg",.8)); stopCam();
  };
  const stopCam = () => { streamRef.current?.getTracks().forEach(t=>t.stop()); setCam(false); };

  const submit = useCallback(() => {
    if (busy||!valid()) return;
    const clean=sanitizeName(name);
    if (!clean) { setNameErr("Please enter your name"); return; }
    setBusy(true);
    // Build mods in global option order
    const mods = drinkOptions.map(o=>selections[o.id]);
    onOrder({id:uid(),name:clean,photo,drink:drink.name,mods,request:request.trim().slice(0,MAX_REQUEST_LENGTH),message:message.trim().slice(0,MAX_MESSAGE_LENGTH),timestamp:Date.now()});
    setDone(true); setBusy(false);
  },[busy,name,drinkId,selections,photo,request,message,drink,drinkOptions]);

  const reset = () => { setName("");setPhoto(null);setDrinkId(null);setSelections({});setRequest("");setMessage("");setDone(false);setNameErr(""); };

  if (!isOpen) return <div className="page"><div className="hero"><LogoDisplay config={config} size="hero"/><div className="hero-name">{config.cafeName}</div><div className="hero-tag">{config.closedMessage||"We're not open yet — check back soon."}</div></div></div>;

  if (!isUnlocked) return (
    <div className="page">
      <div className="hero">
        <LogoDisplay config={config} size="hero"/>
        <div className="hero-name">{config.cafeName}</div>
        <div className="hero-tag">{config.tagline}</div>
      </div>
      <div className="card" style={{maxWidth:360,margin:"0 auto"}}>
        <div className="field">
          <label>Enter access code</label>
          <input
            value={codeInput}
            onChange={e=>{setCodeInput(e.target.value);setCodeErr("");}}
            onKeyDown={e=>e.key==="Enter"&&handleCodeSubmit()}
            placeholder="••••••"
            style={{letterSpacing:"0.15em",textAlign:"center"}}
            autoFocus
          />
          {codeErr&&<div className="ferr">{codeErr}</div>}
        </div>
        <button className="btn btn-p full" onClick={handleCodeSubmit} disabled={!codeInput.trim()}>
          Continue
        </button>
      </div>
    </div>
  );
  if (done) return <div className="page"><div className="hero" style={{paddingTop:72}}><span className="hero-ico">✅</span><div className="hero-name">Order placed!</div><div className="hero-tag" style={{marginBottom:28}}>{drink?.name} coming right up.</div><button className="btn btn-p" onClick={reset}>Order another</button></div></div>;

  return (
    <div className="page">
      <div className="hero">
        <LogoDisplay config={config} size="hero"/>
        <div className="hero-name">{config.cafeName}</div>
        <div className="hero-tag">{config.tagline}</div>
      </div>
      <div className="card">
        <div className="field">
          <label>Your first name</label>
          <input value={name} onChange={e=>{setName(e.target.value);if(nameErr)setNameErr("");}} onBlur={()=>!sanitizeName(name)&&name&&setNameErr("Please enter a valid name")} maxLength={MAX_NAME_LENGTH} className={nameErr?"err":""}/>
          {nameErr&&<div className="ferr">{nameErr}</div>}
        </div>

        {!cam&&(
          <div className="photo-zone" onClick={openCam}>
            {photo?<><img src={photo} className="photo-thumb" alt="you"/><div style={{fontSize:12.5,opacity:.6}}>Tap to retake</div></>:<><div style={{fontSize:30,marginBottom:7}}>📷</div><div style={{fontSize:13.5,opacity:.6}}>Add a photo <span style={{opacity:.8}}>(optional)</span></div></>}
          </div>
        )}
        {cam&&(
          <div style={{marginBottom:18,textAlign:"center"}}>
            <video ref={vidRef} autoPlay playsInline style={{width:"100%",borderRadius:9,marginBottom:9}}/>
            <div style={{display:"flex",gap:7,justifyContent:"center"}}>
              <button className="btn btn-h" onClick={snap}>📸 Capture</button>
              <button className="btn btn-o" onClick={stopCam}>Cancel</button>
            </div>
          </div>
        )}

        <div className="eyebrow">Choose your drink</div>
        {(() => {
          // Build ordered, non-empty sections from the managed category list;
          // drinks with no/unknown category go in a trailing "More" section.
          const cats = config.categories || [];
          const catIds = new Set(cats.map(c => c.id));
          const sections = cats
            .map(cat => ({ title: cat.name, items: config.menu.filter(d => d.categoryId === cat.id) }))
            .filter(s => s.items.length);
          const rest = config.menu.filter(d => !d.categoryId || !catIds.has(d.categoryId));
          if (rest.length) sections.push({ title: sections.length ? "More" : "", items: rest });
          const renderRow = d => (
            <div key={d.id} className={`drow ${drinkId===d.id?"on":""}`} onClick={()=>selectDrink(d.id)}>
              <div className="drow-body">
                <div className="drow-name">{d.name}</div>
                {d.description&&<div className="drow-desc">{d.description}</div>}
              </div>
              <div className="drow-check">{drinkId===d.id?"✓":""}</div>
            </div>
          );
          return sections.map((s,i) => (
            <div key={s.title||i}>
              {s.title && <div className="menu-section-title">{s.title}</div>}
              <div className="dlist" style={!s.title?{marginTop:9}:undefined}>{s.items.map(renderRow)}</div>
            </div>
          ));
        })()}

        {/* Render options in global order */}
        {drinkOptions.map(opt=>{
          const hasDescriptions = (opt.choices||[]).some(c=>c.description);
          return (
            <div key={opt.id}>
              <div className="eyebrow">{opt.label}</div>
              {hasDescriptions ? (
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18,marginTop:7}}>
                  {(opt.choices||[]).map(c=>{
                    const name = c.name||c;
                    const desc = c.description||"";
                    const selected = selections[opt.id]===name;
                    return (
                      <div
                        key={c.id||name}
                        className={`choice-card ${selected?"on":""}`}
                        onClick={()=>setSelections(s=>({...s,[opt.id]:name}))}
                      >
                        <div className="choice-card-name">{name}</div>
                        {desc&&<div className="choice-card-desc">{desc}</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pills" style={{marginTop:7}}>
                  {(opt.choices||[]).map(c=>{
                    const name = c.name||c;
                    return (
                      <div key={c.id||name} className={`pill ${selections[opt.id]===name?"on":""}`} onClick={()=>setSelections(s=>({...s,[opt.id]:name}))}>
                        <div style={{fontWeight:500}}>{name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="field" style={{marginTop:4}}>
          <label>Any requests? <span style={{opacity:.5,fontWeight:400}}>(optional)</span></label>
          <input value={request} onChange={e=>setRequest(e.target.value.slice(0,MAX_REQUEST_LENGTH))} placeholder="e.g. Not too hot, light on the milk…" maxLength={MAX_REQUEST_LENGTH}/>
          <div className="char-count">{request.length}/{MAX_REQUEST_LENGTH}</div>
        </div>

        <div className="field" style={{marginTop:4}}>
          <label>Leave a message <span style={{opacity:.5,fontWeight:400}}>(optional)</span></label>
          <input value={message} onChange={e=>setMessage(e.target.value.slice(0,MAX_MESSAGE_LENGTH))} placeholder="For the barista, a fellow guest, or anyone who's reading…" maxLength={MAX_MESSAGE_LENGTH}/>
          <div className="char-count">{message.length}/{MAX_MESSAGE_LENGTH}</div>
        </div>

        <button className="btn btn-p full" style={{marginTop:4}} onClick={submit} disabled={!valid()||busy}>
          {busy?"Placing order…":"Place Order"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// QUEUE
// ─────────────────────────────────────────────
const Queue = ({ orders, completed, config, onComplete, onRemove }) => (
  <div className="page-wide">
    <div className="eyebrow">Queue</div>
    <h1 className="heading">{orders.length===0?"Barista View":`${orders.length} order${orders.length!==1?"s":""} pending`}</h1>
    {orders.length===0
      ?<div className="empty"><div style={{marginBottom:14}}><LogoDisplay config={config} size="hero"/></div><div className="empty-t">Queue is empty</div><div style={{fontSize:13.5}}>Orders appear here in real time</div></div>
      :<div className="qgrid">{orders.map((o,i)=>{
          const mods = o.mods||[];
          return (
          <div className="qcard" key={o.id}>
            <div className="qhead"><span className="qnum">#{i+1}</span><span className="qtime">{fmtTime(o.timestamp)}</span></div>
            <div className="qbody">
              {o.photo?<img src={o.photo} className="qphoto" alt={o.name}/>:<div className="qavatar">{getAvatar(o.name||"")}</div>}
              <div className="qname">{o.name}</div>
              <div className="qdrink">{o.drink}</div>
              {mods.map((m,i)=><div key={i} className="qmods">{m}</div>)}
              {o.request&&<div className="qrequest">"{o.request}"</div>}
            </div>
            <div className="qfooter">
              <button className="btn btn-s sm" style={{flex:1}} onClick={()=>onComplete(o.id)}>✓ Done</button>
              <button className="btn btn-d sm" onClick={()=>onRemove(o.id)}>✕</button>
            </div>
          </div>
        )})}</div>
    }

    {completed.length>0&&(
      <div style={{marginTop:40}}>
        <div className="eyebrow">Completed</div>
        <h2 style={{fontFamily:"inherit",fontSize:18,fontWeight:600,marginBottom:16,opacity:.5}}>{completed.length} order{completed.length!==1?"s":""} completed</h2>
        <div className="qgrid">
          {completed.map((o,i)=>{
            const mods = o.mods||[];
            return (
            <div className="qcard" key={o.id} style={{opacity:.55}}>
              <div className="qhead" style={{background:"rgba(0,0,0,.35)"}}>
                <span className="qnum">✓ {fmtTime(o.completedAt)}</span>
                <span className="qtime">{fmtTime(o.timestamp)}</span>
              </div>
              <div className="qbody">
                {o.photo?<img src={o.photo} className="qphoto" alt={o.name}/>:<div className="qavatar">{getAvatar(o.name||"")}</div>}
                <div className="qname">{o.name}</div>
                <div className="qdrink">{o.drink}</div>
                {mods.length>0&&<div className="qmods">{mods.join(" · ")}</div>}
                {o.request&&<div className="qrequest">"{o.request}"</div>}
              </div>
            </div>
          )})}
        </div>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
// PUBLIC QUEUE — read-only display screen
// ─────────────────────────────────────────────
const PublicQueue = ({ orders, completed, config, theme, isOpen }) => {
  const { colors:C, fonts:F } = theme;

  if (!isOpen) return (
    <div className="app" style={{minHeight:"100vh",background:C.pageBg}}>
      <nav className="nav">
        <div className="brand"><LogoDisplay config={config} size="nav"/><span>{config.cafeName}</span></div>
      </nav>
      <div className="page">
        <div className="hero">
          <LogoDisplay config={config} size="hero"/>
          <div className="hero-name">{config.cafeName}</div>
          <div className="hero-tag">{config.closedMessage||"We're not open yet — check back soon."}</div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="app" style={{minHeight:"100vh",background:C.pageBg}}>
      <nav className="nav">
        <div className="brand"><LogoDisplay config={config} size="nav"/><span>{config.cafeName}</span></div>
        <div style={{fontFamily:F.detail,fontSize:11,color:C.navText,opacity:.6,letterSpacing:".08em",textTransform:"uppercase"}}>Now Serving</div>
      </nav>
      <div className="page-wide">
        {orders.length === 0 ? (
          <div className="empty" style={{paddingTop:80}}>
            <div style={{marginBottom:14}}><LogoDisplay config={config} size="hero"/></div>
            <div className="empty-t">No orders yet</div>
            <div style={{fontSize:13.5}}>Orders will appear here as they come in</div>
          </div>
        ) : (
          <>
            <div style={{marginBottom:24,marginTop:8}}>
              <div className="eyebrow">Up next</div>
              <h1 className="heading" style={{marginBottom:0}}>
                {orders.length} order{orders.length!==1?"s":""} in queue
              </h1>
            </div>
            <div className="qgrid">
              {orders.map((o,i)=>(
                <div className="qcard" key={o.id} style={{animation:`slideIn .28s ease ${i*.05}s both`}}>
                  <div className="qhead">
                    <span className="qnum">#{i+1}</span>
                    <span className="qtime">{fmtTime(o.timestamp)}</span>
                  </div>
                  <div className="qbody" style={{display:"flex",alignItems:"center",gap:14,padding:"16px 14px"}}>
                    {o.photo
                      ? <img src={o.photo} className="qphoto" alt={o.name} style={{float:"none",margin:0,width:56,height:56,flexShrink:0}}/>
                      : <div className="qavatar" style={{float:"none",margin:0,width:56,height:56,flexShrink:0,fontSize:24}}>{getAvatar(o.name||"")}</div>
                    }
                    <div style={{flex:1,minWidth:0}}>
                      <div className="qname" style={{fontSize:22}}>{o.name}</div>
                      {o.message&&<div className="qmessage">"{o.message}"</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {completed.length>0&&(
          <div style={{marginTop:48}}>
            <div className="eyebrow">Served</div>
            <h2 style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.headingText,marginBottom:16,opacity:.5}}>
              {completed.length} order{completed.length!==1?"s":""} served
            </h2>
            <div className="qgrid">
              {completed.map((o)=>(
                <div className="qcard" key={o.id} style={{opacity:.45}}>
                  <div className="qhead" style={{background:"rgba(0,0,0,.3)"}}>
                    <span className="qnum">✓ Served</span>
                    <span className="qtime">{fmtTime(o.completedAt)}</span>
                  </div>
                  <div className="qbody" style={{display:"flex",alignItems:"center",gap:14,padding:"14px"}}>
                    {o.photo
                      ? <img src={o.photo} className="qphoto" alt={o.name} style={{float:"none",margin:0,width:48,height:48,flexShrink:0}}/>
                      : <div className="qavatar" style={{float:"none",margin:0,width:48,height:48,flexShrink:0,fontSize:20}}>{getAvatar(o.name||"")}</div>
                    }
                    <div style={{flex:1,minWidth:0}}>
                      <div className="qname" style={{fontSize:18}}>{o.name}</div>
                      {o.message&&<div className="qmessage" style={{fontSize:12}}>"{o.message}"</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HASH ROUTER — returns "guest" | "admin" | "queue"
// ─────────────────────────────────────────────
const useRoute = () => {
  const getRoute = () => {
    const hash = window.location.hash;
    if (hash === "#/admin") return "admin";
    if (hash === "#/queue") return "queue";
    return "guest";
  };
  const [route, setRoute] = useState(getRoute);
  useEffect(()=>{
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  },[]);
  return route;
};

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function App() {
  const route = useRoute();
  const [adminTab, setAdminTab] = useState("queue");
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [themeConfig, setThemeConfigState] = useState(DEFAULT_THEME);
  const [isOpen, setIsOpenState] = useState(false);
  const [orders, setOrders] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [pinHash, setPinHash] = useState(()=>store.get(STORAGE_KEYS.pinHash,null));
  const [session, setSession] = useState(()=>{const s=store.get(STORAGE_KEYS.session,null);return isSessionValid(s)?s:null;});
  const [pinMode, setPinMode] = useState(null);
  const [fbReady, setFbReady] = useState(false);
  const configLoadedRef = useRef(false);
  const themeLoadedRef = useRef(false);
  const theme = resolveTheme(themeConfig);

  // ── FIREBASE LISTENERS ───────────────────────
  useEffect(()=>{
    // Config — load once on mount
    const configUnsub = onValue(ref(db,"config"), snap=>{
      if (!configLoadedRef.current) {
        configLoadedRef.current = true;
        if (snap.exists()) {
          setConfigState({...DEFAULT_CONFIG,...snap.val()});
        } else {
          const localConfig = store.get(STORAGE_KEYS.config, DEFAULT_CONFIG);
          set(ref(db,"config"), localConfig);
          setConfigState(localConfig);
        }
        setFbReady(true);
      }
    });
    // Theme — load once on mount
    const themeUnsub = onValue(ref(db,"theme"), snap=>{
      if (!themeLoadedRef.current) {
        themeLoadedRef.current = true;
        if (snap.exists()) {
          setThemeConfigState({...DEFAULT_THEME,...snap.val()});
        } else {
          const localTheme = store.get(STORAGE_KEYS.theme, DEFAULT_THEME);
          set(ref(db,"theme"), localTheme);
          setThemeConfigState(localTheme);
        }
      }
    });
    // isOpen
    const openUnsub = onValue(ref(db,"isOpen"), snap=>{
      setIsOpenState(snap.exists() ? snap.val() : false);
    });
    // Orders
    const ordersUnsub = onValue(ref(db,"orders"), snap=>{
      if (snap.exists()) {
        const arr = Object.entries(snap.val()).map(([fbKey,v])=>({...v,fbKey}));
        arr.sort((a,b)=>a.timestamp-b.timestamp);
        setOrders(arr);
      } else { setOrders([]); }
    });
    // Completed
    const completedUnsub = onValue(ref(db,"completed"), snap=>{
      if (snap.exists()) {
        const arr = Object.entries(snap.val()).map(([fbKey,v])=>({...v,fbKey}));
        arr.sort((a,b)=>b.completedAt-a.completedAt);
        setCompleted(arr);
      } else { setCompleted([]); }
    });
    return ()=>{ configUnsub(); themeUnsub(); openUnsub(); ordersUnsub(); completedUnsub(); };
  },[]);

  // ── WRITE HELPERS ────────────────────────────
  const setConfig = useCallback((updater)=>{
    setConfigState(prev=>{
      const next = typeof updater==="function" ? updater(prev) : {...prev,...updater};
      set(ref(db,"config"), next);
      return next;
    });
  },[]);

  const setThemeConfig = useCallback((updater)=>{
    setThemeConfigState(prev=>{
      const next = typeof updater==="function" ? updater(prev) : {...prev,...updater};
      set(ref(db,"theme"), next);
      return next;
    });
  },[]);

  const setIsOpen = useCallback((updater)=>{
    setIsOpenState(prev=>{
      const next = typeof updater==="function" ? updater(prev) : updater;
      set(ref(db,"isOpen"), next);
      return next;
    });
  },[]);

  // ── PERSIST SESSION (localStorage only) ──────
  useEffect(()=>{session?store.set(STORAGE_KEYS.session,session):store.del(STORAGE_KEYS.session);},[session]);

  // ── TITLE ────────────────────────────────────
  useEffect(()=>{
    document.title = config.cafeName || "Home Café";
  },[config.cafeName]);

  // ── PIN PROMPT ───────────────────────────────
  const authed = isSessionValid(session);
  useEffect(()=>{
    if (route==="admin"&&!authed&&!pinMode) setPinMode(pinHash?"login":"setup");
  },[route,authed]);
  // ── HANDLERS ─────────────────────────────────
  const toast=(m)=>{setToastMsg(m);setTimeout(()=>setToastMsg(""),2500);};
  const handlePinSuccess=()=>{setSession(createSession());setPinMode(null);};
  const handleSetPin=(hash)=>{setPinHash(hash);store.set(STORAGE_KEYS.pinHash,hash);};
  const handleSignOut=()=>{setSession(null);setPinMode("login");toast("Signed out");};

  const handleOrder=(o)=>{
    push(ref(db,"orders"), o);
    toast(`Order placed for ${o.name}!`);
  };

  const handleDone=(id)=>{
    const o=orders.find(x=>x.id===id);
    if (!o) return;
    const {fbKey,...orderData}=o;
    remove(ref(db,`orders/${fbKey}`));
    push(ref(db,"completed"),{...orderData,completedAt:Date.now()});
    toast(`${o.name}'s ${o.drink} — done!`);
  };

  const handleRemove=(id)=>{
    const o=orders.find(x=>x.id===id);
    if (o?.fbKey) remove(ref(db,`orders/${o.fbKey}`));
  };

  const handleClear=()=>{
    set(ref(db,"orders"),null);
    set(ref(db,"completed"),null);
    toast("Queue cleared");
  };

  // ── LOADING STATE ────────────────────────────
  if (!fbReady) return (
    <div className="app"><GlobalStyles theme={theme}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",opacity:.4,fontSize:14}}>
        Loading…
      </div>
    </div>
  );

  // ── PUBLIC QUEUE VIEW ────────────────────────
  if (route==="queue") return (
    <>
      <GlobalStyles theme={theme}/>
      <PublicQueue orders={orders} completed={completed} config={config} theme={theme} isOpen={isOpen}/>
    </>
  );

  // ── GUEST VIEW ───────────────────────────────
  if (route==="guest") return (
    <div className="app"><GlobalStyles theme={theme}/>
      <nav className="nav">
        <div className="brand"><LogoDisplay config={config} size="nav"/><span>{config.cafeName}</span></div>
      </nav>
      <Guest config={config} isOpen={isOpen} onOrder={handleOrder}/>
      <Toast msg={toastMsg}/>
    </div>
  );

  // ── ADMIN PIN SCREEN ─────────────────────────
  if (pinMode) return (
    <div className="app"><GlobalStyles theme={theme}/>
      <nav className="nav">
        <div className="brand"><LogoDisplay config={config} size="nav"/><span>{config.cafeName}</span></div>
        <button className="tab" onClick={()=>{window.location.hash="";}}>← Guest view</button>
      </nav>
      <PinScreen
        mode={pinMode==="change"?"setup":(pinHash?"login":"setup")}
        storedHash={pinHash}
        onSuccess={handlePinSuccess}
        onSetPin={handleSetPin}
      />
    </div>
  );

  // ── ADMIN VIEW (authenticated) ────────────────
  return (
    <div className="app"><GlobalStyles theme={theme}/>
      <nav className="nav">
        <div className="brand"><LogoDisplay config={config} size="nav"/><span>{config.cafeName}</span></div>
        <div className="tabs">
          <button className={`tab ${adminTab==="queue"?"on":""}`} onClick={()=>setAdminTab("queue")}>
            Queue{orders.length>0?` (${orders.length})`:""
          }</button>
          <button className={`tab ${adminTab==="settings"?"on":""}`} onClick={()=>setAdminTab("settings")}>Settings</button>
        </div>
      </nav>
      {adminTab==="queue"&&<>
        <div style={{maxWidth:940,margin:"0 auto",padding:"20px 20px 0",display:"flex",justifyContent:"flex-end"}}>
          <a href="#/queue" target="_blank" rel="noopener noreferrer" className="btn btn-o sm">↗ Public display</a>
        </div>
        <Queue orders={orders} completed={completed} config={config} onComplete={handleDone} onRemove={handleRemove}/>
      </>}
      {adminTab==="settings"&&<Admin config={config} setConfig={setConfig} isOpen={isOpen} setIsOpen={setIsOpen} orders={orders} completed={completed} onClearOrders={handleClear} onChangePin={()=>setPinMode("change")} onSignOut={handleSignOut} themeConfig={themeConfig} setThemeConfig={setThemeConfig} resolvedColors={theme.colors}/>}
      <Toast msg={toastMsg}/>
    </div>
  );
}
