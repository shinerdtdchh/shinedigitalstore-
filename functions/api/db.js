export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const db = env.DB;

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
                status: 405, headers: corsHeaders
            });
        }

        try {
            const body = await request.json();
            const action = body.action;

            // ၁။ SEND OTP
            if (action === 'send-otp') {
                const email = (body.email || '').trim().toLowerCase();
                if (!email) {
                    return new Response(JSON.stringify({ success: false, message: "ကျေးဇူးပြု၍ Email ထည့်သွင်းပါ။" }), { headers: corsHeaders });
                }

                // users table ရှိမရှိ နဲ့ email ရှိပြီးသားလား စစ်ရန်
                await db.prepare(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE,
                        email TEXT UNIQUE,
                        fullname TEXT,
                        dob TEXT,
                        password TEXT,
                        balance REAL DEFAULT 0,
                        coins INTEGER DEFAULT 0,
                        role TEXT DEFAULT 'user',
                        status TEXT DEFAULT 'active'
                    )
                `).run();

                const existing = await db.prepare("SELECT email FROM users WHERE LOWER(email) = ? LIMIT 1").bind(email).first();
                if (existing) {
                    return new Response(JSON.stringify({ success: false, message: "❌ ဒီ Email ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်ပါသည်။" }), { headers: corsHeaders });
                }

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = Date.now() + 5 * 60 * 1000;

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

                return new Response(JSON.stringify({ 
                    success: true, 
                    message: `✅ OTP ပို့ပြီးပါပြီ။ (စမ်းသပ်ရန် OTP: ${otp})` 
                }), { headers: corsHeaders });
            }

            // ၂။ VERIFY OTP
            if (action === 'verify-otp') {
                const email = (body.email || '').trim().toLowerCase();
                const otp = (body.otp || '').trim();

                const record = await db.prepare("SELECT * FROM otp_codes WHERE email = ?").bind(email).first();
                if (!record || Date.now() > record.expires_at || record.otp !== otp) {
                    return new Response(JSON.stringify({ success: false, message: "❌ OTP ကုဒ် မှားယွင်းနေ သို့မဟုတ် သက်တမ်းကုန်သွားပါပြီ။" }), { headers: corsHeaders });
                }

                return new Response(JSON.stringify({ success: true, message: "✅ OTP မှန်ကန်ပါသည်။" }), { headers: corsHeaders });
            }

            // ၃။ REGISTER
            if (action === 'register') {
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

                const checkUser = await db.prepare("SELECT username FROM users WHERE LOWER(username) = ? LIMIT 1").bind(username).first();
                if (checkUser) {
                    return new Response(JSON.stringify({ success: false, message: "❌ ဒီ Username ရှိပြီးသား ဖြစ်နေပါသည်။" }), { headers: corsHeaders });
                }

                await db.prepare(`
                    INSERT INTO users (username, email, fullname, dob, password, balance, coins, role, status) 
                    VALUES (?, ?, ?, ?, ?, 0, 0, 'user', 'active')
                `).bind(username, email, fullName, dob, password).run();

                await db.prepare("DELETE FROM otp_codes WHERE email = ?").bind(email).run();

                return new Response(JSON.stringify({ success: true, message: "✅ အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။" }), { headers: corsHeaders });
            }

            return new Response(JSON.stringify({ success: false, message: "Invalid action" }), { headers: corsHeaders });

        } catch (err) {
            return new Response(JSON.stringify({ success: false, message: "Server Error: " + err.message }), {
                status: 500, headers: corsHeaders
            });
        }
    }
};
