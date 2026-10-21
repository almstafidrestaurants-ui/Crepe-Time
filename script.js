
/* ===================================
   CREPE TIME - LOADING ANIMATION
=================================== */

document.addEventListener("DOMContentLoaded", function () {
    const progressBar = document.getElementById("loadingProgress");
    const splashScreen = document.getElementById("splash");
    const menuScreen = document.getElementById("menuScreen");

    if (progressBar) {
        const duration = 4000;
        const startTime = performance.now();

        function updateProgress(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);

            progressBar.style.width = progress + "%";

            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            } else {
                setTimeout(function () {
                    if (splashScreen) {
                        splashScreen.style.display = "none";
                    }

                    if (menuScreen) {
                        menuScreen.hidden = false;
                        menuScreen.classList.add("menu-visible");
                    }
                }, 350);
            }
        }

        requestAnimationFrame(updateProgress);
    } else {
        console.error("لم يتم العثور على loadingProgress");
    }
});


/* ===================================
   CREPE TIME - MENU SYSTEM
   Product data is stored in HTML
=================================== */

document.addEventListener("DOMContentLoaded", function () {
    const productsGrid = document.getElementById("productsGrid");
    const categoryButtons = document.querySelectorAll(".category-btn");
    const menuItems = document.querySelectorAll("#menuData .menu-item");

    if (!productsGrid) {
        console.error("لم يتم العثور على productsGrid");
        return;
    }


    /* ===================================
       READ PRODUCTS FROM HTML
    =================================== */

    function getProductsByCategory(category) {
        return Array.from(menuItems)
            .filter(function (item) {
                return item.dataset.category === category;
            })
            .map(function (item) {
                const image = item.querySelector("img");

                return {
                    name: item.dataset.name || "Unnamed Product",
                    description: item.dataset.description || "",
                    price: item.dataset.price || "0",
                    
                    image: image ? image.getAttribute("src") : "",
                    imageAlt: image ? image.getAttribute("alt") : ""
                };
            });
    }


    /* ===================================
       CREATE PRODUCT CARD
    =================================== */

    function createProductCard(product, index) {
        const card = document.createElement("article");
        card.className = "product-card";
        card.style.animationDelay = `${index * 60}ms`;

        // منطقة صورة المنتج
        const imageContainer = document.createElement("div");
        imageContainer.className = "product-image";

        if (product.image) {
            const image = document.createElement("img");

            image.src = product.image;
            image.alt = product.imageAlt || product.name;
            image.loading = "lazy";
            image.decoding = "async";

            image.addEventListener("error", function () {
                imageContainer.classList.add("image-error");
                image.remove();

                console.warn(
                    "تعذر تحميل صورة المنتج:",
                    product.image
                );
            });

            imageContainer.appendChild(image);
        } else {
            imageContainer.classList.add("image-error");
        }


        // معلومات المنتج
        const productInfo = document.createElement("div");
        productInfo.className = "product-info";

        const productName = document.createElement("h3");
        productName.textContent = product.name;

        const productDescription = document.createElement("p");
        productDescription.textContent = product.description;


        // السعر وزر التفاصيل
        const productBottom = document.createElement("div");
        productBottom.className = "product-bottom";

        const productPrice = document.createElement("span");
        productPrice.className = "product-price";
       productPrice.textContent = product.price + " L.L ";

        const detailButton = document.createElement("button");
        detailButton.className = "product-detail-btn";
        detailButton.type = "button";
        detailButton.textContent = "+";

        detailButton.setAttribute(
            "aria-label",
            "View details for " + product.name
        );


        // عرض تفاصيل المنتج
   

detailButton.addEventListener("click", function () {
    addToCart(product);
});



        // تجميع عناصر البطاقة
        productBottom.append(productPrice, detailButton);

        productInfo.append(
            productName,
            productDescription,
            productBottom
        );

        card.append(imageContainer, productInfo);

        return card;
    }


    /* ===================================
       DISPLAY SELECTED CATEGORY
    =================================== */

    function showCategory(category) {
        productsGrid.replaceChildren();

        const products = getProductsByCategory(category);

        products.forEach(function (product, index) {
            const card = createProductCard(product, index);
            productsGrid.appendChild(card);
        });


        // تحديث حالة أزرار الأقسام

categoryButtons.forEach(function (button) {
    const isActive = button.dataset.category === category;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
});


        // رسالة إذا لم توجد منتجات
        if (products.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.className = "empty-menu-message";
            emptyMessage.textContent = "No products available yet.";

            productsGrid.appendChild(emptyMessage);
        }
    }




categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        showCategory(button.dataset.category);
    });
});

    /* ===================================
       INITIAL CATEGORY
    =================================== */

    showCategory("crepe");
});

/* ===================================
   CREPE TIME - LIVE PRODUCT SEARCH
=================================== */

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("productSearch");
    const productsGrid = document.getElementById("productsGrid");
    const categoryButtons = document.querySelectorAll(".category-btn");
    const menuItems = document.querySelectorAll("#menuData .menu-item");

    if (!searchInput || !productsGrid) return;

    // حفظ القسم المختار
    let activeCategory = "crepe";

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeCategory = button.dataset.category;
            searchInput.value = "";
        });
    });

    // البحث المباشر
    searchInput.addEventListener("input", function () {

        const searchText = searchInput.value.trim().toLowerCase();

        // إذا البحث فارغ، رجّع منتجات القسم الحالي
        if (searchText === "") {
            const activeButton = document.querySelector(
                ".category-btn.active"
            );

            if (activeButton) {
                activeButton.click();
            }

            return;
        }

        // البحث بجميع المنتجات
        const results = Array.from(menuItems).filter(function (item) {

            const name = (item.dataset.name || "").toLowerCase();
            const description = (item.dataset.description || "").toLowerCase();

            return name.includes(searchText) ||
                   description.includes(searchText);
        });

        productsGrid.replaceChildren();

        if (results.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-menu-message";
            message.textContent = "No products found.";
            productsGrid.appendChild(message);
            return;
        }

        results.forEach(function (item) {

            const card = document.createElement("article");
            card.className = "product-card";

            const image = item.querySelector("img");

            const imageContainer = document.createElement("div");
            imageContainer.className = "product-image";

            if (image) {
                const productImage = document.createElement("img");
                productImage.src = image.getAttribute("src");
                productImage.alt = image.alt;
                productImage.loading = "lazy";
                imageContainer.appendChild(productImage);
            }

            const info = document.createElement("div");
            info.className = "product-info";

            const name = document.createElement("h3");
            name.textContent = item.dataset.name;

            const description = document.createElement("p");
            description.textContent = item.dataset.description;

            const bottom = document.createElement("div");
            bottom.className = "product-bottom";

            const price = document.createElement("span");
            price.className = "product-price";
            price.textContent = item.dataset.price + " L.L";

            const button = document.createElement("button");
            button.className = "product-detail-btn";
            button.type = "button";
         button.textContent = "+";
            button.setAttribute(
                "aria-label",
                "View details for " + item.dataset.name
            );

            button.addEventListener("click", function () {
                alert(
                    item.dataset.name +
                    "\n" +
                    item.dataset.description +
                    "\nPrice: " +
                    item.dataset.price + " L.L"
                );
            });

            bottom.append(price, button);
            info.append(name, description, bottom);
            card.append(imageContainer, info);

            productsGrid.appendChild(card);
        });

    });

});

/* ===================================
   CREPE TIME - CART SUCCESS MESSAGE
=================================== */

let toastTimer;

function showCartToast(productName) {
    const toast = document.getElementById("cartToast");
    const message = document.getElementById("toastMessage");

    if (!toast || !message) return;

    clearTimeout(toastTimer);

    message.textContent =
        productName + " added to your cart successfully!";

    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

document.getElementById("closeToast")
    ?.addEventListener("click", function () {
        clearTimeout(toastTimer);
        document.getElementById("cartToast")
            .classList.remove("show");
    });

/* ===================================
   CREPE TIME - SHOPPING CART SYSTEM
=================================== */

document.addEventListener("DOMContentLoaded", function () {

    const cartModal = document.getElementById("shoppingCartModal");
    const cartButton = document.getElementById("cartButton");
    const closeButton = document.getElementById("closeShoppingCart");
    const cartItems = document.getElementById("shoppingCartItems");
    const cartEmpty = document.getElementById("shoppingCartEmpty");
    const cartFooter = document.getElementById("shoppingCartFooter");
    const cartTotal = document.getElementById("shoppingCartTotal");
    const cartCount = document.getElementById("cartCount");
    const exploreButton = document.getElementById("exploreMenuBtn");

    if (!cartModal || !cartItems) return;

    let cart = [];

    // Convert "350 000" to 350000
    function parsePrice(price) {
        return Number(String(price).replace(/[^\d]/g, "")) || 0;
    }

    function formatPrice(price) {
        return price.toLocaleString("en-US") + " L.L";
    }

    // Add a product to the cart
    window.addToCart = function (product) {
        const existing = cart.find(function (item) {
            return item.name === product.name;
        });

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                name: product.name,
                price: parsePrice(product.price),
                image: product.image || "",
                quantity: 1
            });
        }

        updateCart();

        if (typeof showCartToast === "function") {
            showCartToast(product.name);
        }
    };

    function updateCart() {
        cartItems.replaceChildren();

        let total = 0;
        let count = 0;

        cart.forEach(function (product, index) {
            total += product.price * product.quantity;
            count += product.quantity;

            const item = document.createElement("div");
            item.className = "shopping-cart-item";

            const image = document.createElement("img");
            image.className = "shopping-cart-item-image";
            image.src = product.image;
            image.alt = product.name;

            const info = document.createElement("div");
            info.className = "shopping-cart-item-info";

            const name = document.createElement("h3");
            name.className = "shopping-cart-item-name";
            name.textContent = product.name;

            const price = document.createElement("p");
            price.className = "shopping-cart-item-price";
            price.textContent = formatPrice(product.price);

            const quantityBox = document.createElement("div");
            quantityBox.className = "shopping-cart-quantity";

            const minus = document.createElement("button");
            minus.type = "button";
            minus.textContent = "−";
            minus.setAttribute("aria-label", "Decrease quantity");

            const quantity = document.createElement("span");
            quantity.textContent = product.quantity;

            const plus = document.createElement("button");
            plus.type = "button";
            plus.textContent = "+";
            plus.setAttribute("aria-label", "Increase quantity");

            minus.addEventListener("click", function () {
                product.quantity--;

                if (product.quantity <= 0) {
                    cart.splice(index, 1);
                }

                updateCart();
            });

            plus.addEventListener("click", function () {
                product.quantity++;
                updateCart();
            });

            quantityBox.append(minus, quantity, plus);

            info.append(name, price, quantityBox);

            const remove = document.createElement("button");
            remove.className = "shopping-cart-remove";
            remove.type = "button";
            remove.textContent = "×";
            remove.setAttribute("aria-label", "Remove " + product.name);

            remove.addEventListener("click", function () {
                cart.splice(index, 1);
                updateCart();
            });

            item.append(image, info, remove);
            cartItems.appendChild(item);
        });

        cartTotal.textContent = formatPrice(total);
        cartCount.textContent = count;

        cartEmpty.hidden = cart.length > 0;
        cartFooter.hidden = cart.length === 0;
        cartItems.hidden = cart.length === 0;
    }

    // Open cart
    cartButton?.addEventListener("click", function () {
        cartModal.hidden = false;
        document.body.style.overflow = "hidden";
        closeButton?.focus();
    });

    // Close cart
    function closeCart() {
        cartModal.hidden = true;
        document.body.style.overflow = "";
        cartButton?.focus();
    }

    closeButton?.addEventListener("click", closeCart);
    exploreButton?.addEventListener("click", closeCart);

    cartModal.addEventListener("click", function (event) {
        if (event.target === cartModal) {
            closeCart();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !cartModal.hidden) {
            closeCart();
        }
    });

/* ===================================
   LOCATION + WHATSAPP ORDER
=================================== */

const whatsappOrderButton =
    document.getElementById("orderWhatsappBtn");

const locationModal =
    document.getElementById("locationModal");

const activateLocationBtn =
    document.getElementById("activateLocationBtn");

const closeLocationModal =
    document.getElementById("closeLocationModal");

const locationTitle =
    document.getElementById("locationTitle");

const locationDescription =
    document.getElementById("locationDescription");

const locationIcon =
    document.getElementById("locationModalIcon");

const whatsappNumber = "96176637034";

let customerLocation = null;
let locationLoading = false;

function showLocationModal(title, description, icon, buttonText) {
    locationTitle.textContent = title;
    locationDescription.textContent = description;
    locationIcon.textContent = icon;
    activateLocationBtn.textContent = buttonText;
    activateLocationBtn.disabled = false;
    locationModal.hidden = false;
}

function hideLocationModal() {
    if (locationLoading) return;
    locationModal.hidden = true;
}

closeLocationModal?.addEventListener("click", hideLocationModal);

locationModal?.addEventListener("click", function (event) {
    if (event.target === locationModal) {
        hideLocationModal();
    }
});

function getCustomerLocation() {
    return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) {
            reject(new Error("unsupported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            reject,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}

whatsappOrderButton?.addEventListener("click", function () {
    if (cart.length === 0) return;

    if (!customerLocation) {
        showLocationModal(
            "Enable Your Location",
            "Please allow location access so we can deliver your order.",
            "📍",
            "Activate Location"
        );
        return;
    }

    sendWhatsAppOrder();
});

activateLocationBtn?.addEventListener("click", async function () {

    // Success screen: close and let customer order again
    if (customerLocation) {
        hideLocationModal();
        return;
    }

    if (locationLoading) return;

    locationLoading = true;
    activateLocationBtn.disabled = true;
    activateLocationBtn.textContent = "Getting Location...";

    try {
        customerLocation = await getCustomerLocation();

        locationLoading = false;

        showLocationModal(
            "Location Activated!",
            "Your location is ready. Press Order via WhatsApp again to complete your order.",
            "✓",
            "Continue Shopping"
        );

    } catch (error) {
        locationLoading = false;

        let message =
            "Please enable GPS and allow location access, then try again.";

        if (error.code === 1) {
            message =
                "Location permission was denied. Please allow location access in your browser settings.";
        } else if (!window.isSecureContext) {
            message =
                "Please open this website using HTTPS or localhost to enable location.";
        }

        showLocationModal(
            "Location Unavailable",
            message,
            "!",
            "Try Again"
        );
    }
});

function sendWhatsAppOrder() {
    let message = "🍓 *CREPE TIME BY ABU HUSSEIN*\n";
    message += "  *New Order*\n\n";

    let total = 0;

    cart.forEach(function (product, index) {
        const subtotal = product.price * product.quantity;
        total += subtotal;

        message += (index + 1) + ". *" + product.name + "*\n";
        message += "Quantity: " + product.quantity + "\n";
        message += "Subtotal: " + formatPrice(subtotal) + "\n\n";
    });

    message += "  *TOTAL: " + formatPrice(total) + "*\n\n";

    const locationUrl =
        "https://www.google.com/maps?q=" +
        customerLocation.latitude + "," +
        customerLocation.longitude;

    message += "  *Customer Location:*\n";
    message += locationUrl + "\n\n";
    message += "Thank you! ❤️";

    const whatsappUrl =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappUrl, "_blank");
}


    updateCart();
});
