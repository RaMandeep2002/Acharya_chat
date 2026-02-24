-- Add admin read-all policy
create policy "Admins can read all profiles"
on profiles
for select
using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
    and p.is_admin = true
  )
);
