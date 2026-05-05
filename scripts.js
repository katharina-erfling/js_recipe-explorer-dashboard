(() => {
  // ===== DOM & VARIABLES =====
  const RECIPES_URL = 'https://dummyjson.com/recipes';

  const searchInput = document.querySelector('#search-input');
  const searchButton = document.querySelector('#search-button');
  const recipesTableBody = document.querySelector('#recipes-table tbody');
  const loadingIndicator = document.querySelector('#loading');
  const errorMessage = document.querySelector('#error-message');

  const modal = document.querySelector('#recipe-modal');
  const modalTitle = document.querySelector('#modal-title');
  const modalImage = document.querySelector('#modal-image');
  const modalCategory = document.querySelector('#modal-category');
  const modalTime = document.querySelector('#modal-time');
  const modalIngredients = document.querySelector('#modal-ingredients');
  const modalInstructions = document.querySelector('#modal-instructions');
  const closeModal = document.querySelector('.close');

  const statTotal = document.querySelector('#stat-total');
  const statAvg = document.querySelector('#stat-avg');
  const statCuisines = document.querySelector('#stat-cuisines');
  const cuisineBars = document.querySelector('#cuisine-bars');

  let allRecipes = [];

  // ===== INIT =====
  const init = () => {
    fetchAndDisplayRecipes();

    searchButton.addEventListener('click', searchButtonEvent);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchButtonEvent();
    });
    closeModal.addEventListener('click', closeModalEvent);
    window.addEventListener('click', windowClickEvent);
  };

  // ===== EVENT LISTENERS =====
  const searchButtonEvent = () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query !== '') {
      searchRecipes(query);
    } else {
      displayRecipes(allRecipes);
    }
  };

  // Close Modal Event
  const closeModalEvent = () => {
    modal.style.display = 'none';
  };

  // Close Modal when clicking outside the modal content
  const windowClickEvent = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  // ===== FUNCTIONS =====
  // Fetches all recipes from the API and displays them.
  const fetchAndDisplayRecipes = async () => {
    showLoading(true);
    showError(false, '');

    try {
      const response = await fetch(`${RECIPES_URL}?limit=0`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      allRecipes = data.recipes || [];
      displayRecipes(allRecipes);
      updateStats(allRecipes);
    } catch (error) {
      console.error(error);
      showError(true, 'An error occurred while fetching recipes.');
    } finally {
      showLoading(false);
    }
  };

  // Searches for recipes by name and displays the results.
  const searchRecipes = async (query) => {
    showLoading(true);
    showError(false, '');

    try {
      const response = await fetch(`${RECIPES_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const results = data.recipes || [];
      displayRecipes(results);
    } catch (error) {
      console.error(error);
      showError(true, 'An error occurred while searching for recipes.');
    } finally {
      showLoading(false);
    }
  };

  // Displays a list of recipes in the table.
  const displayRecipes = (recipes) => {
    clearTable();

    if (recipes.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="3" style="text-align:center;color:#6b7280;">No recipes found.</td>';
      recipesTableBody.appendChild(tr);
      return;
    }

    recipes.forEach((recipe) => {
      const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${recipe.name}</td>
        <td>${recipe.cuisine}</td>
        <td>${totalTime}</td>
      `;
      tr.addEventListener('click', () => showRecipeDetails(recipe));
      recipesTableBody.appendChild(tr);
    });
  };

  // Displays detailed information about a selected recipe in a modal.
  const showRecipeDetails = (recipe) => {
    const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

    modalTitle.textContent = recipe.name;
    modalCategory.textContent = recipe.cuisine;
    modalTime.textContent = totalTime;

    const img = Array.isArray(recipe.image) ? recipe.image[0] : recipe.image;
    modalImage.src = img || '';
    modalImage.style.display = img ? 'block' : 'none';

    modalIngredients.innerHTML = '';
    (recipe.ingredients || []).forEach((ingredient) => {
      const li = document.createElement('li');
      li.textContent = ingredient;
      modalIngredients.appendChild(li);
    });

    const instructions = Array.isArray(recipe.instructions)
      ? recipe.instructions.join(' ')
      : (recipe.instructions || '');
    modalInstructions.textContent = instructions;

    modal.style.display = 'block';
  };

  // Updates the statistics section.
  const updateStats = (recipes) => {
    const total = recipes.length;
    const avg = total
      ? Math.round(
          recipes.reduce((s, r) => s + (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0), 0) / total
        )
      : 0;

    const cuisineMap = {};
    recipes.forEach((r) => {
      cuisineMap[r.cuisine] = (cuisineMap[r.cuisine] || 0) + 1;
    });
    const cuisineEntries = Object.entries(cuisineMap).sort((a, b) => b[1] - a[1]);
    const maxCount = cuisineEntries[0]?.[1] || 1;

    statTotal.textContent = total;
    statAvg.textContent = avg;
    statCuisines.textContent = cuisineEntries.length;

    cuisineBars.innerHTML = '';
    cuisineEntries.forEach(([name, count]) => {
      const pct = Math.round((count / maxCount) * 100);
      const row = document.createElement('div');
      row.className = 'cuisine-row';
      row.innerHTML = `
        <div class="c-name" title="${name}">${name}</div>
        <div class="c-bar-wrap"><div class="c-bar" style="width:${pct}%"></div></div>
        <div class="c-count">${count}</div>
      `;
      cuisineBars.appendChild(row);
    });
  };

  // Shows or hides the loading indicator.
  const showLoading = (show) => {
    loadingIndicator.style.display = show ? 'block' : 'none';
  };

  // Displays or hides an error message.
  const showError = (show, message) => {
    if (show) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    } else {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
    }
  };

  // Clears the recipes table.
  const clearTable = () => {
    recipesTableBody.innerHTML = '';
  };

  // ===== CALL INIT =====
  init();
})();