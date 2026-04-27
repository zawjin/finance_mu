/**
 * AI-Powered Categorization Utility
 * Predicts category based on transaction description
 */

const KNOWLEDGE_BASE = {
    'Food & Dining': [
        'food', 'eat', 'restaurant', 'dinner', 'lunch', 'swiggy', 'zomato', 'cafe', 'coffee', 'starbucks', 
        'bakery', 'pizza', 'burger', 'kfc', 'mcdonalds', 'hotel', 'dining', 'veg', 'non-veg', 'meat', 'biryani',
        'taj', 'itc', 'mariott', 'barbeque'
    ],
    'Shopping': [
        'amazon', 'flipkart', 'myntra', 'nykaa', 'ajio', 'shopping', 'cloth', 'fashion', 'zara', 'h&m',
        'shoe', 'mall', 'purchase', 'retail', 'gift'
    ],
    'Groceries': [
        'grocery', 'groceries', 'market', 'bigbasket', 'blinkit', 'zepto', 'milk', 'vegetable', 'fruit',
        'supermarket', 'mart', 'provision', 'store'
    ],
    'Transport': [
        'uber', 'ola', 'rapido', 'taxi', 'fuel', 'petrol', 'diesel', 'car', 'service', 'parking', 'toll',
        'metro', 'bus', 'train', 'irctc', 'flight', 'indigo', 'airindia'
    ],
    'Bills & Utilities': [
        'bill', 'electricity', 'water', 'gas', 'recharge', 'mobile', 'airtel', 'jio', 'vi', 'broadband',
        'wifi', 'internet', 'subscription', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube', 'aws',
        'google cloud', 'azure', 'digitalocean'
    ],
    'Health & Wellness': [
        'hospital', 'doctor', 'medicine', 'pharmacy', 'apollo', 'pharmeasy', 'health', 'clinic', 'dental',
        'gym', 'fitness', 'yoga', 'wellness'
    ],
    'Personal Care': [
        'salon', 'parlour', 'barber', 'spa', 'makeup', 'skin', 'hair', 'grooming'
    ],
    'Education': [
        'fee', 'school', 'college', 'course', 'udemy', 'coursera', 'book', 'stationery', 'exam'
    ],
    'Entertainment': [
        'movie', 'theatre', 'pvr', 'inox', 'game', 'gaming', 'playstation', 'steam', 'fun', 'park', 'club'
    ],
    'Home & Rent': [
        'rent', 'maintenance', 'plumber', 'electrician', 'furniture', 'cleaning', 'laundry'
    ],
    'Investment': [
        'stock', 'mutual fund', 'sip', 'zerodha', 'groww', 'upstox', 'crypto', 'bitcoin', 'gold', 'chit',
        'fd', 'fixed deposit'
    ]
};

export const predictSmartCategory = (text, categories = []) => {
    if (!text || text.length < 3) return null;
    
    const input = text.toLowerCase();
    
    // 1. Check knowledge base
    for (const [categoryName, keywords] of Object.entries(KNOWLEDGE_BASE)) {
        if (keywords.some(kw => input.includes(kw))) {
            const found = categories.find(c => 
                c.name.toLowerCase().includes(categoryName.split(' ')[0].toLowerCase()) ||
                categoryName.toLowerCase().includes(c.name.toLowerCase())
            );
            if (found) return found.name;
        }
    }
    
    // 2. Direct name matching
    const directMatch = categories.find(c => input.includes(c.name.toLowerCase()));
    if (directMatch) return directMatch.name;

    return null;
};
