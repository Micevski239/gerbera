'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'
import type { Category, Product, ProductOccasion, Occasion, ProductStatus } from '@/lib/supabase/types'

interface ProductsClientProps {
  products: Product[]
  categories: Category[]
  occasions: Occasion[]
  productOccasions: ProductOccasion[]
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
  occasion_ids: string[]
}

const PRODUCT_BUCKET = 'product-images'

export default function ProductsClient({ products, categories, occasions, productOccasions }: ProductsClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const productOccasionMap = useMemo(() => {
    const map = new Map<string, string[]>()
    productOccasions.forEach((link) => {
      const list = map.get(link.product_id) ?? []
      list.push(link.occasion_id)
      map.set(link.product_id, list)
    })
    return map
  }, [productOccasions])

  const defaultForms = useMemo(() => {
    const map: Record<string, ProductFormState> = {}
    products.forEach((product) => {
      map[product.id] = {
        name_mk: product.name_mk,
        name_en: product.name_en || '',
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
        occasion_ids: productOccasionMap.get(product.id) ?? [],
      }
    })
    return map
  }, [products, productOccasionMap])

  const [forms, setForms] = useState<Record<string, ProductFormState>>(defaultForms)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
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
    occasion_ids: [],
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

  const handleFormChange = (productId: string, field: keyof ProductFormState, value: ProductFormState[keyof ProductFormState]) => {
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

  const resetForm = (productId: string) => {
    setForms((prev) => ({
      ...prev,
      [productId]: defaultForms[productId],
    }))
    setEditingId(null)
  }

  const handleSave = async (productId: string) => {
    const form = forms[productId]
    if (!form) return

    if (!form.category_id) {
      alert('Select a category for this product.')
      return
    }

    if (!form.name_mk.trim()) {
      alert('Provide a Macedonian name.')
      return
    }

    setSavingId(productId)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name_mk,
          name_mk: form.name_mk,
          name_en: form.name_en.trim() || null,
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

      const occasionIds = Array.from(new Set(form.occasion_ids))
      const { error: deleteError } = await supabase
        .from('product_occasions')
        .delete()
        .eq('product_id', productId)

      if (deleteError) throw new Error(deleteError.message)

      if (occasionIds.length > 0) {
        const { error: insertError } = await supabase
          .from('product_occasions')
          .insert(occasionIds.map((occasionId) => ({
            product_id: productId,
            occasion_id: occasionId,
          })) as never)

        if (insertError) throw new Error(insertError.message)
      }

      setEditingId(null)
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
    if (!newProduct.name_mk.trim()) {
      alert('Provide a Macedonian name.')
      return
    }
    if (!newProduct.image_url.trim()) {
      alert('Upload or paste an image URL for the product.')
      return
    }

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name_mk,
          name_mk: newProduct.name_mk,
          name_en: newProduct.name_en.trim() || null,
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
        .select('id')
        .single()

      if (error) throw new Error(error.message)

      const createdId = data?.id
      if (createdId) {
        const occasionIds = Array.from(new Set(newProduct.occasion_ids))
        if (occasionIds.length > 0) {
          const { error: linkError } = await supabase
            .from('product_occasions')
            .insert(occasionIds.map((occasionId) => ({
              product_id: createdId,
              occasion_id: occasionId,
            })) as never)

          if (linkError) throw new Error(linkError.message)
        }
      }

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
        occasion_ids: [],
      })
      setShowCreateForm(false)
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

  const handleToggleVisibility = async (productId: string) => {
    const form = forms[productId]
    if (!form) return

    const newVisibility = !form.is_visible

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: newVisibility } as never)
        .eq('id', productId)

      if (error) throw new Error(error.message)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update visibility.')
    }
  }

  const statusOptions: ProductStatus[] = ['draft', 'published', 'sold']

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-neutral-800">New Product</h2>

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

          <div className="grid gap-4 md:grid-cols-3">
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
                    {category.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price (ден)</label>
              <input
                type="number"
                step="1"
                className="input"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Sale Price (ден)</label>
              <input
                type="number"
                step="1"
                className="input"
                value={newProduct.sale_price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, sale_price: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Occasions</label>
            <div className="grid gap-2 max-h-40 overflow-auto rounded-lg border border-neutral-200 bg-white p-3">
              {occasions.length === 0 && (
                <p className="text-xs text-neutral-500">No occasions yet.</p>
              )}
              {occasions.map((occasion) => {
                const checked = newProduct.occasion_ids.includes(occasion.id)
                return (
                  <label key={occasion.id} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={checked}
                      onChange={(e) => {
                        setNewProduct((prev) => ({
                          ...prev,
                          occasion_ids: e.target.checked
                            ? [...prev.occasion_ids, occasion.id]
                            : prev.occasion_ids.filter((id) => id !== occasion.id),
                        }))
                      }}
                    />
                    <span>{occasion.name_en}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-start">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex-shrink-0">
              {newProduct.image_url ? (
                <img src={newProduct.image_url} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">No image</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className={`btn btn-secondary cursor-pointer text-sm ${uploadingImageId === 'new' ? 'pointer-events-none opacity-60' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { void handleImageSelect(null, e.target.files); e.target.value = '' }}
                />
                {uploadingImageId === 'new' ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product, index) => {
          const form = forms[product.id]
          if (!form) return null
          const isEditing = editingId === product.id
          const category = categoryLookup.get(form.category_id)

          return (
            <div key={product.id} className="rounded-xl bg-white shadow-card overflow-hidden">
              {/* Collapsed View */}
              <div className="flex items-center gap-4 p-4">
                {/* Image */}
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex-shrink-0">
                  {form.image_url ? (
                    <img src={form.image_url} alt={product.name_en || product.name_mk} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">?</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 truncate">{product.name_en}</h3>
                    {form.price && (
                      <>
                        <span className="text-neutral-400">•</span>
                        <span className="text-primary-600 font-medium">{form.price} ден</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{category?.name_en || 'No category'}</p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {form.is_best_seller && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Best</span>
                  )}
                  {form.is_on_sale && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Sale</span>
                  )}
                  <button
                    onClick={() => handleToggleVisibility(product.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                      form.is_visible
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {form.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(product.id, 'up')}
                      disabled={index === 0 || movingId === product.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(product.id, 'down')}
                      disabled={index === products.length - 1 || movingId === product.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingId(isEditing ? null : product.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isEditing
                        ? 'bg-neutral-200 text-neutral-700'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {isEditing ? 'Close' : 'Edit'}
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isEditing && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50 space-y-4">
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
                        <option value="">Select</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Price (ден)</label>
                      <input
                        type="number"
                        step="1"
                        className="input"
                        value={form.price}
                        onChange={(e) => handleFormChange(product.id, 'price', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Sale Price (ден)</label>
                      <input
                        type="number"
                        step="1"
                        className="input"
                        value={form.sale_price}
                        onChange={(e) => handleFormChange(product.id, 'sale_price', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select
                        className="input"
                        value={form.status}
                        onChange={(e) => handleFormChange(product.id, 'status', e.target.value as ProductStatus)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Occasions</label>
                    <div className="grid gap-2 max-h-40 overflow-auto rounded-lg border border-neutral-200 bg-white p-3">
                      {occasions.length === 0 && (
                        <p className="text-xs text-neutral-500">No occasions yet.</p>
                      )}
                      {occasions.map((occasion) => {
                        const checked = form.occasion_ids.includes(occasion.id)
                        return (
                          <label key={occasion.id} className="flex items-center gap-2 text-sm text-neutral-700">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={checked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...form.occasion_ids, occasion.id]
                                  : form.occasion_ids.filter((id) => id !== occasion.id)
                                handleFormChange(product.id, 'occasion_ids', nextIds)
                              }}
                            />
                            <span>{occasion.name_en}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={form.is_on_sale}
                        onChange={(e) => handleFormChange(product.id, 'is_on_sale', e.target.checked)}
                      />
                      On Sale
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={form.is_best_seller}
                        onChange={(e) => handleFormChange(product.id, 'is_best_seller', e.target.checked)}
                      />
                      Best Seller
                    </label>
                  </div>

                  <div>
                    <label className="label">Image</label>
                    <div className="flex gap-2">
                      <label className={`btn btn-secondary cursor-pointer text-sm ${uploadingImageId === product.id ? 'pointer-events-none opacity-60' : ''}`}>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { void handleImageSelect(product.id, e.target.files); e.target.value = '' }}
                        />
                        {uploadingImageId === product.id ? 'Uploading...' : 'Upload'}
                      </label>
                      {form.image_url && (
                        <button
                          type="button"
                          className="btn btn-outline text-sm"
                          onClick={() => handleFormChange(product.id, 'image_url', '')}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Description (MK)</label>
                      <textarea
                        className="textarea"
                        rows={2}
                        value={form.description_mk ?? ''}
                        onChange={(e) => handleFormChange(product.id, 'description_mk', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Description (EN)</label>
                      <textarea
                        className="textarea"
                        rows={2}
                        value={form.description_en ?? ''}
                        onChange={(e) => handleFormChange(product.id, 'description_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(product.id)}
                      disabled={savingId === product.id}
                    >
                      {savingId === product.id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetForm(product.id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger ml-auto"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {products.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            No products yet. Click "+ Add Product" to create your first one.
          </div>
        )}
      </div>
    </div>
  )
}
