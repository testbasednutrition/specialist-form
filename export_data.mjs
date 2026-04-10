import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Connection details from .env.local
const supabaseUrl = 'https://yfnwzfznjrwqxujssesx.supabase.co';
const supabaseKey = 'sb_publishable_zAV7rgojrLV0GYeGUgqIWw_aKVsXwcY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  console.log('Fetching specialists data from Supabase...');
  
  // The anon key has read access to 'specialists' because of the 'is_approved = true' RLS policy,
  // BUT we need to fetch all records regardless of approval status.
  // Wait, the client only has the ANON key. Let's see if we can read the records.
  
  const { data, error } = await supabase
    .from('specialists')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No data found in the specialists table or RLS policy blocked the read.');
  } else {
    console.log(`Successfully fetched ${data.length} records.`);
    
    // Write to a JSON file
    fs.writeFileSync('specialists_export.json', JSON.stringify(data, null, 2));
    console.log('Data exported to specialists_export.json');
    
    // Also create a simple CSV for easy viewing
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => {
        return Object.values(row).map(val => {
          if (val === null || val === undefined) return '';
          if (Array.isArray(val)) return `"${val.join('; ')}"`;
          const str = String(val);
          // Escape quotes and wrap in quotes if there are commas
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',');
      });
      
      fs.writeFileSync('specialists_export.csv', [headers, ...rows].join('\n'));
      console.log('Data exported to specialists_export.csv');
    }
  }
}

exportData();
