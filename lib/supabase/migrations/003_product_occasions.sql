-- Product Occasions (many-to-many)
CREATE TABLE IF NOT EXISTS product_occasions (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  occasion_id UUID NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, occasion_id)
);

CREATE INDEX IF NOT EXISTS idx_product_occasions_product_id ON product_occasions (product_id);
CREATE INDEX IF NOT EXISTS idx_product_occasions_occasion_id ON product_occasions (occasion_id);

ALTER TABLE product_occasions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product occasions"
  ON product_occasions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage product occasions"
  ON product_occasions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
