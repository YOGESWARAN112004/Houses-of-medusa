import nodemailer from 'nodemailer';

// Email configuration from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM_EMAIL = process.env.SMTP_USER || 'noreply@housesofmedusa.com';
const STORE_NAME = 'Houses of Medusa';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    image?: string;
}

interface OrderData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: OrderItem[];
    pricing: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    shippingAddress: {
        firstName: string;
        lastName: string;
        address: string;
        apartment?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    paymentId?: string;
}

// Format currency
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(price);
};

// Generate items HTML for email
const generateItemsHtml = (items: OrderItem[]): string => {
    return items.map(item => `
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a;">
                <div style="display: flex; align-items: center;">
                    <div>
                        <p style="margin: 0; color: #ffffff; font-weight: 500;">${item.name}</p>
                        ${item.size ? `<p style="margin: 4px 0 0; color: #888888; font-size: 13px;">Size: ${item.size}</p>` : ''}
                        <p style="margin: 4px 0 0; color: #888888; font-size: 13px;">Qty: ${item.quantity}</p>
                    </div>
                </div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #c9a86c; font-weight: 500;">
                ${formatPrice(item.price * item.quantity)}
            </td>
        </tr>
    `).join('');
};

// Customer order confirmation email template
const customerEmailTemplate = (order: OrderData): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${STORE_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-bottom: 1px solid #c9a86c;">
                            <h1 style="margin: 0; color: #c9a86c; font-size: 28px; font-weight: 300; letter-spacing: 4px;">HOUSES OF MEDUSA</h1>
                        </td>
                    </tr>
                    
                    <!-- Thank You Section -->
                    <tr>
                        <td style="padding: 48px 40px; text-align: center;">
                            <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #c9a86c 0%, #a07c4a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="color: #0a0a0a; font-size: 28px;">✓</span>
                            </div>
                            <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 24px; font-weight: 400;">Thank You for Your Order</h2>
                            <p style="margin: 0; color: #888888; font-size: 15px;">Your exclusive piece has been secured</p>
                        </td>
                    </tr>
                    
                    <!-- Order Details -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="background-color: #1a1a1a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                                <table width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                                            <p style="margin: 0; color: #c9a86c; font-size: 18px; font-weight: 500;">#${order.orderId.substring(0, 8).toUpperCase()}</p>
                                        </td>
                                        <td style="text-align: right;">
                                            <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Payment ID</p>
                                            <p style="margin: 0; color: #ffffff; font-size: 14px;">${order.paymentId || 'Confirmed'}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Order Items -->
                    <tr>
                        <td style="padding: 0 40px 24px;">
                            <h3 style="margin: 0 0 16px; color: #ffffff; font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Items</h3>
                            <table width="100%" cellspacing="0" cellpadding="0">
                                ${generateItemsHtml(order.items)}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Pricing Summary -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <div style="background-color: #1a1a1a; border-radius: 8px; padding: 24px;">
                                <table width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #888888;">Subtotal</td>
                                        <td style="padding: 8px 0; color: #ffffff; text-align: right;">${formatPrice(order.pricing.subtotal)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #888888;">Shipping</td>
                                        <td style="padding: 8px 0; color: #ffffff; text-align: right;">${order.pricing.shipping === 0 ? 'Complimentary' : formatPrice(order.pricing.shipping)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #888888;">GST (18%)</td>
                                        <td style="padding: 8px 0; color: #ffffff; text-align: right;">${formatPrice(order.pricing.tax)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding: 16px 0 0; border-top: 1px solid #2a2a2a;"></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #ffffff; font-size: 18px; font-weight: 500;">Total</td>
                                        <td style="padding: 8px 0; color: #c9a86c; font-size: 18px; font-weight: 500; text-align: right;">${formatPrice(order.pricing.total)}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Shipping Address -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <h3 style="margin: 0 0 16px; color: #ffffff; font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Shipping To</h3>
                            <div style="background-color: #1a1a1a; border-radius: 8px; padding: 24px;">
                                <p style="margin: 0 0 4px; color: #ffffff; font-weight: 500;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
                                <p style="margin: 0; color: #888888; line-height: 1.6;">
                                    ${order.shippingAddress.address}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}<br>
                                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                                    ${order.shippingAddress.country}
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Next Steps -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <div style="background: linear-gradient(135deg, rgba(201, 168, 108, 0.1) 0%, rgba(201, 168, 108, 0.05) 100%); border: 1px solid rgba(201, 168, 108, 0.3); border-radius: 8px; padding: 24px; text-align: center;">
                                <p style="margin: 0 0 8px; color: #c9a86c; font-weight: 500;">What's Next?</p>
                                <p style="margin: 0; color: #888888; font-size: 14px; line-height: 1.6;">
                                    We're preparing your order with the utmost care. You'll receive a shipping confirmation with tracking details once your order is on its way.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #0d0d0d; text-align: center; border-top: 1px solid #2a2a2a;">
                            <p style="margin: 0 0 8px; color: #888888; font-size: 13px;">Need help? Contact our concierge team</p>
                            <a href="mailto:concierge@housesofmedusa.com" style="color: #c9a86c; text-decoration: none; font-size: 14px;">concierge@housesofmedusa.com</a>
                            <p style="margin: 24px 0 0; color: #555555; font-size: 12px;">© ${new Date().getFullYear()} Houses of Medusa. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Admin notification email template
const adminEmailTemplate = (order: OrderData): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order - ${STORE_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 24px; background-color: #0a0a0a; text-align: center;">
                            <h1 style="margin: 0; color: #c9a86c; font-size: 20px; font-weight: 500;">🛍️ New Order Received</h1>
                        </td>
                    </tr>
                    
                    <!-- Order Summary -->
                    <tr>
                        <td style="padding: 32px;">
                            <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td style="padding: 12px;">
                                        <p style="margin: 0 0 4px; color: #666666; font-size: 12px; text-transform: uppercase;">Order ID</p>
                                        <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">${order.orderId}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px;">
                                        <p style="margin: 0 0 4px; color: #666666; font-size: 12px; text-transform: uppercase;">Total Amount</p>
                                        <p style="margin: 0; color: #c9a86c; font-size: 24px; font-weight: 600;">${formatPrice(order.pricing.total)}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Customer Details -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <h3 style="margin: 0 0 16px; color: #333333; font-size: 14px; font-weight: 600; text-transform: uppercase;">Customer Details</h3>
                            <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f9f9f9; border-radius: 8px;">
                                <tr>
                                    <td style="color: #666666; width: 100px;">Name</td>
                                    <td style="color: #000000; font-weight: 500;">${order.customerName}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666;">Email</td>
                                    <td style="color: #000000;">${order.customerEmail}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666;">Phone</td>
                                    <td style="color: #000000;">${order.customerPhone}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Items -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <h3 style="margin: 0 0 16px; color: #333333; font-size: 14px; font-weight: 600; text-transform: uppercase;">Items Ordered (${order.items.length})</h3>
                            <table width="100%" cellspacing="0" cellpadding="0">
                                ${order.items.map(item => `
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                                            <p style="margin: 0; color: #000000; font-weight: 500;">${item.name}</p>
                                            <p style="margin: 4px 0 0; color: #666666; font-size: 13px;">Qty: ${item.quantity} ${item.size ? `| Size: ${item.size}` : ''}</p>
                                        </td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 500;">
                                            ${formatPrice(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                `).join('')}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Shipping Address -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <h3 style="margin: 0 0 16px; color: #333333; font-size: 14px; font-weight: 600; text-transform: uppercase;">Shipping Address</h3>
                            <p style="margin: 0; color: #333333; line-height: 1.6;">
                                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                                ${order.shippingAddress.address}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}<br>
                                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                                ${order.shippingAddress.country}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- CTA -->
                    <tr>
                        <td style="padding: 0 32px 32px; text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://housesofmedusa.com'}/admin/orders/${order.orderId}" 
                               style="display: inline-block; padding: 14px 32px; background-color: #0a0a0a; color: #c9a86c; text-decoration: none; border-radius: 4px; font-weight: 500;">
                                View Order Details →
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">This is an automated notification from Houses of Medusa Admin</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(order: OrderData): Promise<boolean> {
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.warn('SMTP not configured, skipping customer email');
            return false;
        }

        await transporter.sendMail({
            from: `"${STORE_NAME}" <${FROM_EMAIL}>`,
            to: order.customerEmail,
            subject: `Order Confirmed - #${order.orderId.substring(0, 8).toUpperCase()}`,
            html: customerEmailTemplate(order),
        });

        console.log('Order confirmation email sent to:', order.customerEmail);
        return true;
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        return false;
    }
}

/**
 * Send new order notification to admin emails
 */
export async function sendAdminOrderNotification(order: OrderData): Promise<boolean> {
    try {
        const adminEmails = process.env.ADMIN_EMAILS;
        if (!adminEmails || !process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.warn('SMTP or ADMIN_EMAILS not configured, skipping admin notification');
            return false;
        }

        const recipients = adminEmails.split(',').map(e => e.trim()).filter(Boolean);
        if (recipients.length === 0) {
            console.warn('No admin emails configured');
            return false;
        }

        await transporter.sendMail({
            from: `"${STORE_NAME} Orders" <${FROM_EMAIL}>`,
            to: recipients.join(', '),
            subject: `🛍️ New Order: ${formatPrice(order.pricing.total)} - #${order.orderId.substring(0, 8).toUpperCase()}`,
            html: adminEmailTemplate(order),
        });

        console.log('Admin notification sent to:', recipients.join(', '));
        return true;
    } catch (error) {
        console.error('Failed to send admin notification email:', error);
        return false;
    }
}

/**
 * Send both customer and admin emails
 */
export async function sendOrderEmails(order: OrderData): Promise<{ customer: boolean; admin: boolean }> {
    const [customer, admin] = await Promise.all([
        sendOrderConfirmation(order),
        sendAdminOrderNotification(order),
    ]);

    return { customer, admin };
}
