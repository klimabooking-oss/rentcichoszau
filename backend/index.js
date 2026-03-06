require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

// Supabase client config (Z użyciem Service Role omijającym restrykcje RLS)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware dla pobrania raw body w celu poprawnej weryfikacji HMAC ze sklepem Shopify
app.use('/webhook/shopify', express.raw({ type: 'application/json' }));
app.use(express.json());

/**
 * Endpoint zdrowia Railway
 */
app.get('/', (req, res) => {
    res.send('Cichoszau Webhook Server Działa ✅');
});

/**
 * WEBHOOK: shopify orders/paid
 */
app.post('/webhook/shopify', async (req, res) => {
    try {
        const hmacHeader = req.get('x-shopify-hmac-sha256');
        const body = req.body;

        // 1. Bezpieczeństwo - Weryfikacja pochodzenia powiadomienia od Shopify
        const generatedHash = crypto
            .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
            .update(body, 'utf8')
            .digest('base64');

        if (generatedHash !== hmacHeader) {
            console.error('❌ HMAC weryfikacja nie powiodła się!');
            return res.status(401).send('Unauthorized');
        }

        const order = JSON.parse(body.toString());
        console.log(`✅ Otrzymano zamówienie: ${order.id} od ${order.email}`);

        // 2. Znalezienie lub Stworzenie Użytkownika 
        // W pierwszej kolejności przeszukujemy bazę by połączyć bilet z kontem z Shopify.
        let userId = null;
        const { data: profiles, error: profileSearchErr } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', order.email);

        if (profiles && profiles.length > 0) {
            userId = profiles[0].id;
        } else {
            console.log('Klient nie istnieje w kontaktach Supabase. Przystępuje do tworzenia konta-cień...');

            // Rejestracja Cienia Konta w Supabase (żeby zachować PK/FK zależności relacyjne)
            // W środowisku produkcyjnym możliwe powiązanie poprzez Auth Admin API (supabase.auth.admin.createUser) lub poleganie na samym profiles.
            const newId = crypto.randomUUID();
            const { error: insertErr } = await supabase
                .from('profiles')
                .insert({
                    id: newId,
                    full_name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
                    email: order.email,
                    phone: order.customer?.phone || null,
                    role: 'user'
                });

            if (insertErr) {
                console.error("Błąd tworzenia profilu:", insertErr);
                throw new Error("Cannot create profile");
            }
            userId = newId;
        }

        // 3. Obsługa Kaucji - Wyzwolenie Stripe Payment Intent 
        // Symulacja blokady 250 PLN na podstawie płatności w sklepie Shopify 
        // (W prawdziwym przypadku, zablokowanie kaucji powinno powiązać Stripe Customera ze sklepu Shopify 
        // jeżeli korzystasz z bramki Stripe Native w Shopify - jeśli inna bramka, wyślemy mu link do panelu do akceptacji)

        console.log(`Tworzenie żądania kaucji preautoryzacji (250 PLN) dla ${userId}...`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 25000, // Kwota w groszach -> 250,00 PLN
            currency: 'pln',
            capture_method: 'manual', // Tylko blokuje środki (autoryzuje), ale ich nie ściąga
            metadata: {
                user_id: userId,
                shopify_order_id: order.id.toString(),
            }
        });

        const { error: depositErr } = await supabase
            .from('deposits')
            .insert({
                user_id: userId,
                stripe_payment_intent_id: paymentIntent.id,
                amount: 25000,
                status: 'requires_capture',
            });

        if (depositErr) {
            console.error("Błąd zapisu Intentu do bazy deposits:", depositErr);
            // Fail-safe - logujemy ale idziemy dalej wydać bilet 
        }

        // 4. Stworzenie Biletu / Biletów z zamówienia klienta 
        // Iterujemy przez tzw. Line Items z koszyka Shopify, wypatrując produktów-biletów 
        const items = order.line_items;

        for (const item of items) {
            // Weryfikacja: Załóżmy, że tag SKU biletów zaczyna się od 'TICKET' 
            // Lub pominięcie sprawdzeń by wrzucić jako bilet wszystko.
            // Szukamy pasującego event_id w tablicy events by to połączyć.

            // TODO: Logika wyszukiwania poprawnego 'event_id' w Supabase na podstawie nazwy lub SKU z Shopify
            let eventId = 'b0f8ae79-a720-4107-ac6c-1da5fa6908a7'; // Hardcoded fallback na dev test - Do podmieniena z query bazy

            const { data: eventData } = await supabase
                .from('events')
                .select('id')
                .ilike('title', `%${item.title.substring(0, 10)}%`) // Szukanie po fragmencie nazwy
                .limit(1);

            if (eventData && eventData.length > 0) {
                eventId = eventData[0].id;
            }

            // Generujemy losowy bezpieczny ciąg kodowy do QR
            const qrCodePlain = `EV${eventId}U${userId.substring(0, 4).toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            const { error: ticketErr } = await supabase
                .from('tickets')
                .insert({
                    event_id: eventId,
                    user_id: userId,
                    shopify_order_id: order.id.toString(),
                    ticket_type: 'standard', // Lub wyłowione z wariantu produktu
                    qr_code: qrCodePlain,
                    status: 'valid'
                });

            if (ticketErr) console.error("Krytyczny błąd wydania biletu:", ticketErr);
        }

        console.log(`Zakończono poprawnie procesowanie webhooka Shopify. Wydano bilety i autoryzację.`);
        res.status(200).send('OK');

    } catch (error) {
        console.error('Błąd Serwera podczas obsługi Webhooka:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`🚂 Serwer Cichoszau Railway uruchomiony na porcie ${PORT}`);
});
