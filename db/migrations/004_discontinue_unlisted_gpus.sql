-- 004: retire GPUs no Canadian retailer lists any more (checked 2026-11-12:
-- Canada Computers, Amazon.ca and Newegg.ca returned no matching new listing,
-- and the vision fallback confirmed none). They drop out of lists, the API and
-- scheduled scrapes; product pages and price history stay.
-- The RX 7900 XTX is still stocked and stays active.
UPDATE products SET discontinued = true
WHERE id IN ('rx-7600-xt', 'rx-7800-xt', 'rx-7900-xt', 'rx-9060-xt-8gb');
