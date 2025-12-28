export default function InfoPage() {
    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Contact Us</h1>
            <p style={{ marginBottom: '1rem' }}>Get in touch with us:</p>
            <p style={{ marginBottom: '0.5rem' }}>
                <strong>Phone:</strong> <a href="tel:+919940244607" style={{ color: 'var(--gold-primary)' }}>+91 99402 44607</a>
            </p>
            <p>
                <strong>Email:</strong> <a href="mailto:support@housesofmedusa.com" style={{ color: 'var(--gold-primary)' }}>support@housesofmedusa.com</a>
            </p>
        </div>
    );
}
