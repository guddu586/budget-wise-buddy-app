// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rxeahnsyvrnxvjhyfpkx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4ZWFobnN5dnJueHZqaHlmcGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNzQ5OTcsImV4cCI6MjA1OTc1MDk5N30.DVHQ2_nEEzioLC8TsD47sIbilu3PfWral_zgM1k7lvU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);