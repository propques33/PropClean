const apiKey = 'AIzaSyAHO1TzYBTB55_eOXdD6cmjGPmQqtdGxVs'; // Replace with your API key

document.addEventListener('DOMContentLoaded', () => {
  const languageSelector = document.getElementById('languageSelector');

  // Set the preferred language on page load
  const preferredLanguage = getPreferredLanguage();
  if (languageSelector) {
    languageSelector.value = preferredLanguage;
    languageSelector.addEventListener('change', function() {
      const selectedLanguage = this.value;
      localStorage.setItem('preferredLanguage', selectedLanguage);
      translatePage(selectedLanguage);
    });
  }
  translatePage(preferredLanguage);
});

function getPreferredLanguage() {
  return localStorage.getItem('preferredLanguage') || 'en';
}

async function translatePage(targetLanguage) {
  const elementsToTranslate = document.querySelectorAll('[data-translate]');
  elementsToTranslate.forEach(async (element) => {
    const text = element.innerText;
    const translatedText = await fetchTranslation(text, targetLanguage);
    element.innerText = translatedText;
  });
}

async function fetchTranslation(text, targetLanguage) {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: text,
      target: targetLanguage,
    })
  });
  const data = await response.json();
  return data.data.translations[0].translatedText;
}
