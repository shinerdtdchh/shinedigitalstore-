export async function onRequest(context) {
    const request = context.request;
    const url = new URL(request.url);
    const db = context.env.DB; // Cloudflare D1 Database binding

    // CORS Headers (Browser ကနေ API ကို လွတ်လွတ်လပ်လပ် လှမ်းခေါ်လို့ရအောင်)
    const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight Request အတွက် စစ်ဆေးခြင်း
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
            status: 405,
            headers: corsHeaders
        });
    }

    try {
        const body = await request.json();
        const action = body.action; // ဘာလုပ်ဆောင်ချက်လဲ ခွဲခြားရန် (ဥပမာ - register, login)

        // ==========================================
        // ၁။ REGISTER (အကောင့်သစ်ဖွင့်ခြင်း)
        // ==========================================
        if (action === 'register') {
            const username = (body.username || '').trim();
            const email = (body.email || '').trim().toLowerCase();
            const password = (body.password || '').trim();

            if (!username || !email || !password) {
                return new Response(JSON.stringify({ success: false, message: "⚠️ အချက်အလက်များ အကုန်ဖြည့်ပေးပါ။" }), { headers: corsHeaders });
            }

            // Username သို့မဟုတ် Email ရှိပြီးသားလား စစ်ဆေးမည်
            const checkUser = await db.prepare("SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1")
                .bind(username.toLowerCase(), email)
                .first();

            if (checkUser) {
                return new Response(JSON.stringify({ success: false, message: "❌ ဒီ Username သို့မဟုတ် Email ရှိပြီးသား ဖြစ်နေပါသည်။" }), { headers: corsHeaders });
            }

            // Database ထဲသို့ အကောင့်သစ် အချက်အလက်များ ထည့်သွင်းမည်
            await db.prepare("INSERT INTO users (username, email, password, balance, coins, role, status) VALUES (?, ?, ?, 0, 0, 'user', 'active')")
                .bind(username, email, password)
                .run();

            return new Response(JSON.stringify({ success: true, message: "✅ အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။" }), { headers: corsHeaders });
        }

        // ==========================================
        // ၂။ LOGIN (အကောင့်ဝင်ခြင်း)
        // ==========================================
        if (action === 'login') {
            const input_user = (body.uname_or_mail || '').trim().toLowerCase();
            const password = (body.upass || '').trim();

            if (!input_user || !password) {
                return new Response(JSON.stringify({ success: false, message: "⚠️ Username/Email နှင့် Password ထည့်ပါ။" }), { headers: corsHeaders });
            }

            // Database ထဲမှ အကောင့်ကို ရှာမည်
            const user = await db.prepare("SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1")
                .bind(input_user, input_user)
                .first();

            if (!user) {
                return new Response(JSON.stringify({ success: false, message: "❌ အကောင့်ရှာမတွေ့ပါ။" }), { headers: corsHeaders });
            }

            // အကောင့်ပိတ်ခံထားရခြင်း ရှိမရှိ စစ်ဆေးမည်
            if (user.status === 'blocked') {
                return new Response(JSON.stringify({ success: false, message: "❌ သင့်အကောင့်သည် ပိတ်ပင် (Blocked) ခံထားရပါသည်။" }), { headers: corsHeaders });
            }

            // Password တူမတူ စစ်ဆေးမည်
            if (user.password !== password) {
                return new Response(JSON.stringify({ success: false, message: "❌ စကားဝှက် မှားယွင်းနေပါသည်။" }), { headers: corsHeaders });
            }

            return new Response(JSON.stringify({
                success: true,
                message: "✅ အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်။",
                user: { 
                    username: user.username, 
                    email: user.email,
                    balance: user.balance,
                    coins: user.coins,
                    role: user.role 
                }
            }), { headers: corsHeaders });
        }

        // ==========================================
        // ၃။ နောင်တချိန် ထပ်တိုးမည့် လုပ်ဆောင်ချက်များအတွက် နေရာလွတ်
        // ==========================================
        // if (action === 'deposit') { ... }

        return new Response(JSON.stringify({ success: false, message: "❌ Invalid action specified." }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "Database Error: " + err.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
                  }
