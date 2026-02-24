CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT * FROM profiles p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);
