const fs = require('fs');
const file = 'src/pages/produk/[slug].astro';
let content = fs.readFileSync(file, 'utf8');

// Replace the main tag and everything inside it
const newMain = `
  <main class="mx-auto max-w-6xl bg-[#F5F5F5] pb-20 pt-4 px-0 md:px-4 lg:px-8">
    <div class="mb-4 hidden md:block">
      <Breadcrumb
        items={[
          { label: 'Katalog', href: '/produk' },
          { label: product.category, href: '/produk' },
          { label: product.productName },
        ]}
      />
    </div>

    <!-- Top White Box: Image (Left) + Details (Right) -->
    <div class="bg-white md:rounded-lg md:shadow-sm md:ring-1 md:ring-slate-100 overflow-hidden mb-4">
      <div class="md:hidden bg-white px-4 py-2 border-b border-[#E5E5E5]">
        <Breadcrumb
          items={[
            { label: 'Katalog', href: '/produk' },
            { label: product.category, href: '/produk' },
            { label: product.productName },
          ]}
        />
      </div>

      <div class="flex flex-col md:flex-row">
        <!-- Left Column: Gallery -->
        <div class="w-full md:w-[45%] lg:w-[40%] shrink-0 border-b md:border-b-0 md:border-r border-[#E5E5E5] p-0 md:p-6">
          <ProductImageSlider
            client:load
            images={productImages}
            productName={product.productName}
            badgeText={product.tag}
            discountPercentage={displayDiscount}
          />
        </div>

        <!-- Right Column: Details & Form -->
        <div class="w-full md:w-[55%] lg:w-[60%] flex flex-col p-5 md:p-6 lg:p-8">
          <div class="flex items-center justify-between gap-3">
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#EE4D2D]">
              {product.category}
            </span>
            {
              displayDiscount > 0 && (
                <span class="rounded bg-[#FEEA2E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EE4D2D]">
                  Hemat {displayDiscount}%
                </span>
              )
            }
          </div>

          <h1 class="mt-2 text-xl md:text-2xl font-semibold leading-[1.35] tracking-[-0.025em] text-[#222222]">
            {product.productName}
          </h1>
          
          <!-- Rating & Sold Claims -->
          <div class="mt-3 flex items-center gap-3 text-[12px] text-[#757575]">
            {
              hasAggregateRating && (
                <>
                  <div class="flex items-center gap-1.5">
                    <RatingStars
                      rating={ratingValue}
                      starClass="h-[13px] w-[13px]"
                      label={\`Rating produk \${formattedRating} dari 5 bintang\`}
                    />
                    <span class="font-semibold text-[#222222]">{formattedRating}</span>
                  </div>
                  <span>{reviewCount} penilaian</span>
                </>
              )
            }
            {hasAggregateRating && hasSoldCount && <span class="h-3 w-px bg-[#E5E5E5]" />}
            {hasSoldCount && <span class="font-medium text-[#222222]">{soldLabel}</span>}
          </div>

          <!-- Pricing Display -->
          <div class="mt-4 flex items-baseline gap-3 border-t border-[#E5E5E5] pt-4">
            <span class="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[#EE4D2D]">
              Rp{Math.round(displayPrice).toLocaleString('id-ID')}
            </span>
            {
              displayComparePrice > displayPrice && (
                <span class="text-[14px] font-medium text-[#757575] line-through">
                  Rp{Math.round(displayComparePrice).toLocaleString('id-ID')}
                </span>
              )
            }
          </div>

          <p class="mt-4 text-[13px] leading-relaxed text-[#555555]">
            {product.subheadline || product.description}
          </p>

          <!-- Direct Order Form Container -->
          <section id="form-pemesanan" class="mt-6 scroll-mt-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <GeoIpResolvedForm mode={formContext.mode} province={formContext.province} productSlug={product.slug} embedded={true} />
          </section>

          <!-- Shipping Information Notice Card -->
          <div class="mt-4 flex items-start gap-3.5 text-[12px] leading-relaxed text-[#555555] bg-white p-3 border border-slate-100 rounded-lg">
            <Icon name="lucide:truck" class="mt-0.5 h-5 w-5 shrink-0" style={\`color: \${productAccent}\`} aria-hidden="true" />
            <div>
              <p class="font-bold uppercase tracking-wider text-[#222222]">Informasi Pengiriman</p>
              <p class="mt-1 leading-5 text-[#555555]">Biaya pengiriman dihitung otomatis di halaman checkout setelah alamat pengiriman dilengkapi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
      <!-- Left Column on Desktop (Specs & Reviews) -->
      <div class="md:col-span-7 lg:col-span-8 flex flex-col gap-4">
        <!-- Detailed Specifications -->
        <section class="bg-white md:rounded-lg md:shadow-sm md:ring-1 md:ring-slate-100 p-5 md:p-8">
          <h2 class="border-b border-[#E5E5E5] pb-4 text-[14px] font-bold uppercase tracking-[0.12em] text-[#222222]">Informasi Produk</h2>
          <div class="mt-6 grid gap-6 text-[14px] leading-relaxed text-[#555555]">
            <p>{product.description}</p>

            <div class="grid gap-4 border-b border-[#E5E5E5] pb-6">
              <div class="flex items-start gap-3">
                <Icon
                  name="lucide:pencil"
                  class="mt-0.5 h-5 w-5 shrink-0"
                  style={\`color: \${productAccent}\`}
                  aria-hidden="true"
                />
                <div>
                  <p class="font-semibold text-[#222222]">Kategori</p>
                  <p>{product.category}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Icon
                  name="lucide:package"
                  class="mt-0.5 h-5 w-5 shrink-0"
                  style={\`color: \${productAccent}\`}
                  aria-hidden="true"
                />
                <div>
                  <p class="font-semibold text-[#222222]">Fokus Produk</p>
                  <p>{product.tag}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Icon
                  name="lucide:sliders-horizontal"
                  class="mt-0.5 h-5 w-5 shrink-0"
                  style={\`color: \${productAccent}\`}
                  aria-hidden="true"
                />
                <div>
                  <p class="font-semibold text-[#222222]">Ketersediaan</p>
                  <p>Stok tersedia untuk seluruh varian yang ditampilkan.</p>
                </div>
              </div>
            </div>

            {product.benefits && product.benefits.length > 0 && (
              <div class="grid gap-4 border-b border-[#E5E5E5] pb-6">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:check" class="h-5 w-5" style={\`color: \${productAccent}\`} aria-hidden="true" />
                  <h3 class="text-[14px] font-bold uppercase tracking-[0.08em] text-[#222222]">Manfaat Utama</h3>
                </div>
                <div class="space-y-3">
                  {
                    product.benefits.map((b) => (
                      <div class="grid grid-cols-[8px_1fr] gap-3">
                        <span
                          class="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#EE4D2D]"
                          aria-hidden="true"
                        />
                        <span class="min-w-0">{b}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {product.keyPoints && product.keyPoints.length > 0 && (
              <div class="grid gap-4 border-b border-[#E5E5E5] pb-6">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:plus" class="h-5 w-5" style={\`color: \${productAccent}\`} aria-hidden="true" />
                  <h3 class="text-[14px] font-bold uppercase tracking-[0.08em] text-[#222222]">Poin Penting Produk</h3>
                </div>
                <div class="space-y-3">
                  {
                    product.keyPoints.map((point) => (
                      <div class="grid grid-cols-[8px_1fr] gap-3">
                        <span
                          class="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#EE4D2D]"
                          aria-hidden="true"
                        />
                        <span class="min-w-0">{point}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {product.idealFor && product.idealFor.length > 0 && (
              <div>
                <div class="mb-4 flex items-center gap-2">
                  <Icon
                    name="lucide:download"
                    class="h-5 w-5"
                    style={\`color: \${productAccent}\`}
                    aria-hidden="true"
                  />
                  <h3 class="text-[14px] font-bold uppercase tracking-[0.08em] text-[#222222]">Ideal Untuk</h3>
                </div>
                <div class="flex flex-wrap gap-x-3 gap-y-2">
                  {
                    product.idealFor.map((item) => (
                      <span class="inline-flex items-center gap-2 text-[13px] font-medium text-[#555555] bg-slate-50 px-3 py-1.5 rounded-full ring-1 ring-slate-200">
                        <span>{item}</span>
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </section>

        <!-- Product Reviews -->
        {
          (hasAggregateRating || product.reviews.length > 0) && (
            <section class="bg-white md:rounded-lg md:shadow-sm md:ring-1 md:ring-slate-100 p-5 md:p-8">
              <div class="border-b border-[#E5E5E5] pb-4">
                <div class="flex items-center gap-2">
                  <RatingStars max={1} starClass="h-5 w-5" label="Penilaian produk" />
                  <h2 class="text-[14px] font-bold uppercase tracking-[0.12em] text-[#222222]">Ulasan Produk</h2>
                </div>

                {hasAggregateRating && (
                  <div class="mt-3 flex items-center gap-2 border-t border-[#E5E5E5] pt-3 text-[14px] font-bold text-[#222222]">
                    <span class="text-[#EE4D2D] text-lg">★ {formattedRating} / 5.0</span>
                    <span class="text-[#757575] font-medium">• {reviewCount} ulasan</span>
                  </div>
                )}
              </div>

              {product.reviews.length > 0 && (
                <div class="mt-6 space-y-6">
                  {product.reviews.map((review) => (
                    <div class="border-b border-[#E5E5E5] pb-6 last:border-0 last:pb-0">
                      <div class="flex items-center gap-3 mb-3">
                        <div 
                          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[14px] font-black uppercase text-slate-500"
                        >
                          {review.name.charAt(0)}
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-2">
                            <p class="text-[14px] font-bold text-[#222222]">{review.name}</p>
                            {review.verified && (
                              <span class="inline-flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700">
                                Terverifikasi
                              </span>
                            )}
                          </div>
                          <p class="mt-0.5 flex items-center gap-2 text-[12px] text-[#757575]"><span>{review.location}</span><span class="h-3 w-px bg-[#E5E5E5]" aria-hidden="true" /><span>{review.date}</span></p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} starClass="h-3.5 w-3.5" />
                      <p class="mt-3 text-[14px] leading-relaxed text-[#555555]">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        }
      </div>

      <!-- Right Column on Desktop (Variants & Form) -->
      <div class="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
        <!-- Variant Offer Matrix -->
        <section class="bg-white md:rounded-lg md:shadow-sm md:ring-1 md:ring-slate-100 p-5 md:p-6 sticky top-[80px]">
          <h2 class="text-[14px] font-bold uppercase tracking-[0.12em] text-[#222222] border-b border-[#E5E5E5] pb-4">
            Pilihan Varian ({product.variants.length})
          </h2>
          <div class="divide-y divide-[#E5E5E5]">
            {
              product.variants.map((v) => (
                <div class="flex items-center justify-between gap-4 py-4">
                  <div class="min-w-0 flex-1">
                    <p class="text-[14px] font-bold text-[#222222] leading-tight">{v.label}</p>
                    <p class="mt-1 text-[11px] font-medium text-emerald-600">Stok Siap Kirim</p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-[15px] font-black text-[#EE4D2D]">
                      Rp{Math.round(v.price).toLocaleString('id-ID')}
                    </p>
                    {v.comparePrice && (
                      <p class="mt-0.5 text-[11px] font-medium text-[#757575] line-through">
                        Rp{Math.round(v.comparePrice).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
          
          <a
            href="#form-pemesanan"
            class="mt-4 flex w-full min-h-[44px] items-center justify-center rounded-md bg-[#EE4D2D] px-6 text-[12px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-[#D73D22] focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:ring-offset-2 active:scale-95 transition-all"
          >
            Pesan Sekarang
          </a>
        </section>
      </div>
    </div>

    <!-- Sticky Mobile Purchase Bar (Auto-hides when order form is visible) -->
    <div id="sticky-purchase-bar" class="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full items-center justify-between border-t border-[#E5E5E5] bg-[#FFFFFF]/95 px-5 py-3 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur-md transition-all duration-300 md:hidden">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Harga Promo</p>
        <p class="text-lg font-black text-[#EE4D2D]">Rp{Math.round(displayPrice).toLocaleString('id-ID')}</p>
      </div>
      <a
        href="#form-pemesanan"
        class="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#EE4D2D] px-6 text-[12px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-[#D73D22] active:scale-95 transition-all"
      >
        Pesan Sekarang
      </a>
    </div>
  </main>
`;

content = content.replace(/<main class="mx-auto max-w-\[480px\] bg-\[#F5F5F5\] pb-20">[\s\S]*?<\/main>/, newMain);

fs.writeFileSync(file, content);
console.log('Successfully updated the main layout.');
