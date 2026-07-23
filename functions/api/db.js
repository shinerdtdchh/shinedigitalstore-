export async function onRequest(context) {
    const request = context.request;
    const url = new URL(request.url);
    const db = context.env.DB; // Cloudflare D1 Database

    // CORS Headers
    const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

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
        const path = url.pathname;
        const body = await request.json();

        // ==========================================
        // ၁။ SEND OTP (OTP ပို့ရန်)
        // ==========================================
        if (path.endsWith('/api/send-otp') || body.action === 'send-otp') {
            const email = (body.email || '').trim().toLowerCase();
            if (!email) {
                return new Response(JSON.stringify({ success: false, message: "ကျေးဇူးပြု၍ Email ထည့်သွင်းပါ။" }), { headers: corsHeaders });
            }

            // Email ရှိပြီးသားလား စစ်မည်
            const existing = await db.prepare("SELECT email FROM users WHERE LOWER(email) = ? LIMIT 1")
                .bind(email).first();
            if (existing) {
                return new Response(JSON.stringify({ success: false, message: "❌ ဒီ Email ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်ပါသည်။" }), { headers: corsHeaders });
            }

            // ခြောက်လုံးပါ OTP ကုဒ် အတု ဖန်တီးမည် (Production တွင် Email API သို့မဟုတ် Cloudflare Email Workers ဖြင့် ပို့နိုင်ပါသည်)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 5 * 60 * 1000; // ၅ မိနစ် သက်တမ်းရှိသည်

            // Database ထဲတွင် OTP ယာယီသိမ်းရန် (otp_codes table လိုအပ်ပါမည်)
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS otp_codes (
                    email TEXT PRIMARY KEY,
                    otp TEXT,
                    expires_at INTEGER
                )
            `).run();

            await db.prepare(`
                INSERT INTO otp_codes (email, otp, expires_at) 
                VALUES (?, ?, ?) 
                ON CONFLICT(email) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at
            `).bind(email, otp, expiresAt).run();

            // မှတ်ချက်။ ။ စမ်းသပ်ရန်အတွက် Alert ထဲတွင် OTP ကုဒ်ကို ပြပေးထားပါသည် (တကယ့်လက်တွေ့တွင် Email ပို့စနစ် တပ်ဆင်ရပါမည်)
            return new Response(JSON.stringify({ 
                success: true, 
                message: `✅ OTP ပို့ပြီးပါပြီ။ (စမ်းသပ်ရန် OTP: ${otp})` 
            }), { headers: corsHeaders });
        }

        // ==========================================
        // ၂။ VERIFY OTP (OTP စစ်ဆေးရန်)
        // ==========================================
        if (path.endsWith('/api/verify-otp') || body.action === 'verify-otp') {
            const email = (body.email || '').trim().toLowerCase();
            const otp = (body.otp || '').trim();

            if (!email || !otp) {
                return new Response(JSON.stringify({ success: false, message: "အချက်အလက် မပြည့်စုံပါ။" }), { headers: corsHeaders });
            }

            const record = await db.prepare("SELECT * FROM otp_codes WHERE email = ?").bind(email).first();
            if (!record) {
                return new Response(JSON.stringify({ success: false, message: "❌ OTP ကုဒ် တောင်းခံထားခြင်း မရှိပါ။" }), { headers: corsHeaders });
            }

            if (Date.now() > record.expires_at) {
                return new Response(JSON.stringify({ success: false, message: "❌ OTP သက်တမ်း ကုန်သွားပါပြီ။ ကုဒ်အသစ်ပြန်တောင်းပါ။" }), { headers: corsHeaders });
            }

            if (record.otp !== otp) {
                return new Response(JSON.stringify({ success: false, message: "❌ OTP ကုဒ် မှားယွင်းနေပါသည်။" }), { headers: corsHeaders });
            }

            return new Response(JSON.stringify({ success: true, message: "✅ OTP မှန်ကန်ပါသည်။" }), { headers: corsHeaders });
        }

        // ==========================================
        // ၃။ REGISTER (အကောင့်အသစ် ဖန်တီးခြင်း)
        // ==========================================
        if (path.endsWith('/api/register') || body.action === 'register') {
            const email = (body.email || '').trim().toLowerCase();
            const fullName = (body.fullName || '').trim();
            const username = (body.username || '').trim().toLowerCase();
            const dob = body.dob;
            const password = body.password;
            const cpassword = body.cpassword;

            if (!email || !fullName || !username || !dob || !password) {
                return new Response(JSON.stringify({ success: false, message: "အချက်အလက်များ အကုန်ဖြည့်ပေးပါ။" }), { headers: corsHeaders });
            }

            if (password !== cpassword) {
                return new Response(JSON.stringify({ success: false, message: "စကားဝှက်များ မကိုက်ညီပါ။" }), { headers: corsHeaders });
            }

            // Username ရှိပြီးသားလား စစ်မည်
            const checkUser = await db.prepare("SELECT username FROM users WHERE LOWER(username) = ? LIMIT 1")
                .bind(username).first();
            if (checkUser) {
                return new Response(JSON.stringify({ success: false, message: "❌ ဒီ Username ရှိပြီးသား ဖြစ်နေပါသည်။" }), { headers: corsHeaders });
            }

            // Database ထဲသို့ အကောင့်အသစ် ထည့်မည်
            await db.prepare(`
                INSERT INTO users (username, email, fullname, dob, password, balance, coins, role, status) 
                VALUES (?, ?, ?, ?, ?, 0, 0, 'user', 'active')
            `).bind(username, email, fullName, dob, password).run();

            // အသုံးပြုပြီးသား OTP ကို ဖျက်ပစ်မည်
            await db.prepare("DELETE FROM otp_codes WHERE email = ?").bind(email).run();

            return new Response(JSON.stringify({ success: true, message: "✅ အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။" }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: false, message: "Invalid API endpoint" }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "Server Error: " + err.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
