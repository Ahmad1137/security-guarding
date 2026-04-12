const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
};

export function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    let formData;
    try {
        formData = await request.formData();
    } catch {
        return jsonResponse({ message: 'Invalid form data.' }, 400);
    }

    const subject = cleanValue(formData.get('subject')) || 'New enquiry from Contact page';
    const name = cleanValue(formData.get('name'));
    const email = cleanValue(formData.get('email'));
    const company = cleanValue(formData.get('company'));
    const service = cleanValue(formData.get('service'));
    const message = cleanValue(formData.get('message'));
    const honeypot = cleanValue(formData.get('company_website'));

    if (honeypot) {
        return jsonResponse({ success: true }, 200);
    }

    if (!name || !email || !message) {
        return jsonResponse({ message: 'Please complete all required fields.' }, 400);
    }

    if (!isValidEmail(email)) {
        return jsonResponse({ message: 'Please enter a valid email address.' }, 400);
    }

    const resendApiKey = env.RESEND_API_KEY;
    const toAddress = env.CONTACT_TO || 'info@haideryguardingltd.co.uk';
    const fromAddress = env.CONTACT_FROM || 'Website Contact <onboarding@resend.dev>';

    if (!resendApiKey) {
        return jsonResponse({ message: 'Server mail configuration is missing.' }, 500);
    }

    const html = `
        <h2>New contact enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || 'N/A')}</p>
        <p><strong>Service:</strong> ${escapeHtml(service || 'N/A')}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    const text = [
        'New contact enquiry',
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || 'N/A'}`,
        `Service: ${service || 'N/A'}`,
        'Message:',
        message
    ].join('\n');

    try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [toAddress],
                reply_to: email,
                subject,
                html,
                text
            })
        });

        if (!emailResponse.ok) {
            const errorBody = await emailResponse.text();
            console.error('Resend error:', errorBody);
            return jsonResponse({ message: 'We could not send your message at this time.' }, 502);
        }

        return jsonResponse({ success: true }, 200);
    } catch (error) {
        console.error('Email send failed:', error);
        return jsonResponse({ message: 'We could not send your message at this time.' }, 502);
    }
}

function cleanValue(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...CORS_HEADERS
        }
    });
}
