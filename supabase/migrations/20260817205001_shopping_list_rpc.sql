-- ============================================================================
-- Shopping List RPC Functions
-- ============================================================================
-- These functions bypass PostgREST schema cache validation
-- by using direct SQL execution
-- ============================================================================

-- Function to get shopping list for a user
CREATE OR REPLACE FUNCTION public.get_shopping_list(p_user_id UUID)
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  ingredient_id TEXT,
  ingredient_name TEXT,
  ingredient_category TEXT,
  is_checked BOOLEAN,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.id,
    sl.user_id,
    sl.ingredient_id,
    sl.ingredient_name,
    sl.ingredient_category,
    sl.is_checked,
    sl.added_at
  FROM public.shopping_list sl
  WHERE sl.user_id = p_user_id
  ORDER BY sl.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert a shopping list item
CREATE OR REPLACE FUNCTION public.upsert_shopping_item(
  p_user_id UUID,
  p_ingredient_id TEXT,
  p_ingredient_name TEXT,
  p_ingredient_category TEXT DEFAULT NULL,
  p_is_checked BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  ingredient_id TEXT,
  ingredient_name TEXT,
  ingredient_category TEXT,
  is_checked BOOLEAN,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.shopping_list (user_id, ingredient_id, ingredient_name, ingredient_category, is_checked)
  VALUES (p_user_id, p_ingredient_id, p_ingredient_name, p_ingredient_category, p_is_checked)
  ON CONFLICT (user_id, ingredient_id)
  DO UPDATE SET 
    ingredient_name = EXCLUDED.ingredient_name,
    ingredient_category = EXCLUDED.ingredient_category,
    is_checked = EXCLUDED.is_checked
  RETURNING 
    shopping_list.id,
    shopping_list.user_id,
    shopping_list.ingredient_id,
    shopping_list.ingredient_name,
    shopping_list.ingredient_category,
    shopping_list.is_checked,
    shopping_list.added_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a shopping list item (returns number of deleted rows)
CREATE OR REPLACE FUNCTION public.delete_shopping_item(
  p_user_id UUID,
  p_ingredient_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.shopping_list
  WHERE user_id = p_user_id AND ingredient_id = p_ingredient_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle a shopping list item's checked status
CREATE OR REPLACE FUNCTION public.toggle_shopping_item_checked(
  p_user_id UUID,
  p_ingredient_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  UPDATE public.shopping_list
  SET is_checked = NOT is_checked
  WHERE user_id = p_user_id AND ingredient_id = p_ingredient_id
  RETURNING is_checked INTO v_new_status;
  
  RETURN v_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear all checked items
CREATE OR REPLACE FUNCTION public.clear_checked_shopping_items(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.shopping_list
  WHERE user_id = p_user_id AND is_checked = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear all shopping items
CREATE OR REPLACE FUNCTION public.clear_all_shopping_items(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.shopping_list
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_shopping_list(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_shopping_item(UUID, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_shopping_item(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_shopping_item_checked(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_checked_shopping_items(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_all_shopping_items(UUID) TO authenticated;

-- Also grant to service role
GRANT EXECUTE ON FUNCTION public.get_shopping_list(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_shopping_item(UUID, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_shopping_item(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.toggle_shopping_item_checked(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_checked_shopping_items(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_all_shopping_items(UUID) TO service_role;

