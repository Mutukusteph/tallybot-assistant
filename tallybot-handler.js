// Supabase setup
// Connect with valid supabase url and key

const { createClient } = require('@supabase/supabase-js');

// 🟡 Replace these with your actual project details from Supabase
const supabaseUrl = 'https://bplvtmnxpqdvlzlhuxus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHZ0bW54cHFkdmx6bGh1eHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTg5NTYsImV4cCI6MjA2Njg5NDk1Nn0.5hURpKRTEIIEGw59M-NMabGCPC0AzETUt_PFuVIKR90'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 🧠 Parse user input into structured data
// Nicely handles "Sold, bought, paind and add X items at Y". Also includes validation
function parseUserInput(userMessage) {
  const words = userMessage.toLowerCase().split(' ');

  if (words[0] === 'sold') {
    const quantity = parseInt(words[1]);
    const item = words[2];
    const price = parseInt(words[4]);

    if (isNaN(quantity) || isNaN(price)) {
      throw new Error('Please enter valid numbers for quantity and price.');
    }

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

    if (isNaN(quantity) || isNaN(price)) {
      throw new Error('Please enter valid numbers for quantity and price.');
    }

    return {
      action: 'expense',
      item,
      quantity,
      price_per_unit: price,
      total: quantity * price
    };
  }

  if (words[0] === 'paid') {
    const item = words[1]; // e.g., rent
    const total = parseInt(words[2]);

    if (isNaN(total)) {
      throw new Error('Please enter a valid number for amount paid.');
    }

    return {
      action: 'expense',
      item,
      quantity: 1,
      price_per_unit: total,
      total: total
    };
  }

  if (words[0] === 'add') {
    const quantity = parseInt(words[1]);
    const item = words.slice(2).join(' '); // allow multi-word item names

    if (isNaN(quantity)) {
      throw new Error('Please enter a valid quantity.');
    }

    return {
      action: 'inventory',
      item,
      quantity,
      price_per_unit: null,
      total: null
    };
  }

  throw new Error('Sorry, I don’t understand that message.');
}


// 💾 Save transaction to Supabase
// Inserts into Supabase correctly.
async function saveTransaction(data) {
  const { error } = await supabase.from('transactions').insert([data]);
  if (error) {
    console.error('❌ Failed to save to Supabase:', error.message);
  } else {
    console.log('✅ Transaction saved successfully!');
  }
}

// 🚀 Main handler
// HandleUserInput function well strtuctured with try-catch to gracefully handling errors.
async function handleUserInput(userText) {
  try {
    const parsedData = parseUserInput(userText);
    parsedData.user_id = 'stephen_001';
    await saveTransaction(parsedData);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// 🧪 Run test/Test call
// Calling with "Sold 4 bananas at 30"
const testInputs = [
  'Sold 3 loaves at 25',
  'Bought 2 crates of soda at 500 each',
  'Paid rent 1500',
  'Add 10 packets of sugar'
];

testInputs.forEach(input => {
  handleUserInput(input);
});

// or you one can use the below functions to Run test:
// handleUserInput('Sold 3 loaves at 25');
// handleUserInput('Bought 2 crates of soda at 500 each');
// handleUserInput('Paid rent 1500');
// handleUserInput('Add 10 packets of sugar');

