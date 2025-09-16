// Simple script to run database migration via Supabase client
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250916000001_create_tables.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Running database migration...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('Created tables: projects, budget_rows, ai_runs, forecast_history, billing_rows, scenarios');
    
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

runMigration();