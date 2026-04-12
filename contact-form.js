const FORM_SELECTOR = '.contact-page-form';
const STATUS_SELECTOR = '.form-status';
const SUCCESS_REDIRECT = '/thanks.html';
const LOCAL_API_ORIGIN = 'https://leopard-services.pages.dev';

function setFormStatus(form, message, state) {
    const statusEl = form.querySelector(STATUS_SELECTOR);
    if (!statusEl) {
        return;
    }

    statusEl.textContent = message;
    statusEl.dataset.state = state;
}

function getSubmitUrl(form) {
    const hostname = window.location.hostname;
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalHost) {
        return form.action;
    }

    const actionPath = new URL(form.action, window.location.origin).pathname;
    return `${LOCAL_API_ORIGIN}${actionPath}`;
}

async function submitContactForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    if (!(form instanceof HTMLFormElement) || !(submitButton instanceof HTMLButtonElement)) {
        return;
    }

    if (!form.reportValidity()) {
        return;
    }

    submitButton.disabled = true;
    setFormStatus(form, 'Sending your message...', 'pending');

    try {
        const response = await fetch(getSubmitUrl(form), {
            method: 'POST',
            body: new FormData(form),
            headers: {
                Accept: 'application/json'
            }
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.message || 'Unable to send your enquiry right now.');
        }

        setFormStatus(form, 'Message sent. Redirecting...', 'success');
        form.reset();
        window.location.assign(SUCCESS_REDIRECT);
    } catch (error) {
        setFormStatus(form, error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(FORM_SELECTOR);
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    form.addEventListener('submit', submitContactForm);
});
