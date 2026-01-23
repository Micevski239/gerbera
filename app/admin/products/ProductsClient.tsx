'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'
import type { Category, Product, ProductStatus } from '@/lib/supabase/types'

interface ProductsClientProps {
  products: Product[]
  categories: Category[]
}

interface ProductFormState {
  name_mk: string
  name_en: string
  description_mk: string | null
  description_en: string | null
  image_url: string
  price: string
  sale_price: string
  status: ProductStatus
  is_on_sale: boolean
  is_best_seller: boolean
  display_order: number
  is_visible: boolean
  category_id: string
}

const PRODUCT_BUCKET = 'product-images'

export default function ProductsClient({ products, categories }: ProductsClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const defaultForms = useMemo(() => {
    const map: Record<string, ProductFormState> = {}
    products.forEach((product) => {
      map[product.id] = {
        name_mk: product.name_mk,
        name_en: product.name_en,
        description_mk: product.description_mk,
        description_en: product.description_en,
        image_url: product.image_url,
        price: product.price ? String(product.price) : '',
        sale_price: product.sale_price ? String(product.sale_price) : '',
        status: product.status,
        is_on_sale: product.is_on_sale,
        is_best_seller: product.is_best_seller,
        display_order: product.display_order,
        is_visible: product.is_visible,
        category_id: product.category_id,
      }
    })
    return map
  }, [products])

  const [forms, setForms] = useState<Record<string, ProductFormState>>(defaultForms)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)

  const nextOrder = useMemo(() => {
    if (products.length === 0) return 10
    return Math.max(...products.map((product) => product.display_order)) + 10
  }, [products])

  const [newProduct, setNewProduct] = useState<ProductFormState>({
    name_mk: '',
    name_en: '',
    description_mk: '',
    description_en: '',
    image_url: '',
    price: '',
    sale_price: '',
    status: 'draft',
    is_on_sale: false,
    is_best_seller: false,
    display_order: nextOrder,
    is_visible: true,
    category_id: categories[0]?.id || '',
  })

  useEffect(() => {
    setForms(defaultForms)
  }, [defaultForms])

  useEffect(() => {
    setNewProduct((prev) => ({
      ...prev,
      display_order: nextOrder,
      category_id: prev.category_id || categories[0]?.id || '',
    }))
  }, [nextOrder, categories])

  const categoryLookup = useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach((category) => map.set(category.id, category))
    return map
  }, [categories])

  const handleFormChange = (productId: string, field: keyof ProductFormState, value: string | number | boolean | null) => {
    setForms((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value as never,
      },
    }))
  }

  const toNumberOrNull = (value: string) => {
    const trimmed = value.trim()
    return trimmed === '' ? null : Number(trimmed)
  }

  const uploadProductImage = async (file: File, productId: string | null) => {
    const optimized = await compressImage(file, 1600)
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
    const prefix = productId ?? 'new'
    const path = `${prefix}/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, optimized, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const handleImageSelect = async (targetId: string | null, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]

    setUploadingImageId(targetId ?? 'new')
    try {
      const publicUrl = await uploadProductImage(file, targetId)
      if (targetId) {
        setForms((prev) => ({
          ...prev,
          [targetId]: {
            ...prev[targetId],
            image_url: publicUrl,
          },
        }))
      } else {
        setNewProduct((prev) => ({ ...prev, image_url: publicUrl }))
      }
    } catch (error) {
      console.error(error)
      alert('Failed to upload the image.')
    } finally {
      setUploadingImageId(null)
    }
  }

  const handleSave = async (productId: string) => {
    const form = forms[productId]
    if (!form) return

    if (!form.category_id) {
      alert('Select a category for this product.')
      return
    }

    if (!form.name_mk.trim() || !form.name_en.trim()) {
      alert('Provide Macedonian and English names.')
      return
    }

    setSavingId(productId)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name_mk || form.name_en,
          name_mk: form.name_mk,
          name_en: form.name_en,
          description: form.description_mk,
          description_mk: form.description_mk,
          description_en: form.description_en,
          image_url: form.image_url,
          price_text: 'From',
          price: toNumberOrNull(form.price),
          sale_price: toNumberOrNull(form.sale_price),
          status: form.status,
          is_on_sale: form.is_on_sale,
          is_best_seller: form.is_best_seller,
          display_order: form.display_order,
          is_visible: form.is_visible,
          category_id: form.category_id,
        } as never)
        .eq('id', productId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save product changes.')
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newProduct.category_id) {
      alert('Select a category for the product.')
      return
    }
    if (!newProduct.name_mk.trim() || !newProduct.name_en.trim()) {
      alert('Provide Macedonian and English names.')
      return
    }
    if (!newProduct.image_url.trim()) {
      alert('Upload or paste an image URL for the product.')
      return
    }

    setCreating(true)
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name_mk || newProduct.name_en,
          name_mk: newProduct.name_mk,
          name_en: newProduct.name_en,
          description: newProduct.description_mk,
          description_mk: newProduct.description_mk,
          description_en: newProduct.description_en,
          image_url: newProduct.image_url,
          price_text: 'From',
          price: toNumberOrNull(newProduct.price),
          sale_price: toNumberOrNull(newProduct.sale_price),
          status: newProduct.status,
          is_on_sale: newProduct.is_on_sale,
          is_best_seller: newProduct.is_best_seller,
          display_order: newProduct.display_order,
          is_visible: newProduct.is_visible,
          category_id: newProduct.category_id,
        } as never)

      if (error) throw new Error(error.message)

      setNewProduct({
        name_mk: '',
        name_en: '',
        description_mk: '',
        description_en: '',
        image_url: '',
        price: '',
        sale_price: '',
        status: 'draft',
        is_on_sale: false,
        is_best_seller: false,
        display_order: nextOrder + 10,
        is_visible: true,
        category_id: categories[0]?.id || '',
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create product.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete product.')
    }
  }

  const handleMove = async (productId: string, direction: 'up' | 'down') => {
    const index = products.findIndex((product) => product.id === productId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= products.length) return

    const current = products[index]
    const target = products[targetIndex]

    setMovingId(productId)
    try {
      const { error: firstError } = await supabase
        .from('products')
        .update({ display_order: target.display_order } as never)
        .eq('id', current.id)

      if (firstError) throw new Error(firstError.message)

      const { error: secondError } = await supabase
        .from('products')
        .update({ display_order: current.display_order } as never)
        .eq('id', target.id)

      if (secondError) throw new Error(secondError.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to reorder products.')
    } finally {
      setMovingId(null)
    }
  }

  const statusOptions: ProductStatus[] = ['draft', 'published', 'sold']

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Create Product</h2>
          <p className="text-sm text-neutral-500">Products require names, category, and an image URL.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Name (MK)</label>
            <input
              className="input"
              value={newProduct.name_mk}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, name_mk: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Name (EN)</label>
            <input
              className="input"
              value={newProduct.name_en}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, name_en: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={newProduct.category_id}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, category_id: e.target.value }))}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_mk} / {category.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={newProduct.status}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, status: e.target.value as ProductStatus }))}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <label className="label flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5 text-primary-600"
              checked={newProduct.is_visible}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, is_visible: e.target.checked }))}
            />
            <span>Visible</span>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Price (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={newProduct.price}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Sale Price (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={newProduct.sale_price}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, sale_price: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="label flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={newProduct.is_on_sale}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, is_on_sale: e.target.checked }))}
            />
            <span>Mark as on sale</span>
          </label>
          <label className="label flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={newProduct.is_best_seller}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, is_best_seller: e.target.checked }))}
            />
            <span>Mark as best seller</span>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => handleImageSelect(null, e.target.files)}
            />
            {uploadingImageId === 'new' && <p className="text-xs text-neutral-500 mt-1">Uploading…</p>}
            {newProduct.image_url && (
              <p className="text-xs text-neutral-500 mt-1">Image uploaded</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Description (MK)</label>
            <textarea
              className="textarea"
              rows={3}
              value={newProduct.description_mk ?? ''}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, description_mk: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Description (EN)</label>
            <textarea
              className="textarea"
              rows={3}
              value={newProduct.description_en ?? ''}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, description_en: e.target.value }))}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Saving…' : 'Create Product'}
        </button>
      </form>

      <div className="space-y-6">
        {products.map((product, index) => {
          const form = forms[product.id]
          if (!form) return null
          const category = categoryLookup.get(form.category_id)
          return (
            <div key={product.id} className="rounded-2xl bg-white p-6 shadow-card space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">{product.name_en}</h3>
                  <p className="text-sm text-neutral-500">{category ? `${category.name_mk} / ${category.name_en}` : 'Unassigned'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                    onClick={() => handleMove(product.id, 'up')}
                    disabled={index === 0 || movingId === product.id}
                  >
                    ↑
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                    onClick={() => handleMove(product.id, 'down')}
                    disabled={index === products.length - 1 || movingId === product.id}
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-neutral-200">
                    {form.image_url ? (
                      <img src={form.image_url} alt={form.name_en} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">No image</div>
                    )}
                  </div>
                  <label className="mt-3 block text-sm font-medium text-neutral-600">
                    <span>Change image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-sm"
                      onChange={(e) => handleImageSelect(product.id, e.target.files)}
                    />
                  </label>
                  {uploadingImageId === product.id && <p className="text-xs text-neutral-500">Uploading…</p>}
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Name (MK)</label>
                      <input
                        className="input"
                        value={form.name_mk}
                        onChange={(e) => handleFormChange(product.id, 'name_mk', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Name (EN)</label>
                      <input
                        className="input"
                        value={form.name_en}
                        onChange={(e) => handleFormChange(product.id, 'name_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="label">Category</label>
                      <select
                        className="input"
                        value={form.category_id}
                        onChange={(e) => handleFormChange(product.id, 'category_id', e.target.value)}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name_mk} / {category.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select
                        className="input"
                        value={form.status}
                        onChange={(e) => handleFormChange(product.id, 'status', e.target.value as ProductStatus)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="label flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5"
                        checked={form.is_visible}
                        onChange={(e) => handleFormChange(product.id, 'is_visible', e.target.checked)}
                      />
                      <span>Visible</span>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Price (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={form.price}
                        onChange={(e) => handleFormChange(product.id, 'price', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Sale Price (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={form.sale_price}
                        onChange={(e) => handleFormChange(product.id, 'sale_price', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="label flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5"
                        checked={form.is_on_sale}
                        onChange={(e) => handleFormChange(product.id, 'is_on_sale', e.target.checked)}
                      />
                      <span>On sale</span>
                    </label>
                    <label className="label flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5"
                        checked={form.is_best_seller}
                        onChange={(e) => handleFormChange(product.id, 'is_best_seller', e.target.checked)}
                      />
                      <span>Best seller</span>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Description (MK)</label>
                      <textarea
                        className="textarea"
                        rows={3}
                        value={form.description_mk ?? ''}
                        onChange={(e) => handleFormChange(product.id, 'description_mk', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Description (EN)</label>
                      <textarea
                        className="textarea"
                        rows={3}
                        value={form.description_en ?? ''}
                        onChange={(e) => handleFormChange(product.id, 'description_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="btn btn-primary" onClick={() => handleSave(product.id)} disabled={savingId === product.id}>
                      {savingId === product.id ? 'Saving…' : 'Save changes'}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={() => setForms((prev) => ({ ...prev, [product.id]: defaultForms[product.id] }))} disabled={savingId === product.id}>
                      Reset
                    </button>
                    <button className="btn btn-danger" type="button" onClick={() => handleDelete(product.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-neutral-500">
            No products yet. Use the form above to add your first product.
          </div>
        )}
      </div>
    </div>
  )
}
