import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const primaryRed = '#B03A2E';
const darkRed    = '#7B241C';
const accentGold = '#C9A84C';

export default function WelcomeCharacter({ isDark }) {
  const [wave, setWave]           = useState(false);
  const [blink, setBlink]         = useState(false);
  const [talking, setTalking]     = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setWave(true),        400);
    const t2 = setTimeout(() => setWave(false),       2800);
    const t3 = setTimeout(() => setShowBubble(true),  600);
    const t4 = setTimeout(() => setShowBubble(false), 5200);
    const t5 = setTimeout(() => setTalking(true),     700);
    const t6 = setTimeout(() => setTalking(false),    5000);
    const blinkInt = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3000);
    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout); clearInterval(blinkInt); };
  }, []);

  const textColor    = isDark ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.82)';
  const bubbleBg     = isDark ? 'rgba(28,36,48,0.96)'    : 'rgba(255,255,255,0.97)';
  const bubbleBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', width: '100%', userSelect: 'none',
    }}>

      {/* ── Speech bubble ── */}
      <Box sx={{
        position: 'absolute', top: 0, right: '3%',
        background: bubbleBg,
        border: `1px solid ${bubbleBorder}`,
        borderRadius: '14px 14px 14px 4px',
        px: 2.5, py: 1.5,
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.40)' : '0 8px 24px rgba(0,0,0,0.12)',
        opacity: showBubble ? 1 : 0,
        transform: showBubble ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        maxWidth: 210, zIndex: 10,
      }}>
        <Typography sx={{
          fontSize: 13, color: textColor,
          fontFamily: '"Georgia", serif', fontStyle: 'italic',
          lineHeight: 1.55, letterSpacing: '0.01em',
        }}>
          Welcome! Please sign in to access your account.
        </Typography>
        <Box sx={{
          position: 'absolute', bottom: -8, left: 16,
          width: 0, height: 0,
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderTop: `8px solid ${isDark ? 'rgba(28,36,48,0.96)' : 'rgba(255,255,255,0.97)'}`,
        }} />
      </Box>

      {/* ══════════════════════
          SVG CHARACTER
      ══════════════════════ */}
      <svg width="240" height="380" viewBox="0 0 240 380"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}>
        <defs>
          <style>{`
            @keyframes floatUp {
              0%,100% { transform: translateY(0px); }
              50%      { transform: translateY(-7px); }
            }
            @keyframes waveArm {
              0%   { transform: rotate(0deg); }
              15%  { transform: rotate(-42deg); }
              35%  { transform: rotate(-6deg); }
              55%  { transform: rotate(-44deg); }
              75%  { transform: rotate(-8deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes idleSway {
              0%,100% { transform: rotate(0deg); }
              50%      { transform: rotate(2.5deg); }
            }
            .char-root { animation: floatUp 4s ease-in-out infinite; }
            .arm-r {
              transform-origin: 170px 215px;
              animation: ${wave ? 'waveArm 0.55s ease-in-out 4' : 'idleSway 4s ease-in-out infinite'};
            }
            .arm-l {
              transform-origin: 70px 215px;
              animation: idleSway 4.5s ease-in-out infinite;
            }
          `}</style>

          {/* Skin */}
          <radialGradient id="rg_face" cx="46%" cy="36%" r="56%">
            <stop offset="0%"   stopColor="#FDDDB5"/>
            <stop offset="65%"  stopColor="#F5C48A"/>
            <stop offset="100%" stopColor="#E8A96A"/>
          </radialGradient>
          <linearGradient id="rg_skin" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%"   stopColor="#FDDDB5"/>
            <stop offset="100%" stopColor="#E8A96A"/>
          </linearGradient>

          {/* Suit red */}
          <linearGradient id="rg_suit" x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%"   stopColor="#C0392B"/>
            <stop offset="55%"  stopColor="#96281B"/>
            <stop offset="100%" stopColor="#7B241C"/>
          </linearGradient>
          <linearGradient id="rg_suitDk" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%"   stopColor="#96281B"/>
            <stop offset="100%" stopColor="#641E16"/>
          </linearGradient>
          <linearGradient id="rg_suitDkR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#7B241C"/>
            <stop offset="100%" stopColor="#4A1410"/>
          </linearGradient>

          {/* Shirt white */}
          <linearGradient id="rg_shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#FDFEFE"/>
            <stop offset="100%" stopColor="#D5DBDB"/>
          </linearGradient>

          {/* Shoes dark */}
          <linearGradient id="rg_shoeL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2C3E50"/>
            <stop offset="100%" stopColor="#17202A"/>
          </linearGradient>
          <linearGradient id="rg_shoeR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#34495E"/>
            <stop offset="100%" stopColor="#17202A"/>
          </linearGradient>

          {/* Hair */}
          <linearGradient id="rg_hair" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%"   stopColor="#180900"/>
            <stop offset="100%" stopColor="#2C1503"/>
          </linearGradient>

          {/* 3D shine overlay */}
          <linearGradient id="rg_shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)"/>
            <stop offset="55%"  stopColor="rgba(255,255,255,0.06)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </linearGradient>

          {/* Ground shadow */}
          <radialGradient id="rg_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(0,0,0,0.22)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>

          {/* Soft drop shadow filter */}
          <filter id="charShadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.18)" />
          </filter>
        </defs>

        {/* Ground ellipse */}
        <ellipse cx="120" cy="372" rx="60" ry="8" fill="url(#rg_shadow)" />

        <g className="char-root" filter="url(#charShadow)">

          {/* ══ SHOES ══ */}
          {/* Left */}
          <path d="M 76 350 Q 74 340 80 337 L 110 337 Q 116 337 116 343 Q 116 351 108 353 Q 92 356 76 350 Z"
            fill="url(#rg_shoeL)" />
          <path d="M 80 337 L 110 337 Q 114 337 114 341 L 80 341 Q 78 339 80 337 Z"
            fill="rgba(255,255,255,0.10)" />
          {/* Right */}
          <path d="M 164 350 Q 166 340 160 337 L 130 337 Q 124 337 124 343 Q 124 351 132 353 Q 148 356 164 350 Z"
            fill="url(#rg_shoeR)" />
          <path d="M 160 337 L 130 337 Q 126 337 126 341 L 160 341 Q 162 339 160 337 Z"
            fill="rgba(255,255,255,0.10)" />

          {/* ══ LEGS ══ */}
          {/* Left leg — slightly wider, rounder */}
          <path d="M 86 282 Q 80 308 78 340 L 112 340 Q 113 308 112 282 Z"
            fill="url(#rg_suitDk)" />
          <path d="M 91 288 Q 89 312 88 336" stroke="rgba(255,255,255,0.13)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Right leg */}
          <path d="M 128 282 Q 127 308 128 340 L 162 340 Q 160 308 154 282 Z"
            fill="url(#rg_suitDkR)" />
          <path d="M 149 288 Q 151 312 154 336" stroke="rgba(255,255,255,0.10)" strokeWidth="2.5" strokeLinecap="round" />

          {/* ══ TORSO ══ */}
          {/* Main jacket body */}
          <path d="M 70 205 Q 66 250 68 284 L 172 284 Q 174 250 170 205 Q 152 192 120 190 Q 88 192 70 205 Z"
            fill="url(#rg_suit)" />
          {/* 3-D shine */}
          <path d="M 70 205 Q 66 250 68 272 L 110 272 L 110 190 Q 88 192 70 205 Z"
            fill="url(#rg_shine)" />

          {/* White shirt visible */}
          <path d="M 106 191 L 102 215 L 120 211 L 138 215 L 134 191 Q 126 187 120 187 Q 114 187 106 191 Z"
            fill="url(#rg_shirt)" />

          {/* Overalls bib */}
          <path d="M 102 191 Q 98 244 120 248 Q 142 244 138 191 Q 130 185 120 184 Q 110 185 102 191 Z"
            fill="url(#rg_suit)" />
          <path d="M 102 191 Q 98 244 120 248 Q 142 244 138 191 Q 130 185 120 184 Q 110 185 102 191 Z"
            fill="url(#rg_shine)" opacity="0.45" />

          {/* Overalls shoulder straps */}
          <path d="M 102 191 Q 98 178 102 166 L 112 166 Q 108 178 112 191 Z"
            fill={primaryRed} />
          <path d="M 138 191 Q 142 178 138 166 L 128 166 Q 132 178 128 191 Z"
            fill={darkRed} />

          {/* Bib pocket */}
          <rect x="111" y="208" width="18" height="15" rx="4" fill="rgba(0,0,0,0.18)" />
          <rect x="111" y="208" width="18" height="4"  rx="2" fill="rgba(255,255,255,0.09)" />

          {/* Waistband */}
          <rect x="68" y="278" width="104" height="10" rx="5" fill={darkRed} />
          {/* Belt buckle */}
          <rect x="113" y="277" width="14" height="12" rx="3" fill={accentGold} />
          <rect x="115" y="279" width="10" height="8"  rx="2" fill="rgba(0,0,0,0.20)" />

          {/* ══ RIGHT ARM — presenting (wave) ══ */}
          <g className="arm-r">
            {/* Shoulder cap */}
            <circle cx="170" cy="210" r="16" fill="url(#rg_suit)" />
            {/* Upper arm */}
            <path d="M 166 210 Q 192 220 200 244 Q 204 258 196 266"
              stroke="url(#rg_suit)" strokeWidth="24" strokeLinecap="round" fill="none" />
            {/* Shirt cuff */}
            <circle cx="196" cy="268" r="13" fill="url(#rg_shirt)" />
            {/* Forearm extended */}
            <path d="M 196 266 Q 208 276 218 278"
              stroke="url(#rg_skin)" strokeWidth="18" strokeLinecap="round" fill="none" />
            {/* Palm */}
            <ellipse cx="220" cy="272" rx="16" ry="11"
              fill="url(#rg_skin)" transform="rotate(-15 220 272)" />
            {/* Fingers */}
            <path d="M 211 264 Q 207 255 209 250" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 219 261 Q 217 252 219 247" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 226 264 Q 226 255 225 250" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 230 270 Q 231 262 230 257" stroke="#E8A96A" strokeWidth="5"  strokeLinecap="round" fill="none" />
            <path d="M 208 275 Q 202 273 200 279" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>

          {/* ══ LEFT ARM — relaxed ══ */}
          <g className="arm-l">
            {/* Shoulder cap */}
            <circle cx="70" cy="210" r="16" fill="url(#rg_suitDk)" />
            {/* Upper arm */}
            <path d="M 74 210 Q 50 224 46 248 Q 44 262 50 268"
              stroke="url(#rg_suitDk)" strokeWidth="24" strokeLinecap="round" fill="none" />
            {/* Shirt cuff */}
            <circle cx="50" cy="270" r="13" fill="url(#rg_shirt)" />
            {/* Forearm down */}
            <path d="M 50 268 Q 47 286 49 298"
              stroke="url(#rg_skin)" strokeWidth="18" strokeLinecap="round" fill="none" />
            {/* Hand */}
            <ellipse cx="48" cy="302" rx="14" ry="15" fill="url(#rg_skin)" />
            <path d="M 40 296 Q 37 287 39 282" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 47 294 Q 45 285 47 280" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 54 296 Q 53 287 54 282" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 59 301 Q 60 293 59 288" stroke="#E8A96A" strokeWidth="5"  strokeLinecap="round" fill="none" />
            <path d="M 38 307 Q 33 305 33 311" stroke="#E8A96A" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>

          {/* ══ NECK ══ */}
          <rect x="113" y="160" width="14" height="26" rx="7" fill="url(#rg_face)" />

          {/* ══ HEAD ══ */}

          {/* Hair bulk */}
          <ellipse cx="120" cy="118" rx="42" ry="46" fill="url(#rg_hair)" />

          {/* Ponytail flowing right */}
          <path d="M 152 128 Q 168 148 165 175 Q 161 196 154 205 Q 149 196 152 178 Q 154 156 145 140 Z"
            fill="url(#rg_hair)" />
          {/* Ponytail highlight */}
          <path d="M 154 135 Q 166 155 162 182" stroke="rgba(255,255,255,0.10)" strokeWidth="3" strokeLinecap="round" />

          {/* Face */}
          <ellipse cx="120" cy="122" rx="38" ry="42" fill="url(#rg_face)" />

          {/* Hair top / fringe */}
          <path d="M 80 106 Q 86 72 120 68 Q 154 72 160 106 Q 142 92 120 95 Q 98 92 80 106 Z"
            fill="url(#rg_hair)" />
          {/* Side hair left */}
          <path d="M 82 108 Q 78 132 82 158 Q 86 162 90 154 Q 86 134 88 108 Z"
            fill="url(#rg_hair)" />

          {/* Ears */}
          <ellipse cx="82"  cy="124" rx="8" ry="11" fill="#F5C48A" />
          <path d="M 84 118 Q 87 124 84 130" stroke="#E8A96A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="158" cy="124" rx="8" ry="11" fill="#F5C48A" />
          <path d="M 156 118 Q 153 124 156 130" stroke="#E8A96A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Eyebrows — gentle arch */}
          <path d="M 101 106 Q 110 100 119 105" stroke="#2C1503" strokeWidth="3"   strokeLinecap="round" fill="none" />
          <path d="M 121 105 Q 130 100 139 106" stroke="#2C1503" strokeWidth="3"   strokeLinecap="round" fill="none" />

          {/* Eyes */}
          <ellipse cx="110" cy="117" rx="10" ry={blink ? 1.5 : 9}  fill="white" />
          <ellipse cx="130" cy="117" rx="10" ry={blink ? 1.5 : 9}  fill="white" />
          {!blink && (<>
            <circle cx="111" cy="118" r="6"   fill="#3D2003" />
            <circle cx="131" cy="118" r="6"   fill="#3D2003" />
            <circle cx="111" cy="118" r="3.2" fill="#150900" />
            <circle cx="131" cy="118" r="3.2" fill="#150900" />
            <circle cx="113" cy="115" r="2"   fill="white" opacity="0.88" />
            <circle cx="133" cy="115" r="2"   fill="white" opacity="0.88" />
          </>)}
          {/* Eyelash lower */}
          <path d="M 100 122 Q 110 127 120 122" stroke="#2C1503" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 120 122 Q 130 127 140 122" stroke="#2C1503" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 118 128 Q 116 138 113 141 Q 120 145 127 141 Q 124 138 122 128"
            stroke="#D4956A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="114" cy="141" rx="3.5" ry="2.2" fill="rgba(200,120,80,0.28)" />
          <ellipse cx="126" cy="141" rx="3.5" ry="2.2" fill="rgba(200,120,80,0.28)" />

          {/* Mouth */}
          {talking ? (
            <ellipse cx="120" cy="152" rx="9" ry="6" fill="#C0392B" />
          ) : (
            <path d="M 108 151 Q 120 161 132 151"
              stroke="#C0392B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          )}
          {/* Upper lip detail */}
          <path d="M 108 151 Q 114 148 120 150 Q 126 148 132 151"
            stroke="rgba(180,80,60,0.38)" strokeWidth="1.3" fill="none" strokeLinecap="round" />

          {/* Rosy cheeks */}
          <ellipse cx="96"  cy="141" rx="11" ry="7" fill="rgba(230,110,90,0.22)" />
          <ellipse cx="144" cy="141" rx="11" ry="7" fill="rgba(230,110,90,0.22)" />

          {/* Collar */}
          <path d="M 112 164 L 106 191 L 120 186 L 134 191 L 128 164 L 120 173 Z"
            fill="url(#rg_shirt)" />

        </g>
      </svg>

      {/* ── Name badge ── */}
      <Box sx={{
        mt: 0.5, px: 2.5, py: 0.8,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        borderRadius: '20px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Box sx={{
          width: 6, height: 6, borderRadius: '50%',
          background: `linear-gradient(135deg, ${primaryRed}, ${accentGold})`,
          flexShrink: 0,
        }} />
        <Typography sx={{
          fontSize: 11, letterSpacing: '0.12em',
          fontFamily: '"Trebuchet MS", sans-serif',
          fontWeight: 600, textTransform: 'uppercase',
          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
        }}>
          CDJ Financial Advisor
        </Typography>
      </Box>
    </Box>
  );
}