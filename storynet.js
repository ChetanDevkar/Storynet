const ADMIN_SECRET_KEY = 'STORYNET_ADMIN_CHETAN_2004'; 
const FIXED_HEADER_HEIGHT = 64;
const CARDS_PER_PAGE = 9;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function() {
  loadFeedback();

  setupSmoothScrolling();
  
  setupSearch();

  const allCards = document.querySelectorAll('.card-container a');
  if (allCards.length > 0) {
      displayPage(1, Array.from(allCards));
  }

  var resetButton = document.getElementById('reset-feedback');
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      const enteredKey = prompt("Enter the PASSWORD to clear feedback:");

      if (enteredKey === ADMIN_SECRET_KEY) {
        if (confirm("Are you ABSOLUTELY sure you want to clear ALL user feedback .")) {
          clearFeedback();
          alert("All user feedback has been successfully cleared."); 
        }
      } else if (enteredKey !== null) {
        alert("Invalid secret key. Only the website owner can perform this action.");
      }
    });
  }

  document.getElementById('feedback-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var name = document.getElementById('name').value.trim();
    var feedbackText = document.getElementById('feedback').value.trim();
    var rating = document.querySelector('input[name="rating"]:checked');

    if (name && feedbackText && rating) {
      var now = new Date();
      var dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      var ratingValue = parseInt(rating.value);

      var newFeedback = {
        name: name,
        feedback: feedbackText,
        rating: ratingValue,
        date: dateString
      };

      saveFeedback(newFeedback);
      
      displayFeedbackItem(newFeedback);

      document.getElementById('feedback-form').reset();

      if (rating) {
        rating.checked = false;
      }
    }
  });
});

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');

    if (searchInput) {
        searchInput.addEventListener('input', searchHeroes);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', searchHeroes);
    }
}

function searchHeroes() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const heroCards = document.querySelectorAll('.card-container a');
    
    const visibleCards = [];
    heroCards.forEach(cardWrapper => {
        const card = cardWrapper.querySelector('.card');
        if (!card) return;

        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        const isMatch = name.includes(searchTerm) || description.includes(searchTerm);
        
        if (isMatch) {
            visibleCards.push(cardWrapper);
        }
    });

    currentPage = 1;
    
    if (searchTerm.length > 0) {
        scrollToElement('#featured-heroes');
        displayPage(currentPage, visibleCards);
    } else {
        displayPage(currentPage, Array.from(heroCards));
    }
}


function displayPage(pageNumber, cardsToPaginate) {
    if (!cardsToPaginate || cardsToPaginate.length === 0) {
        renderPagination(0, cardsToPaginate);
        return;
    }
    
    currentPage = pageNumber;
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    
    const allCards = document.querySelectorAll('.card-container a');
    allCards.forEach(card => card.style.display = 'none');
    
    cardsToPaginate.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    renderPagination(cardsToPaginate.length, cardsToPaginate);
}

function renderPagination(totalVisibleCards, cardsToPaginate) {
    const controlsContainer = document.getElementById('pagination-controls');
    if (!controlsContainer) return;
    
    controlsContainer.innerHTML = '';
    
    const totalPages = Math.ceil(totalVisibleCards / CARDS_PER_PAGE);

    if (totalPages <= 1) {
        return;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-button';
        
        if (i === currentPage) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => {
            displayPage(i, cardsToPaginate);
            
            scrollToElement('#featured-heroes');
        });
        
        controlsContainer.appendChild(button);
    }
}


function scrollToElement(targetId) {
    if (targetId === '#') {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return;
    }

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - FIXED_HEADER_HEIGHT;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}


function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault(); 
      
      const targetHref = this.getAttribute('href');
      
      // Check if the link contains a page number parameter
      const match = targetHref.match(/#([^?]+)\?page=(\d+)/);

      if (match) {
        const targetId = `#${match[1]}`;
        const pageNumber = parseInt(match[2]);
        
        // Find all cards (handles search filtering if active)
        const allCards = Array.from(document.querySelectorAll('.card-container a'));
        
        // 1. Display the correct page
        displayPage(pageNumber, allCards); 
        
        // 2. Scroll to the featured heroes section
        scrollToElement(targetId);
        
      } else {
        // Standard smooth scrolling logic for links like a href="#featured-heroes"
        const targetId = targetHref;
        scrollToElement(targetId);
      }
    });
  });
}

function saveFeedback(feedbackItem) {
  var feedbackArray = JSON.parse(localStorage.getItem('storynetFeedback')) || [];

  feedbackArray.unshift(feedbackItem);

  localStorage.setItem('storynetFeedback', JSON.stringify(feedbackArray));
}

function loadFeedback() {
  var feedbackArray = JSON.parse(localStorage.getItem('storynetFeedback'));
  var feedbackList = document.getElementById('feedback-list');
  
  feedbackList.innerHTML = '';

  if (feedbackArray && feedbackArray.length > 0) {
    feedbackArray.forEach(function(item) {
      displayFeedbackItem(item);
    });
  }
}

function formatStars(ratingValue) {
  var fullStars = '★'.repeat(ratingValue);
  var emptyStars = '☆'.repeat(5 - ratingValue);
  return '<span style="color: #ffc107; font-size: 1.1em;">' + fullStars + '</span>' + 
         '<span style="color: #ccc; font-size: 1.1em;">' + emptyStars + '</span>';
}

function displayFeedbackItem(item) {
  var feedbackList = document.getElementById('feedback-list');
  var starsDisplay = formatStars(item.rating);

  var feedbackItem = document.createElement('div');
  feedbackItem.className = 'feedback-item';
  
  feedbackItem.innerHTML = 
    '<p style="margin: 0 0 5px 0;">' + 
    '<strong>' + item.name + '</strong> - ' + starsDisplay + 
    '<span style="float: right; color: #777; font-size: 0.85em;">' + item.date + '</span>' +
    '</p>' +
    '<p style="margin: 0; padding-left: 10px;">' + item.feedback + '</p>';
  
  feedbackList.prepend(feedbackItem);
}

function clearFeedback() {
  localStorage.removeItem('storynetFeedback');
  loadFeedback();

}
