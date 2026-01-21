-- Fix for "Database error saving new user" - Run this in Supabase SQL Editor
-- This drops and recreates the trigger function with proper permissions

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with SECURITY DEFINER and bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert default categories (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO public.categories (user_id, name, color, is_default) VALUES
    (NEW.id, 'Work', '#3b82f6', true),
    (NEW.id, 'Personal', '#8b5cf6', true),
    (NEW.id, 'Exercise', '#10b981', true),
    (NEW.id, 'Learning', '#f59e0b', true),
    (NEW.id, 'Social', '#ec4899', true),
    (NEW.id, 'Rest', '#6366f1', true);

  -- Insert default settings (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO public.user_settings (user_id, theme, last_viewed_date)
  VALUES (NEW.id, 'light', CURRENT_DATE);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
