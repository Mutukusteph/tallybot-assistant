const express = require('express');
const cors = require('cors');
const app = express();
const port = 1212;

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bplvtmnxpqdvlzlhuxus.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHZ0bW54cHFkdmx6bGh1eHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTg5NTYsImV4cCI6MjA2Njg5NDk1Nn0.5hURpKRTEIIEGw59M-NMabGCPC0AzETUt_PFuVIKR90');

// User message parser
function parseUserInput(userMessage) {
  const words = userMessage.toLowerCase().split(' ');

  if (words[0] === 'sold') {
    const quantity = parseInt(words[1]);
    const item = words[2];
    const price = parseInt(words[4]);
    return {
      action: 'sale',
      item,
      quantity,
      price_per_unit: price,
      total: quantity * price
    };
  }

  if (words[0] === 'bought') {
    const quantity = parseInt(words[1]);
    const item = words[3];
    const price = parseInt(words[6]);
    return {
      action: 'expense',
      item,
      quantity,
      price_per_unit: price,
      total: quantity * price
    };
  }

  if (words[0] === 'paid') {
    const item = words[1];
    const total = parseInt(words[2]);
    return {
      action: 'expense',
      item,
      quantity: 1,
      price_per_unit: total,
      total
    };
  }

  if (words[0] === 'add') {
    const quantity = parseInt(words[1]);
    const item = words.slice(2).join(' ');
    return {
      action: 'inventory',
      item,
      quantity,
      price_per_unit: null,
      total: null
    };
  }

  throw new Error("Invalid input format");
}

app.use(cors());
app.use(express.json());

app.post('/message', async (req, res) => {
  try {
    const parsed = parseUserInput(req.body.message);
    parsed.user_id = 'stephen_001';

    const { error } = await supabase.from('transactions').insert([parsed]);
    if (error) throw new Error(error.message);

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const { action } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', 'stephen_001')
      .order('id', { ascending: false });

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch transactions' });
  }
});

app.get('/totals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('action, total, quantity')
      .eq('user_id', 'stephen_001');

    if (error) throw error;

    let salesTotal = 0;
    let expensesTotal = 0;
    let inventoryCount = 0;

    for (const row of data) {
      if (row.action === 'sale') {
        salesTotal += row.total || 0;
      } else if (row.action === 'expense') {
        expensesTotal += row.total || 0;
      } else if (row.action === 'inventory') {
        inventoryCount += row.quantity || 0;
      }
    }

    res.json({
      success: true,
      sales_total: salesTotal,
      expenses_total: expensesTotal,
      inventory_count: inventoryCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to calculate totals.' });
  }
});

app.delete('/transactions/clear', async (req, res) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', 'stephen_001');

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting all:', err.message);
    res.status(500).json({ success: false, error: 'Failed to clear transactions.' });
  }
});


app.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Attempting to delete transaction with ID: ${id}`);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', 'stephen_001');

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete transaction.' });
  }
});



app.listen(port, () => {
  console.log(`🚀 TallyBot server running at http://localhost:${port}`);
});