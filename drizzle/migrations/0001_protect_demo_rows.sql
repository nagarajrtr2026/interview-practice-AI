DROP POLICY "Anyone can delete interviews" ON public.interviews;
CREATE POLICY "Demo records cannot be deleted" ON public.interviews FOR DELETE USING (is_demo = false);
CREATE POLICY "Demo records cannot be faked" ON public.interviews AS RESTRICTIVE FOR INSERT WITH CHECK (is_demo = false);