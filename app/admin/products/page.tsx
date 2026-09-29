"use client";

import "./products.css";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  description: string | null;
  status: string;
  created_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
};

type ProductSize = {
  size: string;
  stock: number;
  selected: boolean;
};

type ExistingSize = {
  size: string;
  stock: number;
};

const DEFAULT_SIZES: ProductSize[] = [
  {
    size: "S",
    stock: 0,
    selected: false,
  },
  {
    size: "M",
    stock: 0,
    selected: false,
  },
  {
    size: "L",
    stock: 0,
    selected: false,
  },
  {
    size: "XL",
    stock: 0,
    selected: false,
  },
];

const CART_KEY = "stoked-cart";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  /*
   * ADD PRODUCT FORM
   */

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("AVAILABLE");

  const [mainImage, setMainImage] =
    useState<File | null>(null);

  const [moreImages, setMoreImages] =
    useState<File[]>([]);

  const [mainPreview, setMainPreview] =
    useState("");

  const [morePreviews, setMorePreviews] =
    useState<string[]>([]);

  const [sizes, setSizes] =
    useState<ProductSize[]>(
      DEFAULT_SIZES
    );

  const [sizeChartImage, setSizeChartImage] =
    useState<File | null>(null);

  const [sizeChartPreview, setSizeChartPreview] =
    useState("");

  /*
   * GENERAL STATES
   */

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /*
   * EDIT PRODUCT
   */

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editSlug, setEditSlug] =
    useState("");

  const [editCategoryId, setEditCategoryId] =
    useState("");

  const [editPrice, setEditPrice] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editStatus, setEditStatus] =
    useState("AVAILABLE");

  const [editSizes, setEditSizes] =
    useState<ProductSize[]>(
      DEFAULT_SIZES.map((item) => ({
        ...item,
      }))
    );

  const [editMainImage, setEditMainImage] =
    useState<File | null>(null);

  const [editMainPreview, setEditMainPreview] =
    useState("");

  const [editMoreImages, setEditMoreImages] =
    useState<File[]>([]);

  const [editMorePreviews, setEditMorePreviews] =
    useState<string[]>([]);

  const [editSizeChartImage, setEditSizeChartImage] =
    useState<File | null>(null);

  const [editSizeChartPreview, setEditSizeChartPreview] =
    useState("");

  const [editSaving, setEditSaving] =
    useState(false);

  /*
   * LOAD
   */

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        category_id,
        price,
        description,
        status,
        created_at,
        categories (
          id,
          name,
          slug
        ),
        product_images (
          id,
          product_id,
          image_url,
          sort_order
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "PRODUCT LOAD ERROR:",
        error
      );

      setMessage(
        "FAILED TO LOAD PRODUCTS."
      );

      setLoading(false);
      return;
    }

    const formattedProducts =
      (data || []).map(
        (product: any) => ({
          ...product,

          category:
            Array.isArray(
              product.categories
            )
              ? product.categories[0] ||
                null
              : product.categories ||
                null,

          product_images:
            product.product_images ||
            [],
        })
      );

    setProducts(
      formattedProducts
    );

    setLoading(false);
  }

  async function loadCategories() {
    const { data, error } =
      await supabase
        .from("categories")
        .select(
          "id, name, slug"
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );

    if (error) {
      console.error(
        "CATEGORY LOAD ERROR:",
        error
      );

      return;
    }

    setCategories(
      data || []
    );
  }

  /*
   * SLUG
   */

  function generateSlug(
    value: string
  ) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );
  }

  function handleNameChange(
    value: string
  ) {
    setName(value);

    if (
      !slug ||
      slug ===
        generateSlug(name)
    ) {
      setSlug(
        generateSlug(value)
      );
    }
  }

  /*
   * MAIN IMAGE
   */

  function handleMainImage(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "MAIN IMAGE MUST BE AN IMAGE FILE."
      );

      return;
    }

    setMainImage(file);

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setMainPreview(
      previewUrl
    );
  }

  function removeMainImage() {
    setMainImage(null);
    setMainPreview("");
  }

  /*
   * MORE IMAGES
   */

  function handleMoreImages(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        e.target.files || []
      );

    if (
      files.length === 0
    )
      return;

    const invalidFile =
      files.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          )
      );

    if (invalidFile) {
      setMessage(
        "ALL ADDITIONAL FILES MUST BE IMAGES."
      );

      return;
    }

    setMoreImages(
      (prev) => [
        ...prev,
        ...files,
      ]
    );

    const newPreviews =
      files.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      );

    setMorePreviews(
      (prev) => [
        ...prev,
        ...newPreviews,
      ]
    );
  }

  /*
   * SIZE SELECTION
   */

  function toggleSize(
    index: number
  ) {
    setSizes(
      (prev) =>
        prev.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  selected:
                    !item.selected,
                }
              : item
        )
    );
  }

  function updateSizeStock(
    index: number,
    value: string
  ) {
    const stock =
      Number(value) >= 0
        ? Number(value)
        : 0;

    setSizes(
      (prev) =>
        prev.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  stock,
                }
              : item
        )
    );
  }

  /*
   * SIZE CHART
   */

  function handleSizeChartImage(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "SIZE CHART MUST BE AN IMAGE FILE."
      );

      return;
    }

    setSizeChartImage(
      file
    );

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setSizeChartPreview(
      previewUrl
    );
  }

  function removeSizeChart() {
    setSizeChartImage(null);
    setSizeChartPreview("");
  }

  /*
   * UPLOAD IMAGE
   */

  async function uploadImage(
    file: File,
    productId: string,
    sortOrder: number
  ) {
    const extension =
      file.name.split(".").pop() ||
      "jpg";

    const safeName =
      file.name
        .replace(
          /[^a-zA-Z0-9.-]/g,
          "-"
        )
        .toLowerCase();

    const filePath =
      `${productId}/${sortOrder}-${Date.now()}-${safeName}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from(
          "product-images"
        )
        .upload(
          filePath,
          file,
          {
            cacheControl:
              "3600",
            upsert:
              false,
            contentType:
              file.type ||
              `image/${extension}`,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data:
        publicUrlData,
    } =
      supabase.storage
        .from(
          "product-images"
        )
        .getPublicUrl(
          filePath
        );

    const imageUrl =
      publicUrlData.publicUrl;

    const {
      error:
        imageDbError,
    } =
      await supabase
        .from(
          "product_images"
        )
        .insert({
          product_id:
            productId,
          image_url:
            imageUrl,
          sort_order:
            sortOrder,
        });

    if (imageDbError) {
      await supabase.storage
        .from(
          "product-images"
        )
        .remove([
          filePath,
        ]);

      throw imageDbError;
    }

    return imageUrl;
  }

  /*
   * UPLOAD SIZE CHART
   */

  async function uploadSizeChart(
    file: File,
    productId: string
  ) {
    const extension =
      file.name.split(".").pop() ||
      "jpg";

    const safeName =
      file.name
        .replace(
          /[^a-zA-Z0-9.-]/g,
          "-"
        )
        .toLowerCase();

    const filePath =
      `${productId}/size-chart-${Date.now()}-${safeName}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from(
          "product-images"
        )
        .upload(
          filePath,
          file,
          {
            cacheControl:
              "3600",
            upsert:
              false,
            contentType:
              file.type ||
              `image/${extension}`,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data:
        publicUrlData,
    } =
      supabase.storage
        .from(
          "product-images"
        )
        .getPublicUrl(
          filePath
        );

    const imageUrl =
      publicUrlData.publicUrl;

    const {
      error:
        chartDbError,
    } =
      await supabase
        .from(
          "size_charts"
        )
        .insert({
          product_id:
            productId,
          size: "IMAGE",
          chest: "",
          image_url:
            imageUrl,
        });

    if (chartDbError) {
      await supabase.storage
        .from(
          "product-images"
        )
        .remove([
          filePath,
        ]);

      throw chartDbError;
    }

    return imageUrl;
  }

  /*
   * ADD PRODUCT
   */

  async function addProduct(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (adding) return;

    setMessage("");

    if (!name.trim()) {
      setMessage(
        "PRODUCT NAME IS REQUIRED."
      );

      return;
    }

    if (!slug.trim()) {
      setMessage(
        "PRODUCT SLUG IS REQUIRED."
      );

      return;
    }

    if (!categoryId) {
      setMessage(
        "PLEASE SELECT A COLLECTION."
      );

      return;
    }

    if (
      !price ||
      Number(price) <= 0
    ) {
      setMessage(
        "PLEASE ENTER A VALID PRICE."
      );

      return;
    }

    if (!mainImage) {
      setMessage(
        "MAIN IMAGE IS REQUIRED."
      );

      return;
    }

    const selectedSizes =
      sizes.filter(
        (item) =>
          item.selected
      );

    if (
      selectedSizes.length ===
      0
    ) {
      setMessage(
        "PLEASE SELECT AT LEAST ONE SIZE."
      );

      return;
    }

    setAdding(true);

    try {
      /*
       * CREATE PRODUCT
       */

      const {
        data: product,
        error:
          productError,
      } =
        await supabase
          .from("products")
          .insert({
            name:
              name.trim(),
            slug:
              slug.trim(),
            category_id:
              categoryId,
            price:
              Number(price),
            description:
              description.trim() ||
              null,
            status,
          })
          .select()
          .single();

      if (productError) {
        throw productError;
      }

      /*
       * MAIN IMAGE
       */

      await uploadImage(
        mainImage,
        product.id,
        0
      );

      /*
       * MORE IMAGES
       */

      for (
        let i = 0;
        i <
        moreImages.length;
        i++
      ) {
        await uploadImage(
          moreImages[i],
          product.id,
          i + 1
        );
      }

      /*
       * SIZES
       */

      const sizeRows =
        selectedSizes.map(
          (item) => ({
            product_id:
              product.id,
            size:
              item.size,
            stock:
              item.stock,
          })
        );

      const {
        error:
          sizeError,
      } =
        await supabase
          .from(
            "product_sizes"
          )
          .insert(
            sizeRows
          );

      if (sizeError) {
        throw sizeError;
      }

      /*
       * SIZE CHART
       */

      if (sizeChartImage) {
        try {
          await uploadSizeChart(
            sizeChartImage,
            product.id
          );
        } catch (error) {
          console.error(
            "SIZE CHART ERROR:",
            error
          );
        }
      }

      await loadProducts();

      /*
       * RESET
       */

      setName("");
      setSlug("");
      setCategoryId("");
      setPrice("");
      setDescription("");
      setStatus(
        "AVAILABLE"
      );

      setMainImage(null);
      setMoreImages([]);

      setMainPreview("");
      setMorePreviews([]);

      setSizes(
        DEFAULT_SIZES.map(
          (item) => ({
            ...item,
          })
        )
      );

      setSizeChartImage(
        null
      );

      setSizeChartPreview(
        ""
      );

      setMessage(
        "PRODUCT ADDED SUCCESSFULLY."
      );
    } catch (error: any) {
      console.error(
        "PRODUCT ADD ERROR:",
        error
      );

      setMessage(
        (
          error?.message ||
          "SOMETHING WENT WRONG."
        ).toUpperCase()
      );
    }

    setAdding(false);
  }

  /*
   * OPEN EDIT
   */

  async function openEditProduct(
    product: Product
  ) {
    setMessage("");

    setEditingProduct(
      product
    );

    setEditName(
      product.name
    );

    setEditSlug(
      product.slug
    );

    setEditCategoryId(
      product.category_id
    );

    setEditPrice(
      String(product.price)
    );

    setEditDescription(
      product.description ||
        ""
    );

    setEditStatus(
      product.status
    );

    setEditMainImage(
      null
    );

    setEditMoreImages(
      []
    );

    setEditMorePreviews(
      []
    );

    setEditSizeChartImage(
      null
    );

    /*
     * MAIN IMAGE
     */

    const productImages =
      product.product_images ||
      [];

    const sortedImages =
      [...productImages].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );

    setEditMainPreview(
      sortedImages[0]
        ?.image_url || ""
    );

    /*
     * LOAD SIZES
     */

    const {
      data: sizeData,
      error: sizeError,
    } =
      await supabase
        .from(
          "product_sizes"
        )
        .select(
          "size, stock"
        )
        .eq(
          "product_id",
          product.id
        );

    if (sizeError) {
      console.error(
        "EDIT SIZE LOAD ERROR:",
        sizeError
      );
    }

    const existingSizes =
      (sizeData ||
        []) as ExistingSize[];

    setEditSizes(
      DEFAULT_SIZES.map(
        (defaultSize) => {
          const found =
            existingSizes.find(
              (item) =>
                item.size ===
                defaultSize.size
            );

          return {
            size:
              defaultSize.size,
            stock:
              found?.stock ||
              0,
            selected:
              Boolean(found),
          };
        }
      )
    );

    /*
     * LOAD SIZE CHART
     */

    const {
      data:
        sizeChartData,
      error:
        sizeChartError,
    } =
      await supabase
        .from(
          "size_charts"
        )
        .select(
          "image_url"
        )
        .eq(
          "product_id",
          product.id
        )
        .limit(1);

    if (sizeChartError) {
      console.error(
        "EDIT SIZE CHART LOAD ERROR:",
        sizeChartError
      );
    }

    setEditSizeChartPreview(
      sizeChartData?.[0]
        ?.image_url || ""
    );

    /*
     * SCROLL TO EDITOR
     */

    setTimeout(() => {
      document
        .getElementById(
          "edit-product-section"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block: "start",
        });
    }, 100);
  }

  /*
   * EDIT MAIN IMAGE
   */

  function handleEditMainImage(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "MAIN IMAGE MUST BE AN IMAGE FILE."
      );

      return;
    }

    setEditMainImage(
      file
    );

    setEditMainPreview(
      URL.createObjectURL(
        file
      )
    );
  }

  /*
   * EDIT MORE IMAGES
   */

  function handleEditMoreImages(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        e.target.files || []
      );

    if (
      files.length ===
      0
    )
      return;

    const invalid =
      files.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          )
      );

    if (invalid) {
      setMessage(
        "ALL ADDITIONAL FILES MUST BE IMAGES."
      );

      return;
    }

    setEditMoreImages(
      (prev) => [
        ...prev,
        ...files,
      ]
    );

    setEditMorePreviews(
      (prev) => [
        ...prev,
        ...files.map(
          (file) =>
            URL.createObjectURL(
              file
            )
        ),
      ]
    );
  }

  /*
   * EDIT SIZE CHART
   */

  function handleEditSizeChart(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "SIZE CHART MUST BE AN IMAGE FILE."
      );

      return;
    }

    setEditSizeChartImage(
      file
    );

    setEditSizeChartPreview(
      URL.createObjectURL(
        file
      )
    );
  }

  /*
   * EDIT SIZE TOGGLE
   */

  function toggleEditSize(
    index: number
  ) {
    setEditSizes(
      (prev) =>
        prev.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  selected:
                    !item.selected,
                }
              : item
        )
    );
  }

  /*
   * EDIT STOCK
   */

  function updateEditSizeStock(
    index: number,
    value: string
  ) {
    const stock =
      Number(value) >= 0
        ? Number(value)
        : 0;

    setEditSizes(
      (prev) =>
        prev.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  stock,
                }
              : item
        )
    );
  }

  /*
   * SAVE EDIT
   */

  async function saveProductEdit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !editingProduct ||
      editSaving
    )
      return;

    setMessage("");

    if (!editName.trim()) {
      setMessage(
        "PRODUCT NAME IS REQUIRED."
      );

      return;
    }

    if (!editSlug.trim()) {
      setMessage(
        "PRODUCT SLUG IS REQUIRED."
      );

      return;
    }

    if (!editCategoryId) {
      setMessage(
        "PLEASE SELECT A COLLECTION."
      );

      return;
    }

    if (
      !editPrice ||
      Number(editPrice) <= 0
    ) {
      setMessage(
        "PLEASE ENTER A VALID PRICE."
      );

      return;
    }

    const selectedEditSizes =
      editSizes.filter(
        (item) =>
          item.selected
      );

    if (
      selectedEditSizes.length ===
      0
    ) {
      setMessage(
        "PLEASE SELECT AT LEAST ONE SIZE."
      );

      return;
    }

    setEditSaving(true);

    try {
      /*
       * UPDATE PRODUCT
       */

      const {
        error:
          productUpdateError,
      } =
        await supabase
          .from("products")
          .update({
            name:
              editName.trim(),
            slug:
              editSlug.trim(),
            category_id:
              editCategoryId,
            price:
              Number(
                editPrice
              ),
            description:
              editDescription.trim() ||
              null,
            status:
              editStatus,
          })
          .eq(
            "id",
            editingProduct.id
          );

      if (
        productUpdateError
      ) {
        throw productUpdateError;
      }

      /*
       * REPLACE MAIN IMAGE
       */

      if (editMainImage) {
        const currentImages =
          editingProduct.product_images ||
          [];

        const oldMain =
          [...currentImages]
            .sort(
              (a, b) =>
                a.sort_order -
                b.sort_order
            )[0];

        if (oldMain) {
          try {
            const url =
              new URL(
                oldMain.image_url
              );

            const marker =
              "/storage/v1/object/public/product-images/";

            const index =
              url.pathname.indexOf(
                marker
              );

            if (
              index !==
              -1
            ) {
              const oldPath =
                decodeURIComponent(
                  url.pathname.substring(
                    index +
                      marker.length
                  )
                );

              await supabase.storage
                .from(
                  "product-images"
                )
                .remove([
                  oldPath,
                ]);
            }
          } catch {
            console.log(
              "OLD MAIN IMAGE REMOVE SKIPPED"
            );
          }

          await supabase
            .from(
              "product_images"
            )
            .delete()
            .eq(
              "id",
              oldMain.id
            );
        }

        await uploadImage(
          editMainImage,
          editingProduct.id,
          0
        );
      }

      /*
       * ADD NEW MORE IMAGES
       */

      const currentImages =
        editingProduct.product_images ||
        [];

      let nextSortOrder =
        currentImages.length;

      if (editMoreImages.length) {
        for (
          let i = 0;
          i <
          editMoreImages.length;
          i++
        ) {
          await uploadImage(
            editMoreImages[i],
            editingProduct.id,
            nextSortOrder
          );

          nextSortOrder++;
        }
      }

      /*
       * UPDATE SIZES
       */

      await supabase
        .from(
          "product_sizes"
        )
        .delete()
        .eq(
          "product_id",
          editingProduct.id
        );

      const editSizeRows =
        selectedEditSizes.map(
          (item) => ({
            product_id:
              editingProduct.id,
            size:
              item.size,
            stock:
              item.stock,
          })
        );

      const {
        error:
          editSizeError,
      } =
        await supabase
          .from(
            "product_sizes"
          )
          .insert(
            editSizeRows
          );

      if (editSizeError) {
        throw editSizeError;
      }

      /*
       * REPLACE SIZE CHART
       */

      if (
        editSizeChartImage
      ) {
        const {
          data:
            oldChartData,
        } =
          await supabase
            .from(
              "size_charts"
            )
            .select(
              "id, image_url"
            )
            .eq(
              "product_id",
              editingProduct.id
            );

        if (
          oldChartData &&
          oldChartData.length >
            0
        ) {
          const oldPaths =
            oldChartData
              .map(
                (chart) => {
                  try {
                    const url =
                      new URL(
                        chart.image_url
                      );

                    const marker =
                      "/storage/v1/object/public/product-images/";

                    const index =
                      url.pathname.indexOf(
                        marker
                      );

                    if (
                      index ===
                      -1
                    ) {
                      return null;
                    }

                    return decodeURIComponent(
                      url.pathname.substring(
                        index +
                          marker.length
                      )
                    );
                  } catch {
                    return null;
                  }
                }
              )
              .filter(
                (
                  path
                ): path is string =>
                  Boolean(path)
              );

          if (
            oldPaths.length
          ) {
            await supabase.storage
              .from(
                "product-images"
              )
              .remove(
                oldPaths
              );
          }

          await supabase
            .from(
              "size_charts"
            )
            .delete()
            .eq(
              "product_id",
              editingProduct.id
            );
        }

        await uploadSizeChart(
          editSizeChartImage,
          editingProduct.id
        );
      }

      /*
       * RELOAD
       */

      await loadProducts();

      /*
       * CLOSE EDITOR
       */

      setEditingProduct(
        null
      );

      setEditMainImage(
        null
      );

      setEditMainPreview(
        ""
      );

      setEditMoreImages(
        []
      );

      setEditMorePreviews(
        []
      );

      setEditSizeChartImage(
        null
      );

      setEditSizeChartPreview(
        ""
      );

      setMessage(
        "PRODUCT UPDATED SUCCESSFULLY."
      );
    } catch (error: any) {
      console.error(
        "PRODUCT UPDATE ERROR:",
        error
      );

      setMessage(
        (
          error?.message ||
          "FAILED TO UPDATE PRODUCT."
        ).toUpperCase()
      );
    }

    setEditSaving(false);
  }

  /*
   * DELETE PRODUCT
   */

  async function deleteProduct(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        "DELETE THIS PRODUCT?"
      );

    if (!confirmed)
      return;

    setMessage("");

    try {
      const images =
        product.product_images ||
        [];

      if (
        images.length >
        0
      ) {
        const filePaths =
          images
            .map(
              (image) => {
                try {
                  const url =
                    new URL(
                      image.image_url
                    );

                  const marker =
                    "/storage/v1/object/public/product-images/";

                  const index =
                    url.pathname.indexOf(
                      marker
                    );

                  if (
                    index ===
                    -1
                  ) {
                    return null;
                  }

                  return decodeURIComponent(
                    url.pathname.substring(
                      index +
                        marker.length
                    )
                  );
                } catch {
                  return null;
                }
              }
            )
            .filter(
              (
                path
              ): path is string =>
                Boolean(path)
            );

        if (
          filePaths.length >
          0
        ) {
          await supabase.storage
            .from(
              "product-images"
            )
            .remove(
              filePaths
            );
        }
      }

      const {
        error:
          sizeDeleteError,
      } =
        await supabase
          .from(
            "product_sizes"
          )
          .delete()
          .eq(
            "product_id",
            product.id
          );

      if (
        sizeDeleteError
      ) {
        throw sizeDeleteError;
      }

      const {
        error:
          chartDeleteError,
      } =
        await supabase
          .from(
            "size_charts"
          )
          .delete()
          .eq(
            "product_id",
            product.id
          );

      if (
        chartDeleteError
      ) {
        throw chartDeleteError;
      }

      const {
        error:
          imageDeleteError,
      } =
        await supabase
          .from(
            "product_images"
          )
          .delete()
          .eq(
            "product_id",
            product.id
          );

      if (
        imageDeleteError
      ) {
        throw imageDeleteError;
      }

      const {
        error:
          productDeleteError,
      } =
        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            product.id
          );

      if (
        productDeleteError
      ) {
        throw productDeleteError;
      }

      setProducts(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !==
              product.id
          )
      );

      setMessage(
        "PRODUCT DELETED."
      );
    } catch (error: any) {
      console.error(
        "PRODUCT DELETE ERROR:",
        error
      );

      setMessage(
        (
          error?.message ||
          "FAILED TO DELETE PRODUCT."
        ).toUpperCase()
      );
    }
  }

  /*
   * GET PRODUCT IMAGE
   */

  function getProductImage(
    product: Product
  ) {
    const images =
      product.product_images ||
      [];

    if (
      images.length ===
      0
    ) {
      return "";
    }

    const sortedImages =
      [...images].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );

    return (
      sortedImages[0]
        ?.image_url || ""
    );
  }

  /*
   * CANCEL EDIT
   */

  function cancelEdit() {
    setEditingProduct(
      null
    );

    setEditMainImage(
      null
    );

    setEditMainPreview(
      ""
    );

    setEditMoreImages(
      []
    );

    setEditMorePreviews(
      []
    );

    setEditSizeChartImage(
      null
    );

    setEditSizeChartPreview(
      ""
    );
  }

  return (
    <main className="products-page">

      <div className="products-grid-bg" />

      <div className="products-red-orb" />

      {/* SIDEBAR */}

      <aside className="products-sidebar">

        <div>

          <Link
            href="/admin"
            className="products-brand"
          >
            STOKED{" "}
            <span>BD</span>
          </Link>

          <div className="products-sidebar-label">
            CONTROL PANEL
          </div>

          <nav className="products-nav">

            <Link
              href="/admin"
              className="products-nav-item"
            >
              <span>01</span>
              DASHBOARD
            </Link>

            <Link
              href="/admin/categories"
              className="products-nav-item"
            >
              <span>02</span>
              CATEGORIES
            </Link>

            <Link
              href="/admin/products"
              className="products-nav-item active"
            >
              <span>03</span>
              PRODUCTS
            </Link>

            <Link
              href="/admin/orders"
              className="products-nav-item"
            >
              <span>04</span>
              ORDERS
            </Link>

          </nav>

        </div>

        <div className="products-sidebar-bottom">

          <div className="products-system-status">
            <span />
            SYSTEM ONLINE
          </div>

          <Link
            href="/admin/login"
            className="products-logout"
          >
            EXIT PANEL
          </Link>

        </div>

      </aside>

      {/* MOBILE HEADER */}

      <header className="products-mobile-header">

        <Link
          href="/admin"
          className="products-mobile-brand"
        >
          STOKED{" "}
          <span>BD</span>
        </Link>

        <Link
          href="/admin/login"
          className="products-mobile-exit"
        >
          EXIT
        </Link>

      </header>

      {/* MAIN */}

      <section className="products-main">

        <div className="products-wrapper">

          <div className="products-topline">

            <span>
              STOKED BD / ADMIN
            </span>

            <span>
              CONTROL // 003
            </span>

          </div>

          {/* HERO */}

          <section className="products-hero">

            <div className="products-kicker">
              INVENTORY MANAGEMENT
            </div>

            <div className="products-hero-bottom">

              <h1>
                PRO
                <br />
                DUCTS
              </h1>

              <div className="products-hero-meta">

                <div className="products-red-line" />

                <span>
                  CREATE AND MANAGE
                  <br />
                  STORE PRODUCTS
                </span>

              </div>

            </div>

          </section>

          {/* ADD PRODUCT */}

          <section className="product-manager">

            <div className="product-section-heading">
              <span>01</span>
              ADD PRODUCT
            </div>

            <form
              className="product-add-form"
              onSubmit={
                addProduct
              }
            >

              <div className="product-form-grid">

                {/* NAME */}

                <div className="product-field">

                  <label>
                    PRODUCT NAME
                  </label>

                  <input
                    value={name}
                    onChange={(e) =>
                      handleNameChange(
                        e.target.value
                      )
                    }
                    placeholder="ENTER PRODUCT NAME"
                  />

                </div>

                {/* SLUG */}

                <div className="product-field">

                  <label>
                    PRODUCT SLUG
                  </label>

                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        generateSlug(
                          e.target.value
                        )
                      )
                    }
                    placeholder="PRODUCT-SLUG"
                  />

                </div>

                {/* COLLECTION */}

                <div className="product-field">

                  <label>
                    COLLECTION
                  </label>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      SELECT COLLECTION
                    </option>

                    {categories.map(
                      (item) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {item.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* PRICE */}

                <div className="product-field">

                  <label>
                    PRICE / BDT
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="1490"
                  />

                </div>

                {/* STATUS */}

                <div className="product-field">

                  <label>
                    STATUS
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="AVAILABLE">
                      AVAILABLE
                    </option>

                    <option value="UNAVAILABLE">
                      UNAVAILABLE
                    </option>

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="product-field">

                  <label>
                    DESCRIPTION
                  </label>

                  <textarea
                    value={
                      description
                    }
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="ENTER PRODUCT DESCRIPTION"
                    rows={4}
                  />

                </div>

                {/* MAIN IMAGE */}

                <div className="product-field image-upload-field">

                  <label>
                    MAIN IMAGE / THUMBNAIL
                  </label>

                  <label className="product-upload-box">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleMainImage
                      }
                    />

                    {mainPreview ? (
                      <div className="product-upload-preview">

                        <img
                          src={
                            mainPreview
                          }
                          alt="Main preview"
                        />

                        <span>
                          MAIN IMAGE
                        </span>

                      </div>
                    ) : (
                      <div className="product-upload-placeholder">

                        <strong>
                          + UPLOAD MAIN IMAGE
                        </strong>

                        <span>
                          JPG / PNG / WEBP
                        </span>

                      </div>
                    )}

                  </label>

                  {mainImage && (
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={
                        removeMainImage
                      }
                    >
                      REMOVE MAIN IMAGE
                    </button>
                  )}

                </div>

                {/* MORE IMAGES */}

                <div className="product-field image-upload-field">

                  <label>
                    UPLOAD MORE IMAGES
                  </label>

                  <label className="product-upload-box more-images-box">

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleMoreImages
                      }
                    />

                    {morePreviews.length >
                    0 ? (
                      <div className="more-images-preview-grid">

                        {morePreviews.map(
                          (
                            preview,
                            index
                          ) => (
                            <div
                              className="more-image-preview"
                              key={`${preview}-${index}`}
                            >

                              <img
                                src={
                                  preview
                                }
                                alt={`Additional ${
                                  index +
                                  1
                                }`}
                              />

                              <span>
                                {index +
                                  1}
                              </span>

                            </div>
                          )
                        )}

                      </div>
                    ) : (
                      <div className="product-upload-placeholder">

                        <strong>
                          + UPLOAD MORE IMAGES
                        </strong>

                        <span>
                          SELECT MULTIPLE IMAGES
                        </span>

                      </div>
                    )}

                  </label>

                  {moreImages.length >
                    0 && (
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => {
                        setMoreImages(
                          []
                        );

                        setMorePreviews(
                          []
                        );
                      }}
                    >
                      CLEAR ADDITIONAL IMAGES
                    </button>
                  )}

                </div>

                {/* AVAILABLE SIZES */}

                <div
                  className="product-field"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >

                  <label>
                    AVAILABLE SIZES
                  </label>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(4, minmax(0, 1fr))",
                      gap: "12px",
                      marginTop:
                        "12px",
                    }}
                  >

                    {sizes.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item.size
                          }
                          style={{
                            position:
                              "relative",
                            overflow:
                              "hidden",
                            border:
                              item.selected
                                ? "1px solid rgba(255,45,45,0.75)"
                                : "1px solid rgba(255,255,255,0.10)",
                            background:
                              item.selected
                                ? "linear-gradient(145deg, rgba(90,0,0,0.55), rgba(20,5,5,0.9))"
                                : "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
                            padding:
                              "16px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              marginBottom:
                                "14px",
                            }}
                          >

                            <label
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "10px",
                                cursor:
                                  "pointer",
                                margin:
                                  0,
                              }}
                            >

                              <input
                                type="checkbox"
                                checked={
                                  item.selected
                                }
                                onChange={() =>
                                  toggleSize(
                                    index
                                  )
                                }
                              />

                              <span
                                style={{
                                  fontSize:
                                    "18px",
                                  fontWeight:
                                    700,
                                  letterSpacing:
                                    "0.12em",
                                }}
                              >
                                {
                                  item.size
                                }
                              </span>

                            </label>

                            <span>
                              {item.selected
                                ? "ACTIVE"
                                : "OFF"}
                            </span>

                          </div>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.stock
                            }
                            disabled={
                              !item.selected
                            }
                            onChange={(
                              e
                            ) =>
                              updateSizeStock(
                                index,
                                e.target
                                  .value
                              )
                            }
                            placeholder="STOCK"
                            style={{
                              width:
                                "100%",
                              height:
                                "42px",
                              padding:
                                "0 12px",
                              border:
                                "1px solid rgba(255,255,255,0.09)",
                              background:
                                "rgba(0,0,0,0.35)",
                              color:
                                "#fff",
                            }}
                          />

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* SIZE CHART */}

                <div
                  className="product-field image-upload-field"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >

                  <label>
                    SIZE CHART IMAGE
                  </label>

                  <label className="product-upload-box">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleSizeChartImage
                      }
                    />

                    {sizeChartPreview ? (
                      <div className="product-upload-preview">

                        <img
                          src={
                            sizeChartPreview
                          }
                          alt="Size chart"
                        />

                        <span>
                          SIZE CHART
                        </span>

                      </div>
                    ) : (
                      <div className="product-upload-placeholder">

                        <strong>
                          + UPLOAD SIZE CHART
                        </strong>

                        <span>
                          JPG / PNG / WEBP
                        </span>

                      </div>
                    )}

                  </label>

                  {sizeChartImage && (
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={
                        removeSizeChart
                      }
                    >
                      REMOVE SIZE CHART
                    </button>
                  )}

                </div>

              </div>

              <button
                type="submit"
                disabled={adding}
                className="product-add-button"
              >

                {adding
                  ? "UPLOADING PRODUCT..."
                  : "ADD PRODUCT"}

                <span>
                  ↗
                </span>

              </button>

            </form>

          </section>

          {/* EDIT PRODUCT */}

          {editingProduct && (
            <section
              id="edit-product-section"
              className="product-manager"
              style={{
                marginTop:
                  "70px",
                border:
                  "1px solid rgba(255,45,45,0.25)",
                background:
                  "rgba(30,0,0,0.22)",
              }}
            >

              <div className="product-section-heading">

                <span>
                  EDIT
                </span>

                EDIT PRODUCT

              </div>

              <form
                className="product-add-form"
                onSubmit={
                  saveProductEdit
                }
              >

                <div
                  style={{
                    marginBottom:
                      "25px",
                    padding:
                      "14px 16px",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    background:
                      "rgba(255,255,255,0.025)",
                    color:
                      "rgba(255,255,255,0.55)",
                    fontSize:
                      "9px",
                    letterSpacing:
                      "0.16em",
                  }}
                >
                  EDITING /{" "}
                  <strong
                    style={{
                      color:
                        "#fff",
                    }}
                  >
                    {
                      editingProduct.name
                    }
                  </strong>
                </div>

                <div className="product-form-grid">

                  {/* NAME */}

                  <div className="product-field">

                    <label>
                      PRODUCT NAME
                    </label>

                    <input
                      value={
                        editName
                      }
                      onChange={(e) =>
                        setEditName(
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                  {/* SLUG */}

                  <div className="product-field">

                    <label>
                      PRODUCT SLUG
                    </label>

                    <input
                      value={
                        editSlug
                      }
                      onChange={(e) =>
                        setEditSlug(
                          generateSlug(
                            e.target
                              .value
                          )
                        )
                      }
                    />

                  </div>

                  {/* CATEGORY */}

                  <div className="product-field">

                    <label>
                      COLLECTION
                    </label>

                    <select
                      value={
                        editCategoryId
                      }
                      onChange={(e) =>
                        setEditCategoryId(
                          e.target
                            .value
                        )
                      }
                    >

                      <option value="">
                        SELECT COLLECTION
                      </option>

                      {categories.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* PRICE */}

                  <div className="product-field">

                    <label>
                      PRICE / BDT
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        editPrice
                      }
                      onChange={(e) =>
                        setEditPrice(
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                  {/* STATUS */}

                  <div className="product-field">

                    <label>
                      STATUS
                    </label>

                    <select
                      value={
                        editStatus
                      }
                      onChange={(e) =>
                        setEditStatus(
                          e.target
                            .value
                        )
                      }
                    >

                      <option value="AVAILABLE">
                        AVAILABLE
                      </option>

                      <option value="UNAVAILABLE">
                        UNAVAILABLE
                      </option>

                    </select>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="product-field">

                    <label>
                      DESCRIPTION
                    </label>

                    <textarea
                      value={
                        editDescription
                      }
                      onChange={(e) =>
                        setEditDescription(
                          e.target
                            .value
                        )
                      }
                      rows={4}
                    />

                  </div>

                  {/* MAIN IMAGE */}

                  <div className="product-field image-upload-field">

                    <label>
                      MAIN IMAGE
                    </label>

                    <label className="product-upload-box">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleEditMainImage
                        }
                      />

                      {editMainPreview ? (
                        <div className="product-upload-preview">

                          <img
                            src={
                              editMainPreview
                            }
                            alt="Edit main"
                          />

                          <span>
                            MAIN IMAGE
                          </span>

                        </div>
                      ) : (
                        <div className="product-upload-placeholder">

                          <strong>
                            + REPLACE MAIN IMAGE
                          </strong>

                          <span>
                            KEEP CURRENT IF EMPTY
                          </span>

                        </div>
                      )}

                    </label>

                  </div>

                  {/* MORE IMAGES */}

                  <div className="product-field image-upload-field">

                    <label>
                      ADD MORE IMAGES
                    </label>

                    <label className="product-upload-box">

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                          handleEditMoreImages
                        }
                      />

                      {editMorePreviews.length >
                      0 ? (
                        <div className="more-images-preview-grid">

                          {editMorePreviews.map(
                            (
                              preview,
                              index
                            ) => (
                              <div
                                className="more-image-preview"
                                key={`${preview}-${index}`}
                              >

                                <img
                                  src={
                                    preview
                                  }
                                  alt={`New ${index}`}
                                />

                                <span>
                                  NEW
                                </span>

                              </div>
                            )
                          )}

                        </div>
                      ) : (
                        <div className="product-upload-placeholder">

                          <strong>
                            + ADD MORE IMAGES
                          </strong>

                          <span>
                            CURRENT IMAGES WILL STAY
                          </span>

                        </div>
                      )}

                    </label>

                  </div>

                  {/* EDIT SIZES */}

                  <div
                    className="product-field"
                    style={{
                      gridColumn:
                        "1 / -1",
                    }}
                  >

                    <label>
                      AVAILABLE SIZES / STOCK
                    </label>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(4, minmax(0, 1fr))",
                        gap: "12px",
                        marginTop:
                          "12px",
                      }}
                    >

                      {editSizes.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={
                              item.size
                            }
                            style={{
                              border:
                                item.selected
                                  ? "1px solid rgba(255,45,45,0.75)"
                                  : "1px solid rgba(255,255,255,0.10)",
                              background:
                                item.selected
                                  ? "rgba(80,0,0,0.35)"
                                  : "rgba(255,255,255,0.025)",
                              padding:
                                "16px",
                            }}
                          >

                            <label
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "10px",
                                cursor:
                                  "pointer",
                              }}
                            >

                              <input
                                type="checkbox"
                                checked={
                                  item.selected
                                }
                                onChange={() =>
                                  toggleEditSize(
                                    index
                                  )
                                }
                              />

                              <strong>
                                {
                                  item.size
                                }
                              </strong>

                            </label>

                            <input
                              type="number"
                              min="0"
                              disabled={
                                !item.selected
                              }
                              value={
                                item.stock
                              }
                              onChange={(
                                e
                              ) =>
                                updateEditSizeStock(
                                  index,
                                  e.target
                                    .value
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "42px",
                                marginTop:
                                  "12px",
                                padding:
                                  "0 12px",
                                border:
                                  "1px solid rgba(255,255,255,0.09)",
                                background:
                                  "rgba(0,0,0,0.35)",
                                color:
                                  "#fff",
                              }}
                            />

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  {/* SIZE CHART */}

                  <div
                    className="product-field image-upload-field"
                    style={{
                      gridColumn:
                        "1 / -1",
                    }}
                  >

                    <label>
                      SIZE CHART
                    </label>

                    <label className="product-upload-box">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleEditSizeChart
                        }
                      />

                      {editSizeChartPreview ? (
                        <div className="product-upload-preview">

                          <img
                            src={
                              editSizeChartPreview
                            }
                            alt="Edit size chart"
                          />

                          <span>
                            SIZE CHART
                          </span>

                        </div>
                      ) : (
                        <div className="product-upload-placeholder">

                          <strong>
                            + REPLACE SIZE CHART
                          </strong>

                          <span>
                            KEEP CURRENT IF EMPTY
                          </span>

                        </div>
                      )}

                    </label>

                  </div>

                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "12px",
                    marginTop:
                      "20px",
                  }}
                >

                  <button
                    type="submit"
                    disabled={
                      editSaving
                    }
                    className="product-add-button"
                    style={{
                      flex: 1,
                    }}
                  >

                    {editSaving
                      ? "SAVING CHANGES..."
                      : "SAVE CHANGES"}

                    <span>
                      ↗
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={
                      cancelEdit
                    }
                    disabled={
                      editSaving
                    }
                    style={{
                      width:
                        "180px",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      background:
                        "rgba(255,255,255,0.03)",
                      color:
                        "rgba(255,255,255,0.65)",
                      cursor:
                        "pointer",
                      letterSpacing:
                        "0.14em",
                      fontSize:
                        "8px",
                    }}
                  >
                    CANCEL
                  </button>

                </div>

              </form>

            </section>
          )}

          {/* MESSAGE */}

          {message && (
            <div
              className="product-message"
              style={{
                marginTop:
                  "25px",
              }}
            >
              {message}
            </div>
          )}

          {/* INVENTORY */}

          <section className="inventory-section">

            <div className="product-section-heading">

              <span>
                02
              </span>

              PRODUCT INVENTORY

            </div>

            <div className="inventory-list">

              {loading ? (

                <div className="inventory-empty">
                  LOADING PRODUCTS...
                </div>

              ) : products.length ===
                0 ? (

                <div className="inventory-empty">
                  NO PRODUCTS FOUND.
                </div>

              ) : (

                products.map(
                  (
                    product,
                    index
                  ) => {

                    const image =
                      getProductImage(
                        product
                      );

                    return (
                      <div
                        className="inventory-row"
                        key={
                          product.id
                        }
                      >

                        <div className="inventory-number">

                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </div>

                        <div className="inventory-image">

                          {image ? (
                            <img
                              src={
                                image
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <span>
                              STOKED
                            </span>
                          )}

                        </div>

                        <div className="inventory-info">

                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <span>
                            {product
                              .category
                              ?.name ||
                              "NO COLLECTION"}
                          </span>

                        </div>

                        <div className="inventory-type">

                          {
                            product.status
                          }

                        </div>

                        <div className="inventory-price">

                          ৳{" "}
                          {
                            product.price
                          }

                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            alignItems:
                              "center",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              openEditProduct(
                                product
                              )
                            }
                            style={{
                              border:
                                "1px solid rgba(255,255,255,0.18)",
                              background:
                                "rgba(255,255,255,0.035)",
                              color:
                                "#fff",
                              padding:
                                "10px 14px",
                              cursor:
                                "pointer",
                              fontSize:
                                "7px",
                              letterSpacing:
                                "0.14em",
                            }}
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            className="inventory-delete"
                            onClick={() =>
                              deleteProduct(
                                product
                              )
                            }
                          >
                            DELETE
                          </button>

                        </div>

                      </div>
                    );
                  }
                )

              )}

            </div>

          </section>

          {/* FOOTER */}

          <footer className="products-footer">

            <span>
              © 2026 STOKED BD
            </span>

            <span>
              PRODUCT MANAGEMENT SYSTEM
            </span>

            <span>
              EST. 2026
            </span>

          </footer>

        </div>

      </section>

    </main>
  );
}