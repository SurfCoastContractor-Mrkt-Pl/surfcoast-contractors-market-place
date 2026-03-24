import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    const orders = await base44.entities.ConsumerOrder.filter({ id: order_id, consumer_email: user.email });
    const order = orders?.[0];

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SurfCoast Marketplace', 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Consumer Purchase Receipt', 20, 30);

    // Order Info
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Order #: ${order.order_number || order.id.substring(0, 12).toUpperCase()}`, 20, 64);
    doc.text(`Date: ${new Date(order.placed_at || order.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 72);
    doc.text(`Shop: ${order.shop_name}`, 20, 80);
    doc.text(`Type: ${order.shop_type === 'farmers_market' ? 'Farmers Market Booth' : 'Swap Meet Vendor'}`, 20, 88);
    doc.text(`Customer: ${user.full_name || user.email}`, 20, 96);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 103, pageWidth - 20, 103);

    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Item', 20, 113);
    doc.text('Qty', 120, 113);
    doc.text('Unit Price', 140, 113);
    doc.text('Subtotal', 170, 113);
    doc.line(20, 116, pageWidth - 20, 116);

    // Items
    doc.setFont('helvetica', 'normal');
    let y = 124;
    for (const item of order.items || []) {
      if (y > 260) { doc.addPage(); y = 20; }
      const name = item.product_name?.length > 40 ? item.product_name.substring(0, 37) + '...' : item.product_name;
      doc.text(name || '-', 20, y);
      doc.text(String(item.quantity || 1), 120, y);
      doc.text(`$${(item.price || 0).toFixed(2)}`, 140, y);
      doc.text(`$${(item.subtotal || (item.price * item.quantity) || 0).toFixed(2)}`, 170, y);
      y += 10;
    }

    // Total
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Paid:', 140, y);
    doc.text(`$${(order.total || 0).toFixed(2)}`, 170, y);

    // Footer
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for shopping at SurfCoast Marketplace!', 20, y);
    doc.text('SurfCoast Marketplace is a connection platform only. All sales are between buyers and vendors directly.', 20, y + 8, { maxWidth: pageWidth - 40 });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt-${order.order_number || order.id.substring(0, 8)}.pdf`,
      },
    });
  } catch (error) {
    console.error('generateConsumerReceipt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});