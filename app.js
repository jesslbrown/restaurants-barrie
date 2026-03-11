/**
 * app.js
 * Logic for the Restaurant Directory UI
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Simple Image Lazy Loading Observation
    // We already have loading="lazy" in minds, but just in case we need to trigger class changes:
    const lazyImages = document.querySelectorAll('.lazy-image');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Imagine data-src swapping here if we didn't use real SRCs yet
                img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    }, { rootMargin: "0px 0px 50px 0px" });

    lazyImages.forEach(img => {
        img.style.opacity = '0.7'; // initial state
        img.style.transition = 'opacity 0.4s ease-in';
        imageObserver.observe(img);
    });

    // 3. Simple Element Scroll Reveals
    const animateElements = document.querySelectorAll('.restaurant-card, .category-card, .guide-card, .monetization-content');

    // Add base class to them
    animateElements.forEach(el => el.classList.add('fade-in'));

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve if we only want it to animate once
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => scrollObserver.observe(el));

    // 4. Search Filter Stub (For UI Demo purposes)
    const searchBtn = document.querySelector('.search-bar button');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const val = searchInput.value.trim();
            if (val) {
                alert(`Searching directory for: ${val}\n\n(This would hook into a real backend or JS array filter)`);
            }
        });
    }

    // Interactive Map button listener
    const mapBtn = document.querySelector('.map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            alert('This would expand the map view and load the interactive pins (e.g. Mapbox or Google Maps layer).');
        });
    }

    // 5. Fetch and Render Google Places Data
    const restaurantGrid = document.getElementById('restaurantGrid');
    const allRestaurantGrid = document.getElementById('allRestaurantGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    let allRestaurantsData = [];
    let currentDisplayCount = 5; // How many non-featured restaurants to show initially

    if (restaurantGrid || allRestaurantGrid) {
        fetch('places.json')
            .then(res => res.json())
            .then(data => {
                if (data.places && data.places.length > 0) {
                    // Helper to create a card
                    const createCard = (place, index, isFeatured) => {
                        const name = place.displayName ? place.displayName.text : 'Unknown Restaurant';
                        const rating = place.rating || 'N/A';
                        const reviews = place.userRatingCount || 0;
                        const cuisine = place.primaryTypeDisplayName ? place.primaryTypeDisplayName.text : 'Restaurant';

                        const mapPrice = (level) => {
                            if (level === 'PRICE_LEVEL_INEXPENSIVE') return '$';
                            if (level === 'PRICE_LEVEL_MODERATE') return '$$';
                            if (level === 'PRICE_LEVEL_EXPENSIVE') return '$$$';
                            if (level === 'PRICE_LEVEL_VERY_EXPENSIVE') return '$$$$';
                            return '';
                        };
                        const price = mapPrice(place.priceLevel);

                        const isOpen = place.currentOpeningHours ? place.currentOpeningHours.openNow : false;
                        const statusClass = isOpen ? 'open' : 'closed';
                        const statusText = isOpen ? 'Open Now' : 'Closed';

                        const photoUrl = place.photoUrl || 'https://via.placeholder.com/800x600?text=No+Image';

                        let badgeHtml = '';
                        let cardClass = 'restaurant-card fade-in visible';

                        if (isFeatured) {
                            if (index === 0) {
                                badgeHtml = `<div class="card-badge featured-badge"><i class="ph-fill ph-star"></i> Editor's Pick</div>`;
                                cardClass += ' featured-card';
                            } else if (index === 1) {
                                badgeHtml = `<div class="card-badge trending-badge"><i class="ph-fill ph-fire"></i> Trending</div>`;
                            }
                        }

                        const article = document.createElement('article');
                        article.className = cardClass;
                        article.innerHTML = `
                            ${badgeHtml}
                            <div class="card-image-wrap">
                                <img src="${photoUrl}" alt="${name}" class="lazy-image" style="opacity:1;">
                                <div class="status-indicator ${statusClass}">${statusText}</div>
                            </div>
                            <div class="card-content">
                                <div class="card-meta">
                                    <span class="cuisine">${cuisine}</span>
                                    <span class="price">${price}</span>
                                </div>
                                <h3>${name}</h3>
                                <div class="rating">
                                    <i class="ph-fill ph-star"></i>
                                    <span class="score">${rating}</span>
                                    <span class="reviews">(${reviews >= 1000 ? (reviews / 1000).toFixed(1) + 'k' : reviews})</span>
                                </div>
                                <div class="location">
                                    <i class="ph ph-map-pin"></i> Barrie, ON
                                </div>
                                <div class="card-actions">
                                    <button class="btn-secondary w-full">View Menu</button>
                                    <div class="action-row">
                                        <button class="btn-outline"><i class="ph ph-phone"></i> Call</button>
                                        <button class="btn-outline"><i class="ph ph-navigation-arrow"></i> Directions</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        return article;
                    };

                    // Split data
                    const featuredRestaurants = data.places.slice(0, 3);
                    allRestaurantsData = data.places.slice(3); // The rest

                    // Render Featured
                    if (restaurantGrid) {
                        restaurantGrid.innerHTML = ''; // Clear existing content
                        featuredRestaurants.forEach((place, index) => {
                            restaurantGrid.appendChild(createCard(place, index, true));
                        });
                    }

                    // Render Initial "All" Restaurants
                    const renderAllRestaurants = () => {
                        if (!allRestaurantGrid) return;

                        allRestaurantGrid.innerHTML = ''; // Clear existing content
                        const placesToShow = allRestaurantsData.slice(0, currentDisplayCount);

                        placesToShow.forEach((place, index) => {
                            // Pass false for isFeatured, and continue index from where featured left off
                            allRestaurantGrid.appendChild(createCard(place, index + 3, false));
                        });

                        // Show/Hide Load More Button
                        if (loadMoreContainer) {
                            if (currentDisplayCount < allRestaurantsData.length) {
                                loadMoreContainer.classList.remove('d-none');
                            } else {
                                loadMoreContainer.classList.add('d-none');
                            }
                        }
                    };

                    renderAllRestaurants();

                    // Load More Logic
                    if (loadMoreBtn) {
                        loadMoreBtn.addEventListener('click', () => {
                            currentDisplayCount += 5;
                            renderAllRestaurants();
                        });
                    }
                }
            })
            .catch(err => console.error("Error loading places.json:", err));
    }
});
