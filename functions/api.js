export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 🌐 ၁။ ပင်မလင့်ခ် (shinedigitalstore.com) ကို ခေါ်လျှင် ဆိုင် Website ကြီး တန်းပြပေးမည့်အပိုင်း
    if (url.pathname === "/" && !url.searchParams.has("action")) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-1GYJ4VDKC0"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-1GYJ4VDKC0');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shine Digital Store</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <style>
        body { background: #050a15; color: white; font-family: 'Outfit', sans-serif; overflow-x: hidden; }
        .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .premium-name { background: linear-gradient(to right, #00fff2, #3b82f6, #00fff2, #3b82f6); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: text-shine 3s linear infinite; }
        @keyframes text-shine { to { background-position: 200% center; } }
        .logo-glow-container { position: relative; padding: 1.5px; border-radius: 50%; background: conic-gradient(from 0deg, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000); animation: rotate-glow 2s linear infinite; }
        @keyframes rotate-glow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .blue-mask-box { position: relative; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 6px #0064FF); }
        .badge-svg { width: 100%; height: 100%; fill: #0084ff; animation: rotate-glow 8s linear infinite; }
        .mask-icon { position: absolute; color: white; font-size: 7px; z-index: 10; }
        @keyframes flame-glow { 0% { transform: scale(1); filter: drop-shadow(0 0 2px #ffae00); } 50% { transform: scale(1.2); filter: drop-shadow(0 0 10px #ff4d00); } 100% { transform: scale(1); filter: drop-shadow(0 0 2px #ffae00); } }
        .fire-icon { color: #ffae00; animation: flame-glow 0.5s infinite alternate; }
        .swiper-pagination-bullet { background: white !important; }
        .swiper-pagination-bullet-active { background: #3b82f6 !important; width: 15px; border-radius: 4px; }
        #ptr-loading { position: fixed; top: -60px; left: 0; width: 100%; height: 60px; display: flex; justify-content: center; align-items: center; z-index: 9999; pointer-events: none; transition: transform 0.1s linear; }
        .ptr-container { background: #0f172a; border: 1.5px solid #00fff2; padding: 10px; border-radius: 50%; box-shadow: 0 0 20px rgba(0, 255, 242, 0.3); }
        .ptr-spinner { width: 28px; height: 28px; border: 3px solid rgba(0, 255, 242, 0.1); border-radius: 50%; border-top-color: #00fff2; border-bottom-color: #3b82f6; animation: fast-spin 0.5s linear infinite; }
        @keyframes fast-spin { to { transform: rotate(360deg); } }
        #scroll-content { transition: transform 0.1s linear; width: 100%; }
        .currency-dropdown { display: none; animation: fadeIn 0.15s ease-out forwards; max-height: 220px; overflow-y: auto; }
        .currency-dropdown::-webkit-scrollbar { width: 4px; }
        .currency-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="min-h-screen bg-[#050a15]">
    <div id="ptr-loading"><div class="ptr-container"><div class="ptr-spinner"></div></div></div>
    <header class="fixed top-0 left-0 right-0 z-[1000] bg-[#050a15]/90 backdrop-blur-xl border-b border-white/5">
        <div class="max-w-md mx-auto p-3 flex justify-between items-center relative">
            <div class="flex items-center gap-1.5 flex-shrink-0"> 
                <div class="logo-glow-container">
                    <div class="w-7 h-7 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center border border-[#050a15]">
                        <img src="logo.png" alt="Logo" class="w-full h-full object-cover">
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <h1 class="text-xs font-[900] premium-name uppercase italic tracking-tighter">Shine Digital Store</h1>
                    <div class="blue-mask-box">
                        <svg class="badge-svg" viewBox="0 0 24 24"><path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12Z" /></svg>
                        <i class="fas fa-check mask-icon"></i>
                    </div>
                </div>
            </div>
            <div id="auth-section" class="flex flex-col items-end gap-1 relative flex-shrink-0">
                <div class="bg-blue-600/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1.5 select-none">
                    <div class="flex items-center gap-1 cursor-pointer" onclick="toggleDropdown(event)">
                        <span class="text-[10px] font-bold text-blue-400" id="balance-text">0 MMK</span>
                        <i class="fas fa-caret-down text-[8px] text-blue-400/70 transition-transform" id="dropdown-arrow"></i>
                    </div>
                    <a href="topup.html" class="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-90 transition-transform"><i class="fas fa-plus text-[6px] text-white"></i></a>
                </div>
                <div id="currencyMenu" class="currency-dropdown absolute top-7 right-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl z-[1001] min-w-[110px]">
                    <button onclick="selectCurrency('MMK')" class="w-full text-left text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors">🇲🇲 MMK (မြန်မာ)</button>
                    <button onclick="selectCurrency('USDT')" class="w-full text-left text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors">🇺🇸 USDT (ဒေါ်လာ)</button>
                    <button onclick="selectCurrency('THB')" class="w-full text-left text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors">🇹🇭 THB (ဘတ်)</button>
                </div>
                <div class="bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 shadow-lg shadow-amber-500/5">
                    <i class="fas fa-coins text-[8px] text-amber-400"></i>
                    <span class="text-[9px] font-bold text-amber-400" id="coins-text">0 C</span>
                </div>
            </div>
        </div>
    </header>
    <div id="scroll-content" class="pt-16 pb-36">
        <div class="max-w-md mx-auto px-4 mt-2">
            <form action="search.html" method="GET" class="relative group">
                <input type="text" name="q" placeholder="Search services..." class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-500">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><i class="fas fa-search text-sm"></i></div>
            </form>
        </div>
        <div class="max-w-md mx-auto px-4 mt-4">
            <div class="swiper bannerSwiper rounded-[1.2rem] overflow-hidden border border-white/5">
                <div class="swiper-wrapper">
                    <div class="swiper-slide"><img src="https://via.placeholder.com/1280x720/1e293b/ffffff?text=Premium+Services" class="w-full aspect-video object-cover"></div>
                    <div class="swiper-slide"><img src="https://via.placeholder.com/1280x720/0f172a/ffffff?text=Secure+Payment" class="w-full aspect-video object-cover"></div>
                </div>
                <div class="swiper-pagination"></div>
            </div>
        </div>
        <div class="max-w-md mx-auto px-4 mt-6">
            <div class="flex items-center gap-2 mb-4"><i class="fas fa-fire fire-icon text-md"></i><h3 class="text-[11px] font-[900] uppercase tracking-[0.15em] text-orange-400">Popular Services</h3></div>
            <div class="space-y-4">
                <a href="1.html" class="block group">
                    <div class="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl transition-all active:scale-[0.97]">
                        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-500 opacity-90"></div>
                        <div class="absolute inset-0 p-5 flex flex-col justify-between z-10">
                            <div class="w-9 h-9 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20"><i class="fab fa-tiktok text-white text-md"></i></div>
                            <div>
                                <h4 class="text-white font-black text-lg mb-1">Social Media Accounts Store</h4>
                                <p class="text-white/90 text-[10px] font-bold uppercase tracking-wider flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                    <span class="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded"><i class="fab fa-tiktok text-cyan-400"></i> TikTok</span>
                                    <span class="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded"><i class="fas fa-gamepad text-amber-400"></i> MLBB</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
    <div class="fixed bottom-5 left-0 right-0 z-[1000] flex justify-center items-center pointer-events-none">
        <nav class="w-[92%] max-w-sm glass rounded-[2.5rem] p-1.5 px-3 flex justify-between items-center shadow-2xl pointer-events-auto">
            <a href="index.html" class="flex flex-col items-center gap-0.5 py-1 group w-14"><i class="fas fa-home text-md text-blue-500"></i><span class="text-[8px] font-bold text-blue-500 uppercase tracking-tighter">Home</span></a>
            <a href="chat.html" class="flex flex-col items-center gap-0.5 py-1 group w-14"><i class="fas fa-comment-dots text-md text-slate-500 group-hover:text-white"></i><span class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-white">Chats</span></a>
        </nav>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <script>
        var swiper = new Swiper(".bannerSwiper", { loop: true, autoplay: { delay: 3500, disableOnInteraction: false }, pagination: { el: ".swiper-pagination", clickable: true }, });
        let rates = { USDT: 1.00, THB: 35.50 }; let mmkPerUsd = 4500; let balanceMMK = 0; let totalCoins = 0;
        function toggleDropdown(event) { event.stopPropagation(); const menu = document.getElementById('currencyMenu'); if (menu.style.display === 'block') { menu.style.display = 'none'; } else { menu.style.display = 'block'; } }
        function selectCurrency(currency) { localStorage.setItem('selectedCurrency', currency); document.getElementById('balance-text').innerText = balanceMMK.toLocaleString() + ' ' + currency; document.getElementById('currencyMenu').style.display = 'none'; }
        document.addEventListener('DOMContentLoaded', () => { selectCurrency('MMK'); });
    </script>
</body>
</html>`;
      return new Response(html, { headers: { "Content-Type": "text/html", ...corsHeaders } });
    }

    try {
      // 💬 ၂။ Chat API စနစ်များ (Background မှာ အလုပ်လုပ်မည့်အပိုင်း)
      if (url.searchParams.get("action") === "upload" && request.method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return new Response("No file", { status: 400, headers: corsHeaders });

        const fileName = `${Date.now()}-${file.name}`;
        await env.SHINE_MEDIA.put(fileName, file.stream(), { httpMetadata: { contentType: file.type } });

        const publicUrl = `https://pub-66982f7d56c64e21bf92f50ad81c0.r2.dev/${fileName}`;
        return new Response(JSON.stringify({ url: publicUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (url.searchParams.get("action") === "messages" && request.method === "POST") {
        const { username, message, media_url, batch_id, receiver_user } = await request.json();
        const receiver = receiver_user || "owner";
        await env.DB.prepare("INSERT INTO chat_messages (sender, receiver, message, is_read, batch_id, media_url) VALUES (?, ?, ?, 0, ?, ?)").bind(username, receiver, message, batch_id || null, media_url || null).run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (url.searchParams.get("action") === "get_messages") {
        const target_user = url.searchParams.get("user") || "user";
        const { results } = await env.DB.prepare("SELECT * FROM chat_messages WHERE (sender='owner' AND receiver=?) OR (sender=? AND receiver='owner') ORDER BY id ASC").bind(target_user, target_user).all();
        const formatted = results.map(msg => ({ sender: msg.sender, message: msg.message, media_url: msg.media_url, time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
        return new Response(JSON.stringify(formatted), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(error.message, { status: 500, headers: corsHeaders });
    }
  }
};
