-- Dormant operator-only order reference foundation. This does not create orders,
-- expose order lookup, verify payments, or enable checkout/reward issuance.
create sequence private.customer_order_number_sequence
  as integer start with 10000 minvalue 10000 maxvalue 99999 no cycle;

create table private.customer_order_numbers (
  order_id uuid primary key,
  customer_number integer not null unique check (customer_number between 10000 and 99999),
  assigned_at timestamptz not null default clock_timestamp()
);
alter table private.customer_order_numbers enable row level security;
revoke all on private.customer_order_numbers from public, anon, authenticated;
revoke all on sequence private.customer_order_number_sequence from public, anon, authenticated;

comment on table private.customer_order_numbers is
  'Private permanent reference ledger; no orders table exists yet. Bind a restrictive FK in the future order migration before integrating live checkout. Never use customer_number as an authorization credential.';

create function private.assign_customer_order_number(target_order uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare existing_order uuid; assigned_number integer; candidate integer;
begin
  if target_order is null then
    raise exception 'An existing order UUID is required' using errcode = '22023';
  end if;
  if to_regclass('public.orders') is null then
    raise exception 'Order service is not configured; no order reference was generated' using errcode = '55000';
  end if;
  -- A real order must exist first, inside this same trusted transaction.
  -- Fixed SQL identifiers and a bound UUID prevent SQL injection.
  -- Serializing on the actual order row makes retries/concurrent assignments idempotent.
  execute 'select id from public.orders where id = $1 for update'
    into existing_order using target_order;
  if existing_order is null then
    raise exception 'Order does not exist; no order reference was generated' using errcode = '22023';
  end if;
  select customer_number into assigned_number
    from private.customer_order_numbers where order_id = target_order;
  if assigned_number is not null then return assigned_number; end if;
  loop
    begin
      candidate := nextval('private.customer_order_number_sequence'::regclass);
    exception when sequence_generator_limit_exceeded then
      raise exception 'Five-digit order reference capacity exhausted; increase the reference namespace before accepting more orders'
        using errcode = '54000';
    end;
    insert into private.customer_order_numbers(order_id, customer_number)
      values (target_order, candidate) on conflict (customer_number) do nothing
      returning customer_number into assigned_number;
    if assigned_number is not null then return assigned_number; end if;
    -- Existing numbers are never reassigned, even if an operator has restored
    -- an older sequence value. Move forward until a free reference or exhaustion.
  end loop;
end $$;
revoke all on function private.assign_customer_order_number(uuid) from public, anon, authenticated;
comment on function private.assign_customer_order_number(uuid) is
  'Operator/future trusted order transaction only. Deliberately no client or service-role grant. Requires an existing public.orders UUID; cannot currently mint a reference because the order service is absent.';
