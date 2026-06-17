
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Seed starter goals so the app feels alive on first launch
  INSERT INTO public.goals (user_id, name, emoji, target_amount, saved_amount, color)
  VALUES
    (NEW.id, 'Emergency Fund', 'shield', 5000, 750, 'from-emerald-500/30 to-teal-700/30'),
    (NEW.id, 'Dream Vacation', 'plane', 3000, 420, 'from-amber-400/30 to-orange-600/30'),
    (NEW.id, 'New Laptop', 'laptop', 1800, 240, 'from-sky-500/30 to-blue-700/30');

  RETURN NEW;
END $function$;

-- Make sure the auth trigger is wired up (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
