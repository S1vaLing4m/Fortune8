import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This is the ghost in the machine. It listens for POST requests from Make.com
export async function POST(req: Request) {
  try {
    // 1. Catch the data Make.com sends us
    const body = await req.json();
    
    // We expect Make.com to send: { "accountName": "Cheque Account", "newBalance": 12500.50 }
    const { accountName, newBalance } = body;

    if (!accountName || newBalance === undefined) {
      return NextResponse.json({ error: 'Missing accountName or newBalance' }, { status: 400 });
    }

    // 2. Find the matching account in your Supabase database
    const { data: account, error: searchError } = await supabase
      .from('accounts')
      .select('id')
      .eq('name', accountName)
      .single();

    if (searchError || !account) {
      return NextResponse.json({ error: `Account '${accountName}' not found in Fortune8.` }, { status: 404 });
    }

    // 3. Update the balance silently
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ 
        balance: parseFloat(newBalance),
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id);

    if (updateError) throw updateError;

    // 4. Send a success signal back to Make.com
    return NextResponse.json({ success: true, message: `Updated ${accountName} to R${newBalance}` });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}